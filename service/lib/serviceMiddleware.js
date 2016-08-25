const qs = require('querystring');
const url = require('url');

const redis = require('./redisController.js');

module.exports = function(req, res, next){
  if(req.method !== 'GET') return next();
  let pUrl = url.parse(req.url);
  let query = qs.parse(pUrl.query);
  if(pUrl.pathname.indexOf('/ip') !== 0) return next();
  if(!query.ip){
    res.status = 400;
    return res.end();
  }
  redis.get(query.ip, (err, val)=>{
    if(val) val = JSON.parse(val);
    if(val && val.length){
      res.status = 200;
      res.write(val);
      return res.end();
    }else{
      res.status = 404;
      return res.end();
    }
  });
}
