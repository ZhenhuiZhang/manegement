var schedule = require('node-schedule');
var moment = require('moment');
var getTimezone = require('moment-timezone');
var db_main = require('../app/models/index_main')
var ScheduleLogs = db_main.ScheduleLogs
var NewFansRank = db_main.NewFansRank
var new_fans_rank = require('../app/bll/new_fans_rank/new_fans_rank')
var logger = require('../app/common/logger').logger('new_fans_rank_schedule');


var from = getTimezone(new moment('2016-08-11T07:00:00.000Z')).tz("Asia/Jakarta").startOf('day')

NewFansRank.remove({},function(){
    new_fans_rank(from, function(last){

        //把最后一条数据的时间写进schedule_logs表
        ScheduleLogs.findOneAndUpdate({
            name: 'new_fans_rank'
        },{last_time: last.last_time},{new:true, upsert:true},function(err){
            if(err) return logger.error(err)

            logger.info('schedule_logs init success!')
        })
    })
})