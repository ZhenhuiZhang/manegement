//生成排行榜
var config = require('../../../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
// var db_readonly = require('../../models/index_readonly')
var db_main = require('../../models/index_main')
var logger = require('../../common/logger').logger('gift_item_day_report');

var GiftItem = db_main.GiftItem
var GiftRank = db_main.GiftRank
var ScheduleLogs = db_main.ScheduleLogs

module.exports = function(date_from,cb){
    var start = new Date()

    //获取日期范围
    var from = getTimezone(new moment(date_from)).tz("Asia/Jakarta")
    var to = getTimezone(new moment()).tz("Asia/Jakarta")
    var tzOffset = 7  //雅加达时差

    var where = {
        create_at:{
            $gte: from.toDate(), $lte: to.toDate()
        }
    }

    GiftItem.aggregate([
        {
            $match: where
        },
        {
            $group: {
                _id: {
                    gift_id:"$gift_id",
                    user_id:"$receive_user_id",
                    day:{"$subtract": [
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
                count: {$sum: 1},
                loginname: {$first:"$receive"},
                account: { $sum: "$account" },
                last_time: {$max: "$create_at"}
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
            $sort:{
                last_time: 1
            }
        },
        {
            $project: {
                count: 1,
                loginname: 1,
                account: 1,
                last_time: 1,
                user: {avatar:1}
            }
        }
    ],function(err,rd){

        rd.forEach(function(element,index) {
            var rank = {}
            element.gift_id = element._id.gift_id
            element.user_id = element._id.user_id
            element.day = element._id.day
            if(element.user[0]){ 
                element.avatar = element.user[0].avatar
            }

            delete element._id
            delete element.user

            GiftRank.findOneAndUpdate({
                gift_id: element.gift_id,
                user_id: element.user_id,
                day: element.day
            },{$inc:{account: element.account,count: element.count},avatar:element.avatar,loginname:element.loginname},{new:true, upsert:true},function(err){
                if(err) return logger.error(err)

                if(rd.length == index+1){
                    cb(element)

                    console.log(element)

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
                    
                    logger.info("Gift rank init cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")
                }
            })
        }, this);

        // console.log(rd)
    })
}