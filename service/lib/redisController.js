const redisClient = require('ioredis');
const config = require('./config');
const redis = new redisClient(config.get('redis'));

module.exports = redis;
