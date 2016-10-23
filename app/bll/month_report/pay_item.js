//若要做修改，务必上测试环境测试此脚本
var moment = require('moment');
var getTimezone = require('moment-timezone');
var md5 = require('md5')
var cms_report_db = require('../../models/index_report')
var logger = require('../../common/logger').logger('pay_item_month_report');
var PayItemDayReport = cms_report_db.PayItemDayReport
var PayItemMonthReport =cms_report_db.PayItemMonthReport
var db_main = require('../../models/index_main')
var ScheduleLogs = db_main.ScheduleLogs

module.exports = function() {
    var start = new Date()

    var yestoday = new moment().add(-1, 'day')
    var today = new moment()

    //获取日期范围
    var from = moment.tz(yestoday.format('YYYY-MM-DD'),'utc')
    var to = moment.tz(today.format('YYYY-MM-DD'),'utc')

    var where = {
        date : {
            $gte: from.toDate(), $lt: to.toDate() 
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
                    date: {$dateToString: { format: "%Y-%m", date: "$date"}},
                    currency:'$currency',
                },
                sum_count: {$sum: '$sum_count'},
                sum_account: { $sum: "$sum_account" },
                loginname: {$first:"$loginname"},
                gold: {$sum: '$gold'},
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

                    if(rd.length == index+1){
                        logger.info(from.format(),to.format(),'pay_item_month_report init success!')

                        //创建报表记录，用于查询报表是否失败
                        ScheduleLogs.create({name:'pay_item_report',last_time: from.toDate()},function(err){
                            if(err) console.log(err)

                            logger.info('pay_item_report schedule logs init success!')
                        })
                    }
                })
            }, this);

            // console.log(err,rd)
        })
}
