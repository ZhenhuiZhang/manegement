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

//更新官方主播的资料
db_readonly.User.find({anchor_group: 'official'},function(err,official_users){

    var _official_users = []
    official_users.forEach(function(ele,index){
        var date = new moment().utc().startOf('month').toDate()
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
            key:key
        }

        LiveLogsMonthReport.findOneAndUpdate({key: key},official_update,{new:true, upsert:true},function(err,datas){
            if(err) console.log(err)

            if(official_users.length == index+1){
                logger.info(from.add(-1,'days').format(),to.add(-1,'days').format(),'official anchor update success')
            }
        })
    })
})