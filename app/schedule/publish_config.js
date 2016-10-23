var schedule = require('node-schedule');
var config = require('../../config');
var moment = require('moment')
var Model = require('../models/index_main');
var ConfigVersion = Model.ConfigVersion;
var publish = require('../bll/publish_config/publish')
var logger = require('../common/logger').logger('push');
var tools = require('../common/tools');

//定时发布配置
module.exports = function() {
    // var tz =  config.default_timezone
    // var where = {
    //     publish_at : {$gte: tools.getMoment().tz(tz)},
    //     status : 0
    // }
    // ConfigVersion.find(where,function(err,rd){
    //     rd.forEach(item=>{
    //         var date = tools.getMoment(item.publish_at).tz(tz);
    //         logger.debug('set schedule publish_Config,publish time:', date.format())
    //         var j = schedule.scheduleJob(date.valueOf(), function () {
    //             publish({'_id':item._id},item)
    //         })
    //     })
    // })
}