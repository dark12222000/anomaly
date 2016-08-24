const fs = require('fs');

const glob = require('glob');
const async = require('async');
const Netmask = require('netmask').Netmask;

const repo = require('./lib/repoController');
const netParser = require('./lib/netParser');
const redis = require('./lib/redisController');

const REPO_PATH = './../../repo'; //keep this out of our own git root
const EXPIRE_TIME = 60 * 60 * 24; //one day

const MAX_BATCH = 25600;

let files = null;

let redisUploadQueue = async.queue(function(task, cb){
  let ips = task.ips;
  let pipeline = redis.pipeline();
  for(var i = 0; i < ips.length; i++){
    pipeline.setex(ips[i], EXPIRE_TIME, 'other');
  }
  pipeline.exec((err, res)=>{
    if(cb) return cb(err, res);
  });
}, 8);

redisUploadQueue.saturated = function(){
  rangeExpansionQueue.pause();
};
redisUploadQueue.drain = function(){
  rangeExpansionQueue.resume();
};

let rangeExpansionQueue = async.queue(function(task, cb){
  console.log(`Processing ${task}`);
  let block = new Netmask(task);
  let ips = [];
  block.forEach((ip)=>{
    ips.push(ip);
    if(ips.length > MAX_BATCH){
      redisUploadQueue.push({ips:ips});
      ips = [];
    }
  });
  redisUploadQueue.push({ips:ips});
  cb(null, true);
}, 1);

rangeExpansionQueue.drain = function(){
  console.log('Finished processing current file');
  global.gc();
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
}

repo.update(function(err){
  files = glob.sync(REPO_PATH + '/*.@(ipset|netset)');
  processFile();
});

function processFile(){
  file = files.pop();
  console.log(`Processing file: ${file}`);
  let data = fs.readFileSync(file, 'utf8');
  if(!data || data instanceof Error){
    console.log('Error', data);
    process.exit(1);
  }
  let results = netParser.parseFile(data);
  processResults(results);
}
