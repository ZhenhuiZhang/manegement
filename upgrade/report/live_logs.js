//自动运行脚本，生成前一天日报表
var config = require('../../config')
var linq = require('../../app/libs/linq.js')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var md5 = require('md5')
var EventProxy = require('eventproxy')
var cms_report_db = require('../../app/models/index_report')
var db_readonly = require('../../app/models/index_readonly')
var logger = require('../../app/common/logger').logger('live_logs_day_report');
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var LiveLogsMonthReport =cms_report_db.LiveLogsMonthReport
var GiftItemDayReport =cms_report_db.GiftItemDayReport

var LiveLogs = db_readonly.LiveLogs
var Friends= db_readonly.Friends

//获取日期范围
var from = getTimezone(new moment('2016-07-30T17:00:00.000Z')).tz("Asia/Jakarta")
var to = getTimezone(new moment('2016-07-30T17:00:00.000Z')).tz("Asia/Jakarta").add(1, 'day')
var tzOffset = 7  //雅加达时差

function init(date_from,date_to){

    var start = new Date()

    var where = {
        create_at : {
            $gte: date_from.toDate(), $lt: date_to.toDate() 
        },
        //过滤小于60秒和大于6小时的脏数据
        live_times: {
            $lt : 21600
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
                    // platform: "$platform",
                    // host_manager: "$host_manager",
                    // manager_name: "$manager_name",
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
                sum_live_times: { $sum: "$live_times" },
                // sum_revence: { $sum: "$revence" },
                sum_UV: { $sum: "$UV" },
                DAU: { $max: "$DAU" },
                // sum_follow_count: { $sum: "$follow_count" },
                // sum_gift_count: { $sum: "$gift_count" }
                remain_second:{$sum:
                    {
                        "$divide":[
                            {'$max':[{"$subtract": [
                                        {"$multiply":['$live_times',1000]},
                                        {
                                            "$subtract":[
                                                new Date(date_to.toDate()),
                                                "$create_at"
                                            ]
                                        }
                                    ]},
                                    0]
                            },
                            1000
                        ]
                    }
                }
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
                DAU: 1,
                sum_follow_count: 1,
                sum_gift_count: 1,
                user: {anchor_group:1,loginname:1,avatar:1,admin_remark:1,create_at:1},
                remain_second:1
            }
        }]).allowDiskUse(true).exec(function(err,rd){

            var ep = new EventProxy()

            var data_next_day = []

            rd.forEach(function(element,index) {
                LiveLogsDayReport.findOne({user_id: element._id.user_id,date:element._id.date},function(err,LL_rd){
                    if(LL_rd){
                        element.sum_live_times += LL_rd.sum_live_times
                        LiveLogsDayReport.remove({user_id: element._id.user_id,date:element._id.date},function(err){
                            if(err) return logger.error(err)
                        })
                    }

                    element.user_id = element._id.user_id
                    // element.platform = element._id.platform
                    element.date = new Date(element._id.date)
                    element.year = element.date.getFullYear()
                    element.month = element.date.getMonth()+1
                    element.day = element.date.getDate()
                    if(element.user[0]){ 
                        element.anchor_group = element.user[0].anchor_group
                        element.loginname = element.user[0].loginname
                        element.avatar = element.user[0].avatar
                        element.admin_remark = element.user[0].admin_remark
                        element.regist_time = element.user[0].create_at
                    }

                    if(element.remain_second > 0){
                        element.sum_live_times = element.sum_live_times - element.remain_second
                        var _data_next_day = {
                            sum_live_times: element.remain_second,
                            user_id: element.user_id,
                            year: element.year,
                            month: new moment(element.date).add(1,'day').toDate().getMonth()+1,
                            day: new moment(element.date).add(1,'day').toDate().getDate(),
                            date: new moment(element.date).add(1,'day').toDate()
                        }

                        if(element.user[0]){
                            _data_next_day.anchor_group = element.user[0].anchor_group
                            _data_next_day.loginname = element.user[0].loginname
                            _data_next_day.avatar = element.user[0].avatar
                            _data_next_day.admin_remark = element.user[0].admin_remark
                            _data_next_day.regist_time = element.user[0].create_at
                        }

                        data_next_day.push(_data_next_day)
                    }

                    Friends.count({
                        follow_user_id: element.user_id,
                        status: 0,
                        create_at : {
                            $gte: date_from.toDate(), $lte: date_to.toDate() 
                        }},
                    function(err,count){
                        element.sum_follow_count = count

                        ep.emit('follow_count_once')
                    })

                    GiftItemDayReport.aggregate([
                        {
                            $match:{
                                receive_user_id: element.user_id,
                                date : {
                                    $gte: date_from.toDate(), $lte: date_to.toDate() 
                                }
                            }
                        },
                        {
                            $group: {
                                _id:null,
                                sum_gift_count : {$sum: "$sum_count"},
                                sum_gift_value: {$sum:"$sum_account"}
                            }
                        }
                    ]).allowDiskUse(true).exec(function(err,gift){
                        if(gift.length){
                            element.sum_gift_count = gift[0].sum_gift_count
                            element.sum_revence = gift[0].sum_gift_value
                        }else{
                            element.sum_gift_count = 0
                            element.sum_revence = 0
                        }

                        ep.emit('gift_once')
                    })

                    delete element._id
                    delete element.user
                })
            }, this);

            ep.after('follow_count_once',rd.length,function(){
                ep.emit('follow_count')
            })
            ep.after('gift_once',rd.length,function(){
                ep.emit('gift')
            })

            ep.all('follow_count','gift',function(count,gift){
                data = rd.concat(data_next_day)

                LiveLogsDayReport.create(data,function(err){
                    if(err) return logger.error(err) 
                    
                    // init_month(date_from,date_to)
                    
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
                    
                    logger.info(date_from.format(),date_to.format(),"live logs aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                    init_month(init,date_from,date_to) 
                })
            })
        })
}

