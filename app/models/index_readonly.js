var Mongoose = require('mongoose');
var config   = require('../../config');
var logger = require('../common/logger').logger('models');
var Schema    = Mongoose.Schema;

var mongoose;
  logger.info('connect to db_readonly', config.db_readonly);
if (['test','production'].indexOf(process.env.NODE_ENV) > -1) {
    logger.info('connect to db_readonly', config.db_readonly);
    mongoose = Mongoose.createConnection(config.db_readonly,{
        replset: { poolSize: 5}
    },  function (err) {
        if (err) {
            logger.error('connect to %s error: ', config.db, err.message)
            process.exit(1)
        }
    })
} else {
    mongoose = Mongoose.createConnection(config.db, {
        server: { poolSize: 5 }
    }, function (err) {
        if (err) {
            logger.error('connect to %s error: ', config.db, err.message)
            process.exit(1)
        }
    })
}

//注意，修改以下model定义，必要时，需同时修改index.js、index_main. index_readonly.js四个文件

// models
require('./common/gift_item')
require('./common/live_logs')
require('./common/pay_item')
require('./common/friends')
require('./common/user')

exports.GiftItem = mongoose.model('Gift_Item')
exports.LiveLogs = mongoose.model('Live_Logs')
exports.PayItem = mongoose.model('Pay_Item')
exports.Friends = mongoose.model('Friends')
exports.User = mongoose.model('User')