const assert = require('chai').assert;
const request = require('request');

const app = require('../index.js');

describe('Anomaly IP Lookup Service', ()=>{
  it('Should return a 400 when I don\'t include an ip address', function(done){
    request.get('http://localhost:3000/', (err, res, body)=>{
      if(err) return done(err);
      assert.equal(res.statusCode, 400, 'Return 400 on bad query');
      return done();
    });
  });
  it('Should return a 404 on a bad IP address', function(done){
    request.get('http://localhost:3000/notanip', (err, res, body)=>{
      if(err) return done(err);
      assert.equal(res.statusCode, 404, 'Return 404 on bad query');
      return done();
    });
  });
  it('Should return a 200 and a response on a good IP lookup', function(done){
    request.get('http://localhost:3000/12.0.0.1', (err, res, body)=>{
      if(err) return done(err);
      assert.equal(res.statusCode, 200, 'Return 200 on a good query');
      assert.isAtLeast(body.length, 3, 'Body has valid contents');
      return done();
    });
  });
});
