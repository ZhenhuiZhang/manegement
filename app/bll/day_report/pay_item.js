//自动运行脚本，生成前一天日报表
//若要做修改，务必上测试环境测试此脚本
var config = require('../../../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var cms_report_db = require('../../models/index_report')
var db_readonly = require('../../models/index_readonly')
var logger = require('../../common/logger').logger('pay_item_day_report');
var PayItemDayReport = cms_report_db.PayItemDayReport
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
        zone: 'Europe/Istanbul'
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

function init(cb,country_index){
    var start = new Date()

    var yestoday = new moment().add(-1, 'day')
    var today = new moment()

    //获取日期范围
    var from = moment.tz(yestoday.format('YYYY-MM-DD'),country[country_index].zone)
    var to = moment.tz(today.format('YYYY-MM-DD'),country[country_index].zone)
    var tzOffset = Math.round(from.utcOffset()/60)  //时差

    var where = {
        create_at : {
            $gte: from.toDate(), $lt: to.toDate() 
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
    
                logger.info(from.format(),to.format(),country[country_index].location +":pay item aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                if(country_index+1 == country.length){
                    cb()
                }else{
                    init(cb,country_index+1)
                }
            })
        })
}

module.exports = init