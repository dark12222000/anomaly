const fs = require('fs');
const path = require('path');

const cidrJS = require('cidr-js'); //used to expand netranges
let cidr = new cidrJS();

const repo = require('./lib/repoController');
const netParser = require('./lib/netParser');
const config = require('./lib/config');

const redisUpload = require('./lib/redisUpload');

const REPO_PATH = __dirname+'/../../repo';
const EXPIRE_TIME = 60 * 60 * 24 * 3; //one day

const OUTPUT_FILE = './bulkRedis.txt';

try{
  fs.unlinkSync(OUTPUT_FILE); //this can fail, we don't care
}catch(e){
  //don't care
}
let redisFile = fs.createWriteStream(OUTPUT_FILE); //open a write stream
redisFile.setDefaultEncoding('utf8'); //set encoding now so we don't fuss with it later

let files = null; //we'll hold all of our relevant filepaths here
let addresses = {}; //our ips will be our keys, and the lists they appear on our values
let ranges = {}; //same as above but for netranges ala 127.0.0.1/8

function writeBulkFile(ipArr, valueOverride, cb){
  let shouldContinue = true; //handle our drain event if need be
  for(var i = 0; i < ipArr.length; i++){
    let ip = ipArr[i];
    let value =  valueOverride?valueOverride:addresses[ip];
    value = JSON.stringify(JSON.stringify(value));
    shouldContinue = redisFile.write(`*4\r\n$5\r\nSETEX\r\n$${ip.length}\r\n${ip}\r\n$6\r\n${EXPIRE_TIME}\r\n$${value.length}\r\n${value}\r\n`);
  }
  if(shouldContinue){ //Is everything written?
    return cb(); //then go ahead and continue
  }else{ //otherwise wait for drain
    redisFile.once('drain', cb);
  }

}

function processFile(){
  file = files.shift(); //grab file off stack
  let results = netParser.parseFile(fs.readFileSync(path.join(REPO_PATH, file), 'utf8')); //parse file
  let filename = file.split('/'); //grab filename
  filename = filename[filename.length - 1];
  for(let i = 0; i < results.addresses.length; i++){
    if(!addresses[results.addresses[i]]){
      addresses[results.addresses[i]] = []; //if it isn't in the list, add it
    }
    addresses[results.addresses[i]].push(filename); //our our filename to it
  }
  results.addresses = null;
  for(let i = 0; i < results.ranges.length; i++){ //rinse, repeat
    if(!ranges[results.ranges[i]]){
      ranges[results.ranges[i]] = [];
    }
    ranges[results.ranges[i]].push(filename);
  }
  results.ranges = null;
  results = null;
  return;
}

function processRange(cb){
  if(Object.keys(ranges).length <= 0){ //if no more ranges to process, callback
    return cb();
  }
  let currentRange = Object.keys(ranges).shift(); //otherwise grab top range
  let rangeVal = ranges[currentRange];
  delete ranges[currentRange]; //remove it from the list
  //write it out
  writeBulkFile(cidr.list(currentRange), rangeVal, function(){ return processRange(cb); });
}


repo.update(function(){
  files = fs.readdirSync(REPO_PATH).filter((name)=>{ //make sure no bogons snuck in because glob is silly
    return name.indexOf('bogons') === -1 &&
    ( name.indexOf('.ipset') !== -1 ||
    name.indexOf('.netset') !== -1 );
  });
  console.log(files);
  console.log('Reading files...');
  while(files.length) processFile(); //handle files one by one to keep memory sane
  console.log('Writing individual addresses...');
  writeBulkFile(Object.keys(addresses), null, ()=>{ //these just get written out
    console.log('Expanding and writing ranges...');
    addresses = null; //we're done with these and need all the memory we can get
    processRange(()=>{ //handle our ranges, will write as need be
      redisFile.end(()=>{ //make sure our file is closed out
        console.log('Uploading');
        redisUpload((err, stdout, stderr)=>{ //call redis-cli to upload, this may take a mo
          console.log('Command finished:', stdout, stderr);
          process.exit(0);
        });
      });
    });
  });
});
