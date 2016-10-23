var Mongoose = require('mongoose');
var Schema    = Mongoose.Schema;
var config   = require('../../config');
var logger = require('../common/logger').logger('models');

logger.info('connect report db', config.db_report);
var mongoose = Mongoose.createConnection(config.db_report, {
    server: { poolSize: 10 }
}, function (err) {
    if (err) {
        logger.error('connect to %s error: ', config.db_report, err.message)
        process.exit(1)
    }
})

require('./report/gift_item_day_report')
require('./report/gift_item_month_report')
require('./report/live_logs_day_report')
require('./report/live_logs_month_report')
require('./report/pay_item_day_report')
require('./report/pay_item_month_report')

exports.GiftItemDayReport = mongoose.model('Gift_Item_Day_Report')
exports.GiftItemMonthReport = mongoose.model('Gift_Item_Month_Report')
exports.LiveLogsDayReport = mongoose.model('Live_Logs_Day_Report')
exports.LiveLogsMonthReport = mongoose.model('Live_Logs_Month_Report')
exports.PayItemDayReport = mongoose.model('Pay_Item_Day_Report')
exports.PayItemMonthReport = mongoose.model('Pay_Item_Month_Report')
// exports.Rank_bak = Rank_bak