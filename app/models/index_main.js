var Mongoose = require('mongoose');
var Schema    = Mongoose.Schema;
var config   = require('../../config');
var logger = require('../common/logger').logger('models');


logger.info('connect db', config.db);
var mongoose = Mongoose.createConnection(config.db, {
    server: { poolSize: 10 }
}, function (err) {
    if (err) {
        logger.error('connect to %s error: ', config.db, err.message)
        process.exit(1)
    }
})


//注意，修改以下model定义，必要时，需同时修改index.js、index_main.js、index_readonly.js四个文件

// models
require('./common/gift_item')
require('./common/live_logs')
require('./common/pay_item')
require('./common/user')
require('./common/friends')
require('./common/gift_rank')
require('./common/new_fans_rank')
require('./common/schedule_logs')
require('./common/user_status_logs')
require('./push_logs')
require('./common/config_version')
require('./common/share')
require('./common/live_anchor.js')


exports.GiftItem = mongoose.model('Gift_Item')
exports.LiveLogs = mongoose.model('Live_Logs')
exports.PayItem = mongoose.model('Pay_Item')
exports.User = mongoose.model('User')
exports.Friends = mongoose.model('Friends')
exports.GiftRank = mongoose.model('Gift_Rank')
exports.ScheduleLogs = mongoose.model('Schedule_Logs')
exports.User_Status_Logs = mongoose.model('User_Status_Logs')
exports.PushLogs = mongoose.model('Push_Logs')
exports.ConfigVersion    = mongoose.model('Config_Version')
exports.NewFansRank = mongoose.model('New_Fans_Rank')
exports.Share = mongoose.model('Share')
exports.LiveAnchor    = mongoose.model('Live_Anchor');