function init_month(cb,date_from,date_to){

    var where = {
        date : {
            $gte: date_from.toDate(), $lte: date_to.toDate() 
        }
    }

    LiveLogsDayReport.aggregate([
        {
            $match:where
        },
        {
            $group:{
                _id:{
                    user_id: '$user_id',
                    // platform: "$platform",
                    // host_manager: "$host_manager",
                    // manager_name: "$manager_name",
                    date:{$dateToString: { format: "%Y-%m", date: "$date"}},
                    anchor_group: '$anchor_group'
                },
                loginname: {$first:"$loginname"},
                admin_remark: {$first:"$admin_remark"},
                regist_time: {$first:"$regist_time"},
                sum_count: {$sum: "$sum_count"},
                sum_live_times: { $sum: "$sum_live_times" },
                sum_revence: { $sum: "$sum_revence" },
                sum_UV: { $sum: "$sum_UV" },
                DAU: { $max: "$DAU" },
                sum_follow_count: { $sum: "$sum_follow_count" },
                sum_gift_count: { $sum: "$sum_gift_count" },
            }
        },
        {
            $project: {
                sum_count: 1,
                sum_live_times: 1,
                sum_revence: 1,
                sum_UV: 1,
                DAU: 1,
                sum_follow_count: 1,
                sum_gift_count: 1,
                loginname: 1,
                regist_time:1,
                admin_remark:1
            }
        }])
        .allowDiskUse(true).exec(function(err,rd){
            if(err) console.log(err)
            // console.log(date_from.format(),date_to.format())
            rd.forEach(function(element,index) {
                var update = {$inc:{}}

                update.user_id = element._id.user_id
                // update.platform = element._id.platform
                update.date = new Date(element._id.date)
                update.year = update.date.getFullYear()
                update.month = update.date.getMonth()+1
                update.anchor_group = element._id.anchor_group
                update.admin_remark = element.admin_remark
                update.regist_time = element.regist_time
                update.loginname = element.loginname   
                update.DAU = element.DAU           
                
                update.$inc.sum_count = element.sum_count || 0
                update.$inc.sum_live_times = element.sum_live_times || 0
                update.$inc.sum_revence = element.sum_revence || 0
                update.$inc.sum_UV = element.sum_UV || 0
                update.$inc.sum_follow_count = element.sum_follow_count || 0
                update.$inc.sum_gift_count = element.sum_gift_count || 0

                update['day_live_times_'+date_from.date()] = element.sum_live_times || 0
                update['day_revence_'+date_from.date()] = element.sum_revence || 0
                update['day_UV_'+date_from.date()] = element.sum_UV || 0
                // update['day_DAU_'+date_from.date()] = element.sum_DAU
                update['day_follow_count_'+date_from.date()] = element.sum_follow_count || 0
                update['day_gift_count_'+date_from.date()] = element.sum_gift_count || 0

                var key = {
                    user_id:update.user_id,
                    // platform: update.platform,
                    // host_manager: element.host_manager,
                    year:update.year,
                    month:update.month
                }
                key = md5(JSON.stringify(key))
                update.key = key

                LiveLogsMonthReport.findOneAndUpdate({key: key},update,{new:true, upsert:true},function(err,datas){
                    if(err) console.log(err)
                })
            }, this);

            var now = new moment('2016-08-20')
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){
                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'live_logs_month_report init success!')

                //更新官方主播的资料
                db_readonly.User.find({anchor_group: 'official'},function(err,official_users){
                    var _official_users = []
                    official_users.forEach(function(ele,index){
                        var date = new Date(getTimezone(date_from).tz("UTC").startOf('month').toDate())
                        var key = {
                            user_id:ele.user_id,
                            // platform: update.platform,
                            // host_manager: element.host_manager,
                            year:date.getFullYear(),
                            month:date.getMonth()+1
                        }
                        key = md5(JSON.stringify(key))

                        var official_update = {
                            user_id: ele.user_id,             
                            anchor_group: ele.anchor_group,    
                            loginname: ele.loginname,
                            date: date,
                            year: date.getFullYear(),
                            month: date.getMonth()+1,
                            admin_remark: ele.admin_remark,
                            regist_time: ele.create_at,
                            key:key
                        }

                        LiveLogsMonthReport.findOneAndUpdate({key: key},official_update,{new:true, upsert:true},function(err,datas){
                            if(err) console.log(err)

                            if(official_users.length == index+1){
                                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'official anchor update success')
                            }
                        })
                    })
                })
            }else{
                cb(date_from,date_to)
            }

        })
        // console.log(err,rd)
}

// LiveLogsDayReport.remove({},function(err){
//     if(err) return console.log(err)
//     console.log('LiveLogsDayReport remove success! ')
//     LiveLogsMonthReport.remove({},function(err){
//         if(err) return console.log(err)
//         console.log('LiveLogsMonthReport remove success! ')
        init(from,to)
//     })
// })


