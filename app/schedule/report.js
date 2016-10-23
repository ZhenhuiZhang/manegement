var schedule = require('node-schedule');
var gift_item_day = require('../bll/day_report/gift_item')
var live_logs_day = require('../bll/day_report/live_logs')
var pay_item_day = require('../bll/day_report/pay_item')
var gift_item_month = require('../bll/month_report/gift_item')
var live_logs_month = require('../bll/month_report/live_logs')
var pay_item_month= require('../bll/month_report/pay_item')
var logger = require('../common/logger').logger('report');

module.exports = function() {
    var rule = new schedule.RecurrenceRule();
    rule.hour =5;rule.minute =20;rule.second =0;  //每天5点运行 报表聚合

    var j = schedule.scheduleJob(rule,function() {
        logger.info('build report start,wait')
        gift_item_day(gift_item_month,live_logs_day,live_logs_month,0);
        // live_logs_day(live_logs_month);
        pay_item_day(pay_item_month,0);
    })
}