const url = require('url');

const redis = require('./redisController.js');

module.exports = function(req, res, next){
  if(req.method !== 'GET') return next(); //we only support GET
  let pUrl = url.parse(req.url); //grab our url
  let ip = pUrl.pathname.slice(1); //grab our pathname minus the first slash
  if(!ip){ //make sure we have something to search
    res.statusCode = 400;
    return res.end();
  }
  redis.get(ip, (err, val)=>{ //grab it, don't bother validating since a bad response is cheap
    if(err || !val || val.length < 3){ //make sure our return looks like a return
      res.statusCode = 404;
      return res.end();
    }
    if(val) val = JSON.parse(val); //our val is double JSON encoded, we want to decode it once
    res.statusCode = 200; //let them know things went well
    res.write(val); //go ahead and send them our content
    return res.end(); //and we're done
  });
};
