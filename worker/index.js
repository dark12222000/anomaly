const fs = require('fs');

const glob = require('glob-all');
const async = require('async');
const heapdump = require('heapdump');
const CIDR = require('cidr-js');

let cidr = new CIDR();
const netmask = require('netmask');

const repo = require('./lib/repoController');
const netParser = require('./lib/netParser');
const redis = require('./lib/redisController');
const config = require('./lib/config.js');

const REPO_PATH = './../../repo'; //keep this out of our own git root
const EXPIRE_TIME = 60 * 60 * 24; //one day

const MAX_BATCH = 25600;

let files = null;

redis.on('drain', ()=>{
  console.log('redis drained');
  if(redisUploadQueue.paused) redisUploadQueue.resume();
});

let redisUploadQueue = async.queue(function(task, cb){
  for(var i = 0; i < task.ips.length; i++){
    redis.setex(task.ips[i], EXPIRE_TIME, 'other');
    task.ips[i] = null;
  }
  if(redis.should_buffer){
    console.log('Redis buffering');
    redisUploadQueue.pause();
  }
  task.ips = null;
  task = null;
  // task = null;
  // if(cb) return cb(null, true);
}, 1);

redisUploadQueue.saturated = function(){
  rangeExpansionQueue.pause();
};

redisUploadQueue.drain = function(){
  rangeExpansionQueue.resume();
};

let rangeExpansionQueue = async.queue(function(task, cb){
  //console.log(`Processing ${task}`);
  redisUploadQueue.push({ips:cidr.list(task)});
  process.nextTick(cb, null, true);
}, 1);

rangeExpansionQueue.drain = function(){
  //console.log('Finished processing current file');
  // heapdump.writeSnapshot( (err, file)=>{
  //   console.log('Heapdump at ', file);
  // });
  if(files.length > 0){
    processFile();
  }else{
    console.log('Finished processing');
  }
};

// function saveAddresses(ips, cb){
//   let pipeline = redis.pipeline();
//   for(var i = 0; i < ips.length; i++){
//     pipeline.setex(ips[i], EXPIRE_TIME, 'other');
//     ips[i] = null;
//   }
//   pipeline.exec((err, results)=>{
//     console.log('Loose addresses finished uploading');
//     if(cb) return cb();
//   });
// }

function processResults(results){
  redisUploadQueue.push({ips: results.addresses});
  rangeExpansionQueue.push(results.ranges);
  results = null;
}

redis.on('ready', ()=>{
  // repo.update(function(){
    files = glob.sync([REPO_PATH + '/*.@(ipset|netset)', `!*bogons*`]);
    console.log(files);
    files = files.filter((name)=>{
      return name.indexOf('bogons') === -1;
    });
    processFile();
  // });
});

function processFile(){
  file = files.shift();
  console.log(`Processing file: ${file}`);
  console.log(process.memoryUsage());
  if(file.indexOf('spamhaus') !== -1){
    heapdump.writeSnapshot( (err, file)=>{
      console.log('Heapdump at ', file);
    });
  }
  let data = fs.readFileSync(file, 'utf8');
  file = null;
  if(!data || data instanceof Error){
    console.log('Error', data);
    process.exit(1);
  }
  processResults(netParser.parseFile(data));
  data = null;
}
