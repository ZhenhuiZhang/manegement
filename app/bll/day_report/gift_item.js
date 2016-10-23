//自动运行脚本，生成前一天日报表
//若要做修改，务必上测试环境测试此脚本
var config = require('../../../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var cms_report_db = require('../../models/index_report')
var db_readonly = require('../../models/index_readonly')
var logger = require('../../common/logger').logger('gift_item_day_report');
var GiftItemDayReport = cms_report_db.GiftItemDayReport

var GiftItem = db_readonly.GiftItem

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

function init(cb,livelogs_day,livelogs_month,country_index){
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
            $lookup:
                {
                from: "users",
                localField: "_id.receive_user_id",
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
                receive: 1,
                sender: 1,
                gift:{name:1},
                user: {location:1}
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
                if(element.user[0]) element.location = element.user[0].location

                delete element._id
                delete element.gift
                delete element.user
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

                logger.info(from.format(),to.format(),country[country_index].location +":gift item aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                if(country_index+1 == country.length){
                    cb() 
                    livelogs_day(livelogs_month,0)
                }else{
                    init(cb,livelogs_day,livelogs_month,country_index+1)
                }
            })
        })
}

module.exports = init