const glob = require('glob');
const repo = require('./lib/repoController');
const netParser = require('./lib/netParser');
const redis = require('./lib/redisController');

const cidrRange = require('cidr-range');

const REPO_PATH = './../../repo'; //keep this out of our own git root
const EXPIRE_TIME = 60 * 60 * 24; //one day

function errHandler(err){
  console.log(err);
  process.exit(1);
}

function saveAddresses(ips){
  let pipeline = redis.pipeline();
  for(var i = 0; i < ips.length; i++){
    pipeline.setex(ips[i], EXPIRE_TIME, 'other');
  }
  pipeline.exec(errHandler);
}

function processFile(err, results){
  console.log('Processing file');
  saveAddresses(results.addresses);
  for(var i = 0; i < results.ranges.length; i++){
    let range = results.ranges[i];
    saveAddresses(cidrRange(range));
  }
}

repo.update(function(err){
  glob(REPO_PATH + '/*.@(ipset|netset)', (err, files)=> {
    if(err) return errHandler(err);
    if(files.length < 1) return errHandler(new Error('No files found'));

    for(var f = 0; f < files.length; f++){
      netParser.parseFile(files[f], processFile);
    }
  });
});
