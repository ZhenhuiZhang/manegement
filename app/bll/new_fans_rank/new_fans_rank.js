//生成排行榜
var config = require('../../../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var db_readonly = require('../../models/index_readonly')
var db_main = require('../../models/index_main')
var logger = require('../../common/logger').logger('new_fans_rank');

var Friends= db_readonly.Friends
var NewFansRank = db_main.NewFansRank
var ScheduleLogs = db_main.ScheduleLogs

module.exports = function(date_from,cb){
    var start = new Date()

    //获取日期范围
    var from = getTimezone(new moment(date_from)).tz("Asia/Jakarta")
    var to = getTimezone(new moment()).tz("Asia/Jakarta")
    var tzOffset = 7  //雅加达时差

    var where = {
        status: 0,
        create_at:{
            $gte: from.toDate(), $lte: to.toDate()
        }
    }

    Friends.aggregate([
        {
            $match: where
        },
        {
            $group: {
                _id: {
                    user_id : '$follow_user_id',
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
                new_fans: {$sum: 1},
                loginname: {$first: '$follow_loginname'},
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
                new_fans: 1,
                loginname:1,
                last_time: 1,
                user: {avatar:1}
            }
        }
    ]).allowDiskUse(true).exec(function(err,rd){
        rd.forEach(function(ele,index){
            ele.user_id = ele._id.user_id
            ele.day = new Date(ele._id.day)
            if(ele.user[0]){ 
                ele.avatar = ele.user[0].avatar
            }

            delete ele._id
            delete ele.user

            NewFansRank.findOneAndUpdate({
                user_id: ele.user_id,
                day: ele.day
            },{$inc:{new_fans: ele.new_fans},avatar:ele.avatar,loginname:ele.loginname},{new:true, upsert:true},function(err){
                if(err) return logger.error(err)

                if(rd.length == index+1){
                    cb(ele)

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
                    
                    logger.info("New Fans rank init cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")
                }
            })
        })
    })
}