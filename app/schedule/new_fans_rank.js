// var schedule = require('node-schedule');
// var moment = require('moment');
// var getTimezone = require('moment-timezone');
// var db_main = require('../models/index_main')
// var ScheduleLogs = db_main.ScheduleLogs
// var new_fans_rank = require('../bll/new_fans_rank/new_fans_rank')
// var logger = require('../common/logger').logger('new_fans_rank_schedule');

module.exports = function() {
    // var rule = new schedule.RecurrenceRule();
    // rule.minute =[0,5,10,15,20,25,30,35,40,45,50,55];  //每隔5分钟运行

    // var j = schedule.scheduleJob(rule,function() {
    //     logger.info('build new_fans_rank start,wait')

    //     ScheduleLogs.findOne({
    //         name: 'new_fans_rank'
    //     },function(err,rd){
    //         if(err) logger.error('new_fans_rank findOne error')
            
    //         if(!rd){
    //             rd = {}
    //             rd.last_time = new Date('2016-09-09T14:00:00Z')
    //         }
    //         new_fans_rank(rd.last_time,function(last){
    //             //把最后一条数据的时间写进schedule_logs表
    //             ScheduleLogs.findOneAndUpdate({
    //                 name: 'new_fans_rank'
    //             },{last_time: last.last_time},{new:true, upsert:true},function(err){
    //                 if(err) return logger.error(err)

    //                 logger.info('schedule_logs update success!')
    //             })
    //         })
    //     })
    // })
}