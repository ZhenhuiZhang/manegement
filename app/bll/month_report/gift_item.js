//若要做修改，务必上测试环境测试此脚本
var moment = require('moment');
var getTimezone = require('moment-timezone');
var md5 = require('md5')
var cms_report_db = require('../../models/index_report')
var logger = require('../../common/logger').logger('gift_item_month_report');
var GiftItemDayReport = cms_report_db.GiftItemDayReport
var GiftItemMonthReport =cms_report_db.GiftItemMonthReport
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

    GiftItemDayReport.aggregate([
        {
            $match:where
        },
        {
            $group:{
                _id:{
                    gift_id: "$gift_id",
                    receive_user_id: "$receive_user_id",
                    sender_user_id: "$sender_user_id",
                    host_manager: "$host_manager",
                    date: {$dateToString: { format: "%Y-%m", date: "$date"}}
                },
                sum_count: {$sum: '$sum_count'},
                sum_account: { $sum: "$sum_account" },
                receive: {$first:"$receive"},
                sender: {$first:"$sender"},
                gift_name: {$first: "$gift_name"},
                location: {$first: '$location'}
            }
        }])
        .allowDiskUse(true).exec(function(err,rd){
            rd.forEach(function(element,index) {
                var update = {$inc:{}}

                update.gift_id = element._id.gift_id
                update.receive_user_id = element._id.receive_user_id
                update.gift_id = element._id.gift_id
                update.sender_user_id = element._id.sender_user_id
                // update.host_manager = element._id.host_manager
                update.date = new Date(element._id.date)
                update.year = update.date.getFullYear()
                update.month = update.date.getMonth()+1
                update.receive = element.receive
                update.sender = element.sender
                update.gift_name = element.gift_name
                update.location = element.location

                update.$inc.sum_count = element.sum_count
                update.$inc.sum_account = element.sum_account

                var key = {
                    receive_user_id:update.receive_user_id,
                    sender_user_id: update.sender_user_id,
                    gift_id: update.gift_id,
                    // host_manager: element.host_manager,
                    year:update.year,
                    month:update.month
                }
                key = md5(JSON.stringify(key))
                update.key = key

                GiftItemMonthReport.findOneAndUpdate({key: key},update,{new:true,upsert:true},function(err,datas){
                    if(err) console.log(err)

                    if(rd.length == index+1){
                        logger.info(from.format(),to.format(),'gift_item_month_report init success!')

                        //创建报表记录，用于查询报表是否失败
                        ScheduleLogs.create({name:'gift_item_report',last_time: from.toDate()},function(err){
                            if(err) console.log(err)

                            logger.info('gift_item_report schedule logs init success!')
                        })
                    }
                })
            }, this);
            // console.log(err,rd)
        })
}
