const fs = require('fs');

const cidrJS = require('cidr-js');
let cidr = new cidrJS();
const glob = require('glob-all');

const repo = require('./lib/repoController');
const netParser = require('./lib/netParser');
const config = require('./lib/config.js');

const REPO_PATH = './../../repo'; //keep this out of our own git root
const EXPIRE_TIME = 60 * 60 * 24; //one day

const OUTPUT_FILE = './bulkRedis.txt';

try{
  fs.unlinkSync(OUTPUT_FILE); //this can fail, we don't care
}catch(e){
  //don't care
}
let redisFile = fs.createWriteStream(OUTPUT_FILE);
redisFile.setDefaultEncoding('utf8');

let files = null;
let addresses = {};
let ranges = {};

function writeBulkFile(ipArr, valueOverride, cb){
  let shouldContinue = false;
  for(var i = 0; i < ipArr.length; i++){
    let ip = ipArr[i];
    let value =  valueOverride?valueOverride:addresses[ip];
    value = JSON.stringify(JSON.stringify(value));
    shouldContinue = redisFile.write(`*4\r\n$5\r\nSETEX\r\n$${ip.length}\r\n${ip}\r\n$5\r\n${EXPIRE_TIME}\r\n$${value.length}\r\n${value}\r\n`);
  }
  if(shouldContinue){
    return cb();
  }else{
    redisFile.once('drain', cb);
  }

}

function processFile(){
  file = files.shift();
  let results = netParser.parseFile(fs.readFileSync(file, 'utf8'));
  let filename = file.split('/');
  filename = filename[filename.length - 1];
  for(let i = 0; i < results.addresses.length; i++){
    if(!addresses[results.addresses[i]]){
      addresses[results.addresses[i]] = [];
    }
    addresses[results.addresses[i]].push(filename);
  }
  results.addresses = null;
  for(let i = 0; i < results.ranges.length; i++){
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
  if(Object.keys(ranges).length <= 0){
    return cb();
  }
  let currentRange = Object.keys(ranges).shift();
  // /*
  //  * We want to grab a random key from our object without duplicating the keyspace with a keys() call
  //  */
  // for(let x in ranges){
  //   currentRange = x;
  //   break;
  // }
  let rangeVal = ranges[currentRange];
  delete ranges[currentRange];
  writeBulkFile(cidr.list(currentRange), rangeVal, processRange);
}


// repo.update(function(){
  files = glob.sync([REPO_PATH + '/*.@(ipset|netset)', `!*bogons*`]);
  files = files.filter((name)=>{
    return name.indexOf('bogons') === -1;
  });
  console.log('Reading files...');
  while(files.length) processFile();
  console.log('Writing individual addresses...');
  writeBulkFile(Object.keys(addresses), null, ()=>{
    console.log('Expanding and writing ranges...');
    addresses = null;
    processRange(()=>{
      redisFile.end(()=>{
        console.log('Finished');
        process.exit(0);
      });
    });
  });

// });
