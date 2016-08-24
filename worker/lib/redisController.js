const redisClient = require('ioredis');
let config = require('./config.js');

let redis = new redisClient(config.get('redis'), {dropBufferSupport: true});

module.exports = redis;
