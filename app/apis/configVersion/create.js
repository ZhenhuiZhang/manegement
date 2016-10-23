'use strict'
var CONFIG = require('../../../config');
var Model = require('../../models/index_main');
var ConfigVersion = Model.ConfigVersion;
var lodash = require('lodash');
var tools = require('../../common/tools');
var publish = require('../../bll/publish_config/publish')
var logger = require('../../common/logger').logger('config');
var schedule = require('node-schedule');

module.exports = {
    name: 'create',
    description: '新增配置版本信息',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,
    inputs: ['config', 'platform', '*platform_ver','*location','publish_at'],
    outputs: '',
    executor: function (inputs, res, next, cb) {
        var tz = CONFIG.default_timezone;
        inputs.config = JSON.parse(inputs.config);
        var where = lodash.clone(inputs);
        where.platform=where.platform.split(',')
        if(where.location)where.location=where.location.split(',')
        else where.location=['all']
        if(inputs.platform_ver){
			var version = inputs.platform_ver.split('.')
			where.platform_ver_num = version[0] * 1000000 + version[1] * 1000 + version[2] * 1;
		}
        if (where.platform == "common") {
            //sort有利于查询时common排在平台版本的前面
            where.sort = 1;
        } else {
            where["config"] = inputs.config;
        }
        
        //查询该common版本的配置是否存在publish的
        ConfigVersion.findOne({ platform: 'common', status: 10 }, function (err, findcommon) {
            if (err) {
                logger.error('find published common error:', err ,findcommon)
                return cb(err);
            }
            // if (err) return cb(err);
            if(!findcommon&&where.platform != "common") return cb(1,"You must publish common configuration first!")
            if(where.platform != "common"){
                where.config.version = parseInt(findcommon.config.version)+1;
                where.config.gift_version = parseInt(findcommon.config.gift_version);
            }
            //定时发送
            if(where.publish_at&&where.publish_at!='now'){
                where.publish_at = tools.getMoment(where.publish_at).tz(tz);
                ConfigVersion.create(where,function (err, rd) {
                    if (err) {
                        logger.error('create configuration error:', err ,rd)
                        return cb(err);
                    }
                    logger.debug('set schedule publish_Config,publish time:', where.publish_at.format())
                    var j = schedule.scheduleJob(where.publish_at.valueOf(), function () {
                        publish({'_id':rd._id},rd)
                    })
                    return cb(null, rd)
                })
            }else{
                where.publish_at = ""
                ConfigVersion.create(where,cb)
            }
            
        })
    }
}