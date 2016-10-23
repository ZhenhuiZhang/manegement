'use strict'
var CONFIG = require('../../../config');
var moment = require('moment')
var Models = require('../../models');
var schedule = require('node-schedule');
var pushServer = require('../../bll/call_push_server');
var moment = require("moment");
var logger = require('../../common/logger').logger('push');
var tools = require('../../common/tools');
var pushMethod = require('./pushMethod');
var lodash = require('lodash')

module.exports = {
    name: 'create',
    description: '新建push',
    checkSign: CONFIG.api_sign_enable,
    inputs: ['[contents]', 'expect_nums', 'oper_times','name', 'cur_oper_time','locations', 'platforms','*target', '*date_start',
             '*date_end', '*is_push_now', '*shcedule_push_time', '*push_status'],
    version: '1.0.0',
    outputs: "",
    executor: function (inputs, res, next, cb, req) {
        var tz = CONFIG.default_timezone;
        inputs.user_range = {}
        if (inputs.date_start) inputs.user_range.date_start = tools.getMoment(inputs.date_start).tz(tz);
        else inputs.user_range.date_start=""
        if (inputs.date_end) inputs.user_range.date_end = tools.getMoment(inputs.date_end).tz(tz);
        else inputs.user_range.date_end=""
        delete inputs.date_start
        delete inputs.date_end
        if (inputs.shcedule_push_time) inputs.shcedule_push_time = tools.getMoment(inputs.shcedule_push_time).tz(tz);
        inputs.push_attr = {
            expect_nums: inputs.expect_nums,
            oper_times: inputs.oper_times,
            cur_oper_time: inputs.cur_oper_time
        }
        inputs.contents = eval(inputs.contents)
        inputs.history_contents = lodash.clone(inputs.contents)
        if(inputs.locations != undefined) inputs.locations = inputs.locations.includes('[') || inputs.locations.includes('{') ? eval(inputs.locations) : inputs.locations
        if(inputs.platforms != undefined) inputs.platforms = inputs.platforms.includes('[') || inputs.platforms.includes('{') ? eval(inputs.platforms) : inputs.platforms
        inputs.contents.forEach(item=>{
            if(item.$$hashKey) delete item.$$hashKey
        })
        delete inputs.expect_nums;
        delete inputs.oper_times;
        delete inputs.cur_oper_time;
        //设置未发送状态
        inputs.push_status =inputs.push_status|| 0;
        if (parseInt(inputs.is_push_now) == 1) {
            Models.Push.create(inputs, function (err, rd) {
                if (err) {
                    logger.error('UPDATE PUSH ERROR:', err ,rd)
                    return cb(err);
                }
                //推送逻辑
                pushMethod(rd._id,rd.contents,rd.locations);
                return cb(null, rd)
            })
        } else {
            Models.Push.create(inputs, function (err, rd) {
                logger.debug('set schedule push,send time:', inputs.shcedule_push_time.format())
                if (process.env.NODE_ENV === 'dev') {return cb(null)}
                var j = schedule.scheduleJob(inputs.shcedule_push_time.valueOf(), function () {
                   pushMethod(rd._id,rd.contents,rd.locations);
                })
                return cb(null, rd)
            })
        }
    }
}