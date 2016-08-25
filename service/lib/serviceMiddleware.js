const qs = require('querystring');
const url = require('url');

const redis = require('./redisController.js');

module.exports = function(req, res, next){
  if(req.method !== 'GET') return next();
  let pUrl = url.parse(req.url);
  let ip = pUrl.pathname.slice(1);
  if(!ip){
    res.statusCode = 400;
    return res.end();
  }
  redis.get(ip, (err, val)=>{
    if(err || !val || val.length < 3){
      res.statusCode = 404;
      return res.end();
    }
    if(val) val = JSON.parse(val);
    res.statusCode = 200;
    res.write(val);
    return res.end();
  });
};
