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
var from = getTimezone(new moment('2016-08-15T17:00:00.000Z')).tz("Asia/Jakarta")
var to = getTimezone(new moment('2016-08-15T17:00:00.000Z')).tz("Asia/Jakarta").add(1, 'day')
var tzOffset = 7  //雅加达时差

function init(date_from,date_to){
    var start = new Date()

    var where = {
        create_at : {
            $gte: date_from.toDate(), $lte: date_to.toDate() 
        }
    }

    //PayItem按日聚合
    PayItem.aggregate([
        {
            $match: where
        },
        {
            $group:{
                _id:{
                    user_id: "$user_id",
                    platform: "$platform",
                    status: "$status",
                    // gold: "$gold",
                    currency:'$currency',
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
                        ]}
                },
                sum_count: {$sum: 1},
                sum_account: {$sum: '$price'},
                loginname: {$first:"$loginname"},
                gold:{$sum:'$gold'}
            }
        }])
        .allowDiskUse(true).exec(function(err,rd){
            rd.forEach(function(element) {
                element.user_id = element._id.user_id
                element.platform = element._id.platform
                element.status = element._id.status
                element.currency = element._id.currency
                // element.gold = element._id.gold
                element.date = new Date(element._id.date)
                element.year = element.date.getFullYear()
                element.month = element.date.getMonth()+1
                element.day = element.date.getDate()

                delete element._id
            }, this);

            // console.log(rd)

            PayItemDayReport.create(rd,function(err){
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
    
                logger.info(date_from.format(),date_to.format(),"pay item aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                init_month(init,date_from,date_to)
            })
        })
}

function init_month(cb,date_from,date_to) {
    var start = new Date()

    var where = {
        date : {
            $gte: date_from.toDate(), $lte: date_to.toDate() 
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
                gold:{ $sum:'$gold' }
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

            var now = getTimezone(new moment('2016-08-17T17:00:00.000Z')).tz("Asia/Jakarta")
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){
                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'pay_item_month_report init success!')
            }else{
                cb(date_from,date_to)
            }
        })
}

// PayItemDayReport.remove({},function(err){
//     if(err) return console.log(err)
//     console.log('PayItemDayReport remove success! ')
//     PayItemMonthReport.remove({},function(err){
//         if(err) return console.log(err)
//         console.log('PayItemMonthReport remove success! ')
        init(from,to)
//     })
// })
