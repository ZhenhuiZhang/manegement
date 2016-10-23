//自动运行脚本，生成前一天日报表
//若要做修改，务必上测试环境测试此脚本
var config = require('../../../config')

var EventProxy = require('eventproxy')
var cms_report_db = require('../../models/index_report')
var db_readonly = require('../../models/index_readonly')
var mongoose = require('mongoose');
var moment = require('moment');
var getTimezone = require('moment-timezone');
var logger = require('../../common/logger').logger('live_logs_day_report');
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var GiftItemDayReport =cms_report_db.GiftItemDayReport

var LiveLogs = db_readonly.LiveLogs
var Friends= db_readonly.Friends

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
                                                new Date(to.toDate()),
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
        },
        {
            $match: {
                'user.location': country[country_index].location
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
                user: {anchor_group:1,loginname:1,avatar:1,admin_remark:1,create_at:1,location:1,gift_revenue_history:1,fans:1},
                remain_second:1
            }
        }]).allowDiskUse(true).exec(function(err,rd){

            var ep = new EventProxy()

            if(rd.length == 0){
                logger.info(from.format(),to.format(), country[country_index].location + ": live logs length==0")
                if(country_index+1 == country.length){
                    cb()
                }else{
                    init(cb,country_index+1)
                }
            }

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
                        element.location = element.user[0].location
                        element.gift_revenue_history = element.user[0].gift_revenue_history
                        element.fans = element.user[0].fans
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
                            _data_next_day.location = element.user[0].location
                            _data_next_day.gift_revenue_history = element.user[0].gift_revenue_history
                            _data_next_day.fans = element.user[0].fans
                        }

                        data_next_day.push(_data_next_day)
                    }

                    Friends.count({
                        follow_user_id: element.user_id,
                        status: 0,
                        create_at : {
                            $gte: from.toDate(), $lt: to.toDate() 
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
                                    $gte: moment.tz(yestoday.format('YYYY-MM-DD'),'utc').toDate(), $lt: moment.tz(today.format('YYYY-MM-DD'),'utc').toDate() 
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
                    
                    logger.info(from.format(),to.format(), country[country_index].location + ": live logs aggregate cost "+days+" days "+hours+" hours "+minutes+" minutes "+seconds+" seconds")

                    if(country_index+1 == country.length){
                        cb()
                    }else{
                        init(cb,country_index+1)
                    }
                })
            })
        })
}

module.exports = init
