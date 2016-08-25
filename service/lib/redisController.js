const redisClient = require('ioredis');
const config = require('./config');
const redis = new redisClient(config.get('redis'));

//handle any redis connect/disconnect/reconnect logic here

module.exports = redis;
