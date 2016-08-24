const heapdump = require('heapdump');

const fs = require('fs');

const cidrJS = require('cidr-js');
let cidr = new cidrJS();
const glob = require('glob-all');

const repo = require('./lib/repoController');
const netParser = require('./lib/netParser');
const redis = require('./lib/redisController');
const config = require('./lib/config.js');

const REPO_PATH = './../../repo'; //keep this out of our own git root
const EXPIRE_TIME = 60 * 60 * 24; //one day
const BATCH_SIZE = 8096;

let files = null;
let addresses = {};
let ranges = {};
let rangeKeys = [];

function redisUpload(ipArr, valueOverride, cb){
  //split into batches
  let multi = redis.multi();
  for(var i = 0; i < ipArr.length; i++){
    let value =  valueOverride?valueOverride:addresses[ipArr[i]];
    multi.setex(ipArr[i], EXPIRE_TIME, JSON.stringify(value));
    ipArr[i] = null;
    if(i > BATCH_SIZE){
      multi.exec();
    }
  }
  ipArr = null;
  multi.exec();
  if(redis.should_buffer){
    console.log('Waiting for redis');
    redis.stream.once('drain', cb);
  }else{
    return cb();
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
  console.log((process.memoryUsage()).heapUsed, file);
  // heapdump.writeSnapshot((err, filename)=>{
  //   console.log(filename);
  // });
  return;
}

function processRange(){
  function cb(){
    if(Object.keys(ranges).length) return process.nextTick(processRange);
  }
  for(let x in ranges){
    console.log(x, ranges[x]);
    redisUpload(cidr.list(x), ranges[x], cb);
    delete ranges[x];
    break;
  }
}

redis.on('ready', ()=>{
  // repo.update(function(){
    files = glob.sync([REPO_PATH + '/*.@(ipset|netset)', `!*bogons*`]);
    files = files.filter((name)=>{
      return name.indexOf('bogons') === -1;
    });
    while(files.length) processFile();
    redisUpload(addresses, null, ()=>{
      addresses = null;
      processRange();
    });
  // });
});
