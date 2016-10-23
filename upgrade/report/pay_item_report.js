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

//定义国家列表及其时区
var country = [
    {
        location: 'Indonesia',
        zone: 'Asia/Jakarta'
    },
    {
        location: 'Malaysia',
        zone: 'Asia/Singapore'
    },
    {
        location: 'Turkey',
        zone: 'Europe/Istanbul',
        tzOffset : 3
    },
    {
        location: 'Russian',
        zone: 'Europe/Moscow'
    },
    {
        location: 'Vietnam',
        zone: 'Asia/Bangkok'
    },
    {
        location: 'Thailand',
        zone: 'Asia/Bangkok'
    }
]

//获取日期范围
var time = '2016-10-01 00:00:00'
var from = new moment(time).startOf('day')
var to = new moment(time).startOf('day').add(1, 'day')

init(from,to,0)

function init(date_from,date_to,country_index){
    var start = new Date()
    var gte = moment.tz(date_from.format('L'),country[country_index].zone)
    var lt = moment.tz(date_to.format('L'),country[country_index].zone)
    var tzOffset = Math.round(gte.utcOffset()/60)

    var where = {
        create_at : {
            $gte: gte.toDate(), 
            $lt: lt.toDate()
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
        },
        {
            $lookup:
                {
                from: "users",
                localField: "_id.user_id",
                foreignField: "user_id",
                as: "user"
                }
        },
        {
            $match: {
                'user.location': country[country_index].location
            }
        },
        {
            $project: {
                sum_count: 1,
                sum_account: 1,
                loginname: 1,
                gold: 1,
                user: {location:1}
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
                if(element.user[0]) element.location = element.user[0].location

                delete element._id
                delete element.user
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
    
                logger.info(gte.format(),lt.format(),country[country_index].location +":pay item aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                if(country_index+1 == country.length){
                    init_month(init,date_from,date_to) 
                }else{
                    init(date_from,date_to,country_index+1)
                }
            })
        })
}

function init_month(cb,date_from,date_to) {
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

            var now = new moment()
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){
                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'pay_item_month_report init success!')
            }else{
                cb(date_from,date_to,0)
            }
        })
}
