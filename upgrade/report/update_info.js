var db_readonly = require('../../app/models/index_readonly')
var logger = require('../../app/common/logger').logger('update_report_info');
var moment = require('moment');
var getTimezone = require('moment-timezone');
var md5 = require('md5')
var cms_report_db = require('../../app/models/index_report')
var LiveLogsMonthReport =cms_report_db.LiveLogsMonthReport

var yestoday = new moment().add(-1, 'day')

//获取日期范围
var from = moment.tz(yestoday.format('YYYY-MM-DD'),'utc')

var users = []

//更新官方主播的资料
db_readonly.User.find({user_id: {$in: users}},function(err,all_users){
    all_users.forEach(function(ele,index){
        var date = new moment(from.toDate()).startOf('month')
        var key = {
            user_id:ele.user_id,
            // platform: update.platform,
            // host_manager: element.host_manager,
            year:date.getFullYear(),
            month:date.getMonth()+1
        }
        key = md5(JSON.stringify(key))

        var user_update = {
            user_id: ele.user_id,             
            anchor_group: ele.anchor_group,    
            loginname: ele.loginname,
            date: date.toDate(),
            year: date.getFullYear(),
            month: date.getMonth()+1,
            admin_remark: ele.admin_remark,
            regist_time: ele.create_at,
            location: ele.location,
            gift_revenue_history: ele.gift_revenue_history || 0,
            fans: ele.fans || 0,
            key:key
        }

        LiveLogsMonthReport.findOneAndUpdate({key: key},user_update,{new:true, upsert:true},function(err,datas){
            if(err) console.log(err)

            if(all_users.length == index+1){
                logger.info(from.format(),to.format(),'all anchor update success')
            }
        })
    })
})