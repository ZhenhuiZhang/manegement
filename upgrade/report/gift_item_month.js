//自动运行脚本，生成前一天日报表
var config = require('../../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var md5 = require('md5')
var cms_report_db = require('../../app/models/index_report')
var db_readonly = require('../../app/models/index_readonly')
var logger = require('../../app/common/logger').logger('gift_item_day_report');
var GiftItemDayReport = cms_report_db.GiftItemDayReport
var GiftItemMonthReport = cms_report_db.GiftItemMonthReport

var GiftItem = db_readonly.GiftItem

//获取日期范围
var time = '2016-09-01 00:00:00'
var from = new moment(time).startOf('day')
var to = new moment(time).startOf('day').add(1, 'day')
init_month(from,to)

function init_month(date_from,date_to) {
    // console.log(moment.tz(date_from.format('L'),'utc').toDate())

    var where = {
        date : {
            $gte: moment.tz(date_from.format('L'),'utc').toDate(), $lt: moment.tz(date_to.format('L'),'utc').toDate()
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
                })
            }, this);

            var now = new moment().add(-1,'days')
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){
                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'gift_item_month_report init success!')
            }else{
                init_month(date_from,date_to)
            }
        })
}