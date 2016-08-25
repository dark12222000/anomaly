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
let redisFile = fs.openSync(OUTPUT_FILE, 'w');

let files = null;
let addresses = {};
let ranges = {};

function writeBulkFile(ipArr, valueOverride){
  //split into batches
  for(var i = 0; i < ipArr.length; i++){
    let value =  valueOverride?valueOverride:addresses[ipArr[i]];
    value = JSON.stringify(JSON.stringify(value));
    fs.writeSync(redisFile, `*4\r\n$5\r\nSETEX\r\n$${ipArr[i].length}\r\n${ipArr[i]}\r\n$5\r\n${EXPIRE_TIME}\r\n$${value.length}\r\n${value}\r\n`, null, 'utf8');
    ipArr[i] = null;
  }
  ipArr = null;
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

function processRange(){
  for(let x in ranges){
    writeBulkFile(cidr.list(x), ranges[x]);
    delete ranges[x];
  }
}


// repo.update(function(){
  files = glob.sync([REPO_PATH + '/*.@(ipset|netset)', `!*bogons*`]);
  files = files.filter((name)=>{
    return name.indexOf('bogons') === -1;
  });
  while(files.length) processFile();
  writeBulkFile(addresses);
  addresses = null;
  processRange();
// });
