var schedule = require('node-schedule');
var moment = require('moment');
var getTimezone = require('moment-timezone');
var db_main = require('../app/models/index_main')
var ScheduleLogs = db_main.ScheduleLogs
var GiftRank = db_main.GiftRank
var gift_rank = require('../app/bll/gift_rank/gift_rank')
var logger = require('../app/common/logger').logger('gift_rank_schedule');


var from = getTimezone(new moment('2016-08-11T00:0:0.000Z')).tz("Asia/Jakarta").startOf('day')

GiftRank.remove({},function(){
    gift_rank(from, function(last){

        //把最后一条数据的时间写进schedule_logs表
        ScheduleLogs.findOneAndUpdate({
            name: 'gift_rank'
        },{last_time: last.last_time},{new:true, upsert:true},function(err){
            if(err) return logger.error(err)

            logger.info('schedule_logs init success!')
        })
    })
})