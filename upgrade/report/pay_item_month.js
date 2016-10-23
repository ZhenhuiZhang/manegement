//自动运行脚本，生成前一天日报表
var config = require('../../config')
var md5 = require('md5')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var md5 = require('md5')
var cms_report_db = require('../../app/models/index_report')
var db_readonly = require('../../app/models/index_readonly')
var logger = require('../../app/common/logger').logger('pay_item_day_report');
var PayItemDayReport = cms_report_db.PayItemDayReport
var PayItemMonthReport =cms_report_db.PayItemMonthReport

var PayItem = db_readonly.PayItem

//获取日期范围
var time = '2016-09-01 00:00:00'
var from = new moment(time).startOf('day')
var to = new moment(time).startOf('day').add(1, 'day')

init_month(from,to)

function init_month(date_from,date_to) {
    var start = new Date()

    var where = {
        date : {
            $gte: moment.tz(date_from.format('L'),'utc').toDate(), $lt: moment.tz(date_to.format('L'),'utc').toDate()
        }
    }

    PayItemDayReport.aggregate([
        {
            $match:where
        },
        {
            $group:{
                _id:{
                    user_id: "$user_id",
                    platform: "$platform",
                    status: "$status",
                    // gold: "$gold",
                    currency:'$currency',
                    date:{$dateToString: { format: "%Y-%m", date: "$date"}}
                },
                sum_count: {$sum: '$sum_count'},
                sum_account: { $sum: "$sum_account" },
                loginname: {$first:"$loginname"},
                gold:{ $sum:'$gold' },
                location: {$first: '$location'}
            }
        }])
        .allowDiskUse(true).exec(function(err,rd){
            rd.forEach(function(element,index) {
                var update = {$inc:{}}

                update.user_id = element._id.user_id
                update.currency = element._id.currency
                update.platform = element._id.platform
                update.status = element._id.status
                update.date = new Date(element._id.date)
                update.year = update.date.getFullYear()
                update.month = update.date.getMonth()+1
                update.loginname = element.loginname
                update.location = element.location 

                update.$inc.sum_count = element.sum_count
                update.$inc.gold = element.gold
                update.$inc.sum_account = element.sum_account

                var key = {
                    user_id:update.user_id,
                    platform: update.platform,
                    status: update.status,
                    // gold: element.gold,
                    year:update.year,
                    month:update.month
                }
                key = md5(JSON.stringify(key))
                update.key = key

                PayItemMonthReport.findOneAndUpdate({key: key},update,{new:true,upsert:true},function(err,datas){
                    if(err) console.log(err)
                })
            }, this);

            var now = new moment().add(-1,'days')
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){
                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'pay_item_month_report init success!')
            }else{
                init_month(date_from,date_to)
            }
        })
}