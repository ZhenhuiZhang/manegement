var schedule = require('node-schedule');
var config = require('../../config');
var moment = require('moment')
var Models = require('../models');
var pushServer 	 = require('../bll/call_push_server');
var logger = require('../common/logger').logger('push');
var tools = require('../common/tools');
var pushMethod = require('../apis/push/pushMethod');

module.exports = function() {
    var tz =  config.default_timezone
    var where = {
        shcedule_push_time : {$gte: tools.getMoment().tz(tz)},
    }
    Models.Push.find(where,function(err,rd){
        rd.forEach(push=>{
            if(push.push_attr.oper_times==push.push_attr.cur_oper_time)return false
            var date = tools.getMoment(push.shcedule_push_time).tz(tz);
            logger.debug('set schedule push,send time:', date.format())
            var j = schedule.scheduleJob(date.valueOf(), function(){
                pushMethod(push._id,push.contents,push.locations);
            })
        })
    })
}