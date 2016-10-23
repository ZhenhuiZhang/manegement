//自动运行脚本，生成前一天月报表
//若要做修改，务必上测试环境测试此脚本
var moment = require('moment');
var getTimezone = require('moment-timezone');
var md5 = require('md5')
var cms_report_db = require('../../models/index_report')
var db_readonly = require('../../models/index_readonly')
var logger = require('../../common/logger').logger('live_logs_month_report');
var official_exports_schedule = require('../live_logs_official_export.js')
var all_user_exports_schedule = require('../live_logs_all_user_export.js')
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var LiveLogsMonthReport =cms_report_db.LiveLogsMonthReport
var db_main = require('../../models/index_main')
var ScheduleLogs = db_main.ScheduleLogs

module.exports = function(){
    var start = new Date()

    var yestoday = new moment().add(-1, 'day')
    var today = new moment()

    //获取日期范围
    var from = moment.tz(yestoday.format('YYYY-MM-DD'),'utc')
    var to = moment.tz(today.format('YYYY-MM-DD'),'utc')

    var where = {
        //utc时间
        date : {
            $gte: from.toDate(), $lt: to.toDate() 
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
                    // anchor_group: "$anchor_group",
                    date: {$dateToString: { format: "%Y-%m", date: "$date"}},
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
                location: {$first: '$location'},
                fans: {$max: '$fans'},
                gift_revenue_history: {$max: '$gift_revenue_history'}
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
                admin_remark:1,
                regist_time:1,
                location: 1,
                fans: 1,
                gift_revenue_history: 1
            }
        }])
        .allowDiskUse(true).exec(function(err,rd){
            // console.log(date_from.format(),date_to.format())
            rd.forEach(function(element,index) {
                var update = {$inc:{}}

                update.user_id = element._id.user_id
                // update.platform = element._id.platform
                update.date = new Date(element._id.date)
                update.year = update.date.getFullYear()
                update.month = update.date.getMonth()+1
                update.anchor_group = element._id.anchor_group
                update.loginname = element.loginname
                update.admin_remark = element.admin_remark
                update.regist_time = element.regist_time
                update.DAU = element.DAU
                update.location = element.location
                update.gift_revenue_history = element.gift_revenue_history
                update.fans = element.fans
                delete element._id                
                
                update.$inc.sum_count = element.sum_count
                update.$inc.sum_live_times = element.sum_live_times
                update.$inc.sum_revence = element.sum_revence
                update.$inc.sum_UV = element.sum_UV
                update.$inc.sum_follow_count = element.sum_follow_count
                update.$inc.sum_gift_count = element.sum_gift_count

                update['day_live_times_'+from.date()] = element.sum_live_times
                update['day_revence_'+from.date()] = element.sum_revence
                update['day_UV_'+from.date()] = element.sum_UV
                // update['day_DAU_'+date_from.date()] = element.sum_DAU
                update['day_follow_count_'+from.date()] = element.sum_follow_count
                update['day_gift_count_'+from.date()] = element.sum_gift_count

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

                    if(rd.length == index+1){
                        logger.info(from.format(),to.format(),'live_logs_month_report init success!')

                        //更新官方主播的资料
                        db_readonly.User.find({anchor_group: 'official'},function(err,official_users){
                            official_users.forEach(function(ele,index){
                                var date = new moment(from.toDate()).startOf('month').toDate()
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
                                    location: ele.location,
                                    gift_revenue_history: ele.gift_revenue_history || 0,
                                    fans: ele.fans || 0,
                                    key:key
                                }

                                LiveLogsMonthReport.findOneAndUpdate({key: key},official_update,{new:true, upsert:true},function(err,datas){
                                    if(err) console.log(err)

                                    if(official_users.length == index+1){
                                        logger.info(from.format(),to.format(),'official anchor update success')
                                        official_exports_schedule(all_user_exports_schedule)
                                    }
                                })
                            })
                        })

                        //创建报表记录，用于查询报表是否失败
                        ScheduleLogs.create({name:'live_logs_report',last_time: from.toDate()},function(err){
                            if(err) console.log(err)

                            logger.info('live_logs_report schedule logs init success!')
                        })
                    }
                })
            }, this);
    })
}