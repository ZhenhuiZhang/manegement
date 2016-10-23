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
var from = getTimezone(new moment('2016-07-31T17:00:00.000Z')).tz("Asia/Jakarta")
var to = getTimezone(new moment('2016-07-31T17:00:00.000Z')).tz("Asia/Jakarta").add(1, 'day')
var tzOffset = 7  //雅加达时差

function init(date_from,date_to){
    var start = new Date()

    var where = {
        create_at : {
            $gte: date_from.toDate(), $lt: date_to.toDate() 
        }
    }

    //按日聚合
    GiftItem.aggregate([
        {
            $match: where
        },
        {
            $group:{
                _id:{
                    gift_id: "$gift_id",
                    receive_user_id: "$receive_user_id",
                    sender_user_id: "$sender_user_id",
                    date:{"$subtract": [
                            { "$add": [ 
                                { "$subtract": [ "$create_at", new Date("1970-01-01") ] },
                                tzOffset * 1000 * 60 * 60
                            ]},
                            { "$mod": [
                                { "$add": [ 
                                    { "$subtract": [ "$create_at", new Date("1970-01-01") ] },
                                    tzOffset * 1000 * 60 * 60
                                ]},
                                1000 * 60 * 60 * 24
                            ]}
                        ]},
                },
                sum_count: {$sum: 1},
                sum_account: { $sum: "$account" },
                receive: {$first:"$receive"},
                sender: {$first:"$sender"}
            }
        },
        {
            $lookup:
                {
                from: "gifts",
                localField: "_id.gift_id",
                foreignField: "gift_id",
                as: "gift"
                }
        },
        {
            $project: {
                sum_count: 1,
                sum_account: 1,
                receive: 1,
                sender: 1,
                gift:{name:1}
            }
        }]).allowDiskUse(true).exec(function(err,rd){
            if(err) return logger.error(err)
            rd.forEach(function(element) {
                element.gift_id = element._id.gift_id
                element.receive_user_id = element._id.receive_user_id
                element.sender_user_id = element._id.sender_user_id
                element.date = new Date(element._id.date)
                element.year = element.date.getFullYear()
                element.month = element.date.getMonth()+1
                element.day = element.date.getDate()
                if(element.gift[0]) element.gift_name = element.gift[0].name

                delete element._id
                delete element.gift
            }, this);

            // console.log(err,rd)

            GiftItemDayReport.create(rd,function(err){
                if(err) return logger.error(err)
                
                var end = new Date()

                var cost_time = end.getTime()-start.getTime()  //时间差的毫秒数
                //计算出相差天数
                var days=Math.floor(cost_time/(24*3600*1000))
                //计算出小时数
                var leave1=cost_time%(24*3600*1000)    //计算天数后剩余的毫秒数
                var hours=Math.floor(leave1/(3600*1000))
                //计算相差分钟数
                var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
                var minutes=Math.floor(leave2/(60*1000))
                //计算相差秒数
                var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
                var seconds=Math.round(leave3/1000)

                logger.info(date_from.format(),date_to.format(),"gift item aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                init_month(init,date_from,date_to)
            })
        })
}

function init_month(cb,date_from,date_to) {
    // console.log(date_from.format(),date_to.format())

    var where = {
        date : {
            $gte: date_from.toDate(), $lte: date_to.toDate() 
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
                    date: "$date"
                },
                sum_count: {$sum: '$sum_count'},
                sum_account: { $sum: "$sum_account" },
                receive: {$first:"$receive"},
                sender: {$first:"$sender"},
                gift_name: {$first: "$gift_name"},
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

            var now = new moment()
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){
                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'gift_item_month_report init success!')
            }else{
                cb(date_from,date_to)
            }
        })
}

GiftItemDayReport.remove({},function(err){
    if(err) return console.log(err)
    console.log('giftItemDayReport remove success! ')
    GiftItemMonthReport.remove({},function(err){
        if(err) return console.log(err)
        console.log('giftItemMonthReport remove success! ')
        init(from,to)
    })
})