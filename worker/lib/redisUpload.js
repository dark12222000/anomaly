const exec = require('child_process').exec;

let config = require('./config.js');
module.exports = function(cb){
  let redisCfg = config.get('redis');
  let cmd = `cat bulkRedis.txt | redis-cli --pipe -h ${redisCfg.host} -p ${redisCfg.port}`;
  if(redisCfg.password) cmd+=  `-a ${redisCfg.password}`;
  exec(cmd, cb);
};
