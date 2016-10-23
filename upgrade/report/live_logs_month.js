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
var time = '2016-09-01 00:00:00'
var from = new moment(time).startOf('day')
var to = new moment(time).startOf('day').add(1, 'day')
init_month(from,to)

function init_month(date_from,date_to){

    var where = {
        date : {
            $gte: moment.tz(date_from.format('L'),'utc').toDate(), $lt: moment.tz(date_to.format('L'),'utc').toDate()
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
                location: {$first: '$location'}
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
                admin_remark:1,
                location:1
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
                update.location = element.location           
                
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

            var now = new moment().add(-1,'days')
            date_from.add(1,'days')
            date_to.add(1,'days')
            if(date_from.format('L') == now.format('L')){

                //更新官方主播的资料
                db_readonly.User.find({anchor_group: 'official'},function(err,official_users){
                    var _official_users = []
                    official_users.forEach(function(ele,index){
                        var date = new Date(getTimezone(date_from).tz("UTC").startOf('month').toDate())
                        var key = {
                            user_id:ele.user_id,
                            // platform: update.platform,
                            // host_manager: element.host_manager,
                            year:update.date.getFullYear(),
                            month:update.date.getMonth()+1
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
                            location: ele.location,
                            key:key
                        }

                        LiveLogsMonthReport.findOneAndUpdate({key: key},official_update,{new:true, upsert:true},function(err,datas){
                            if(err) console.log(err)
                            
                            if(official_users.length == index+1){
                                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'live_logs_month_report init success!')
                                logger.info(date_from.add(-1,'days').format(),date_to.add(-1,'days').format(),'official anchor update success')
                            }
                        })
                    })
                })
            }else{
                init_month(date_from,date_to)
            }
        })
        // console.log(err,rd)
}
