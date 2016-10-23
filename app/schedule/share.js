// var readline = require('linebyline')
// var moment = require('moment')
// var getTimezone = require('moment-timezone');
// var db_main = require('../models/index_main')
// var Share = db_main.Share
// var schedule = require('node-schedule');
// var logger = require('../common/logger').logger('share');

module.exports = function() {
    // var rule = new schedule.RecurrenceRule();
    // rule.minute =15  //每小时15分运行

    // var j = schedule.scheduleJob(rule,function() {
    //     //定义文件夹名称
    //     var _now = new moment().add(-1,'hours')
    //     var now = new moment().add(-1,'hours').format('YYYYMMDDHH')
    //     var rl = readline('/tmp/data/click_log/'+now+'/data.log')
    //     var max = 5
    //     if(moment.tz(_now.toDate(),"Asia/Jakarta").date() == 30){
    //         max = 10
    //     }
    //     var datas = []
    //     rl.on("line", function (line, lineCount, byteCount){
    //         // do something with the line of converted text
    //         var read_data = {}
    //         var exp = line.split('`')
    //         exp.forEach(function(ele){
    //             var _ele = ele.split('=')
    //             read_data[_ele[0]] = _ele[1]
    //         })

    //         if(read_data.hasOwnProperty('ft') && read_data.hasOwnProperty('uid') && read_data.hasOwnProperty('aid')){
    //             var create_at = moment.tz(read_data.stm,'Asia/Shanghai').utc().toDate()
    //             var data = {
    //                 share_id : 1,
    //                 user_id : read_data.uid,
    //                 share_user_id : read_data.aid,
    //                 channel : read_data.ft,
    //                 loginname: read_data.loginname || '',
    //                 create_at: create_at,
    //                 source: 0 //来源为日志文件
    //             }
    //             datas.push(data)
    //             if(_now.date() == 30){
    //                 datas.push(data)
    //             }
    //         }
    //     }).on("end",function(){
    //         var _date = moment.tz(_now.toDate(),"Asia/Jakarta").hours(0)
    //         var _to = moment.tz(_now.toDate(),"Asia/Jakarta").hours(0).add(1,'days')
    //         datas.forEach(function(ele,index){
    //             setTimeout(function(){
    //                 Share.count({user_id: ele.user_id,create_at: {$gte: _date.toDate(),$lt: _to.toDate()}},function(err,count){
    //                     if(err) logger.error(err)
                        
    //                     if(count < max){
    //                         Share.create(ele,function(err){
    //                             if(err) console.log(err)

    //                             if(datas.length == index+1){
    //                                 logger.info('time: '+ now + ' , share data create success')
    //                             }
    //                         })
    //                     }else{
    //                         if(datas.length == index+1){
    //                             logger.info('time: '+ now + ' , share data create success')
    //                         }
    //                     }
    //                 })
    //             },index*100)
    //         })
    //     });
    // })
}