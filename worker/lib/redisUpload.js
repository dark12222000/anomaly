const exec = require('child_process').exec;

let config = require('./config.js');

module.exports = function(cb){
  let redisCfg = config.get('redis');
  let cmd = `cat bulkRedis.txt | redis-cli --pipe -h ${redisCfg.host} -p ${redisCfg.port}`; //we always have a host and port
  if(redisCfg.password) cmd+=  `-a ${redisCfg.password}`; //but not always a password and redis-cli hates an empty -a
  exec(cmd, cb); //fire off the command, call cb when it's done
};
