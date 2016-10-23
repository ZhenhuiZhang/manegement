'use strict'
var CONFIG = require('../../../config');
var moment = require('moment')
var Models = require('../../models');
var schedule = require('node-schedule');
var pushServer = require('../../bll/call_push_server');
var moment = require("moment");
var logger = require('../../common/logger').logger('push');
var tools = require('../../common/tools');
var request =require('request')
var lodash =require('lodash');
var pushMethod = require('./pushMethod');

module.exports = {
    name: 'push',
    description: '新建push',
    checkSign: CONFIG.api_sign_enable,
    inputs: ['_id' , '[contents]', 'cur_oper_time', 'locations','platforms','*is_push_now', '*shcedule_push_time','[history_contents]'],
    version: '1.0.0',
    outputs: "",
    executor: function (inputs, res, next, cb, req) {
        var tz = CONFIG.default_timezone;
        var where = {_id : inputs._id}
        if (inputs.shcedule_push_time) inputs.shcedule_push_time = tools.getMoment(inputs.shcedule_push_time).tz(tz);
        if(inputs.locations != undefined) inputs.locations = inputs.locations.includes('[') || inputs.locations.includes('{') ? eval(inputs.locations) : inputs.locations
        if(inputs.platforms != undefined) inputs.platforms = inputs.platforms.includes('[') || inputs.platforms.includes('{') ? eval(inputs.platforms) : inputs.platforms
        inputs.contents = eval(inputs.contents)
        inputs.history_contents = eval(inputs.history_contents)
        inputs.contents.forEach(item=>{
            if(item.$$hashKey) delete item.$$hashKey
        })
        inputs.history_contents.forEach(item=>{
            if(item.$$hashKey) delete item.$$hashKey
        })
        var update = { 
                $set: {
                    'contents': inputs.contents,
                     ["push_attr.cur_oper_time"]: parseInt(inputs.cur_oper_time),
                     'history_contents' : lodash.uniqWith(inputs.contents.concat(inputs.history_contents), lodash.isEqual),
                     'platform': inputs.platform,
                     'locations': inputs.locations,
                     "shcedule_push_time":inputs.shcedule_push_time,
                     'is_push_now' :inputs.is_push_now
                } 
            }
        //设置未发送状态
        // if (!inputs.push_status) inputs.push_status = 0;
        if (Number(inputs.is_push_now) == 1) {
            Models.Push.findOneAndUpdate(where, update,{},function (err, rd) {
                if (err) {
                    logger.error('UPDATE PUSH ERROR:', err ,rd)
                    return cb(err);
                }
                pushMethod(rd._id,rd.contents,rd.locations);
                return cb(null, rd)
            })
        } else {
            Models.Push.findOneAndUpdate(where, update,{}, function (err, rd) {
                if (err) {
                    logger.error('UPDATE PUSH ERROR:', err ,rd)
                    return cb(err);
                }
                logger.debug('set schedule push,send time:', inputs.shcedule_push_time.format())
                var j = schedule.scheduleJob(inputs.shcedule_push_time.valueOf(), function () {
                    pushMethod(rd._id,rd.contents,rd.locations);
                })
                return cb(null, rd)
            })
        }
    }
}