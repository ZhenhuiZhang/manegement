//自动运行脚本，生成前一天日报表
var config = require('../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var md5 = require('md5')
var EventProxy = require('eventproxy')
var cms_report_db = require('../app/models/index_report')
var db_readonly = require('../app/models/index_readonly')
var logger = require('../app/common/logger').logger('remove_report');
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var LiveLogsMonthReport =cms_report_db.LiveLogsMonthReport
var GiftItemDayReport =cms_report_db.GiftItemDayReport
var GiftItemMonthReport =cms_report_db.GiftItemMonthReport
var PayItemDayReport =cms_report_db.PayItemDayReport
var PayItemMonthReport =cms_report_db.PayItemMonthReport

var from = getTimezone(new moment('2016-09-30T17:00:00.000Z')).tz("Asia/Jakarta")
var to = getTimezone(new moment('2016-10-30T17:00:00.000Z')).tz("Asia/Jakarta").add(1, 'day')

LiveLogsDayReport.remove({date:{$gte:from.toDate(),$lt:to.toDate()}},function(err){
    if(err) console.log(err)

    logger.info('day report remove success!')
    
    LiveLogsMonthReport.remove({date:{$gte:from.toDate(),$lt:to.toDate()}},function(err){
        if(err) console.log(err)

        logger.info('month report remove success!')
    })
})

GiftItemDayReport.remove({date:{$gte:from.toDate(),$lt:to.toDate()}},function(err){
    if(err) console.log(err)

    logger.info('day report remove success!')
    
    GiftItemMonthReport.remove({date:{$gte:from.toDate(),$lt:to.toDate()}},function(err){
        if(err) console.log(err)

        logger.info('month report remove success!')
    })
})

// PayItemDayReport.remove({date:{$gte:from.toDate(),$lt:to.toDate()}},function(err){
//     if(err) console.log(err)

//     logger.info('day report remove success!')
    
//     PayItemMonthReport.remove({date:{$gte:from.toDate(),$lt:to.toDate()}},function(err){
//         if(err) console.log(err)

//         logger.info('month report remove success!')
//     })
// })