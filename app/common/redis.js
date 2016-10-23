var config = require('../../config');
var Redis = require('ioredis');
var logger = require('./logger').logger('common');

var client = new Redis({
  port: config.redis_port,
  host: config.redis_host,
  db: config.redis_db,
});

client.on('error', function (err) {
  if (err) {
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
})

exports = module.exports = client;
