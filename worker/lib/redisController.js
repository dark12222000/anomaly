const redisClient = require('redis');
let config = require('./config.js');

let redis = new redisClient.createClient(config.get('redis'));

module.exports = redis;
