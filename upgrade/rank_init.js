//自动运行脚本，生成前一天日报表
var config = require('../config')

var models = require('../app/models')
var moment = require('moment');
var mongoose = require('mongoose');
var cms_report_db = require('../models/index_report')
var logger = require('../app/common/logger').logger('live_logs_day_report');
var EventProxy = require('eventproxy')
var Rank = models.Rank
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var Rank_bak = cms_report_db.Rank_bak

var db_readonly = mongoose.createConnection(config.db_readonly,{
    replset: { poolSize: 10, rs_name: 'web' }
})
var LiveLogs = db_readonly.model('Live_Logs')

var start = new Date()

//获取日期范围
var from = new moment().add(-4,'day').startOf('day')
var to = new moment().add(-1,'day').startOf('day')
to.hours(23);
to.minutes(59);
to.seconds(59);
to.milliseconds(999);

var where = {
    create_at : {
        $gte: from.toDate(), $lte: to.toDate() 
    }
}

LiveLogs.aggregate(
    [{
        $match: where
    },
    {
        $group:{
            _id:{
                user_id: "$user_id",
                platform: "$platform",
                // host_manager: "$host_manager",
                // manager_name: "$manager_name",
                date:{$dateToString: { format: "%Y-%m-%d", date: "$create_at"}}
            },
            sum_count: {$sum: 1},
            sum_live_times: { $sum: "$live_times" },
            sum_revence: { $sum: "$revence" },
            sum_UV: { $sum: "$UV" },
            sum_DAU: { $sum: "$DAU" },
            sum_follow_count: { $sum: "$follow_count" },
            sum_gift_count: { $sum: "$gift_count" }
            // loginname: {$first:"$loginname"}
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
    },{
        $project: {
            sum_count: 1,
            sum_live_times: 1,
            sum_revence: 1,
            sum_UV: 1,
            sum_DAU: 1,
            sum_follow_count: 1,
            sum_gift_count: 1,
            user: {group:1,loginname:1,avatar:1,anchor_intro:1}
        }
    }])
    .allowDiskUse(true).exec(function(err,rd){
        console.log(err)
        rd.forEach(function(element) {
            element.user_id = element._id.user_id
            element.platform = element._id.platform
            element.date = new Date(element._id.date)
            element.year = element.date.getFullYear()
            element.month = element.date.getMonth()+1
            element.day = element.date.getDate()
            if(element.user[0]){ 
                element.anchor_group = element.user[0].group
                element.loginname = element.user[0].loginname
                element.avatar = element.user[0].avatar
                element.anchor_intro = element.user[0].anchor_intro
            }

            delete element._id
            delete element.user
        }, this);

        console.log(err)

        LiveLogsDayReport.create(rd,function(err){
            if(err) return logger.error(err) 
            
            rankInit()
            
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
            
            logger.info("live logs aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")
        })
    })


function rankInit() {
    LiveLogsDayReport.aggregate([
        {
            $match:{
                anchor_intro: "#NatashaWilonaInNonolive"
            }
        },
        {
            $group: {
                _id: {
                    user_id: '$user_id'
                },
                loginname: {$first:"$loginname"},
                avatar: {$first:"$avatar"},
                new_fans: { $sum: "$sum_follow_count" },
                anchor_intro:{$first:'$anchor_intro'}
            },
        },
        {
            $project: {
                new_fans: 1,
                loginname: 1,
                avatar: 1,
                anchor_intro: 1
            }
        },
        {
            $sort: {new_fans: -1}
        },
        {
            $limit: 10
        }
    ],function(err, rd) {
        var ep = new EventProxy();

        Rank.find({}, null, {$sort: [['sum_follow_count', -1]]},function(err,rd){
            if(err) return 
            ep.emit('rank',rd)
        })
        // Rank_bak.find({}, null, {$sort: [['sum_follow_count', -1]]},function(err,rd){
        //     if(err) return 
        //     ep.emit('rank',rd)
        // })

        ep.all('rank',function(rank){
            rd.forEach(function(element, index) {
                element.user_id = element._id.user_id
                element.rank = index + 1
                if(!rank.length) element.status = 0
                else{
                    for(var i = 0;i <rank.length; i++){
                        if(element.user_id == rank[i].user_id){
                            element.status = element.rank < rank[i].rank? 1 : (element.rank == rank[i].rank? 0:-1)
                            break
                        }else{
                            element.status = 1
                        }
                    }
                }

                delete element._id
            }, this);

            console.log(err)

            Rank.remove({}, function(){
                Rank.create(rd, function(err){
                    if(err) console.log(err)

                    logger.info('rank rebuild success!')
                })
            })

            // Rank_bak.remove({}, function(){
            //     Rank_bak.create(rd, function(err){
            //         if(err) console.log(err)

            //         logger.info('Rank_bak rebuild success!')
            //     })
            // })
        })
    })
}