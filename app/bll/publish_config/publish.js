'use strict'
var CONST = require('../../../const');
var models = require('../../models/index_main');
var cache = require('../../common/cache');
var ConfigVersion = models.ConfigVersion;
var redis = require('../../common/redis');
var EventProxy = require('eventproxy');
var logger = require('../../common/logger').logger('configuration');
var lodash = require('lodash');
const publish_status = 10 //status:10为发布状态，0为未发布状态

module.exports = function(where,AppVersion,cb) {
    var matchLocation = {$or:[]}
    AppVersion.location.forEach(function(ele,index){
        var andMatch={ $and:[]}
        AppVersion.platform.forEach(function(platform,index){
            andMatch.$and.push({
                'platform':platform,
                'status':10,
                'location':ele,
            })
        })
        matchLocation.$or.push(andMatch)
    })
    var ep = new EventProxy()
    ep.fail(cb)

    ep.once("lastdata", function (lastdata) {
        //每次发布任何配置，删除所有的缓存项
        redis.keys(CONST.CACHE_NAME_CONFIG +'*').then(function (keys) {
            var pipeline = redis.pipeline()
            keys.forEach(key=> pipeline.del(key) )
            logger.info("delete all cache", keys.length)
            return pipeline.exec()
        })
        logger.info('publish over');
        if(typeof cb == 'function')return cb(null);
        else return false
        
    })

    //publish逻辑
    ep.once("updateversion", function (updateversion) {
        ConfigVersion.update(where, { $set: { status: publish_status ,publish_at:new Date()} }, function (err, rd) {
            if (err) return cb(err);
            ep.emit("lastdata", rd)
        })
    })


    ConfigVersion.find(matchLocation,function(err,rd){
        //处理要发布的配置与yijingpublish的配置platform相同且location有冲突的配置，
        rd.forEach(function(ele,index){
            if(AppVersion.platform.length!=2&&ele.platform.length==2){
                return cb(1,"The configuration you publish,It's location and platform are conflict with other configuration.Please check!");
            }
            var update = {};
            var national = lodash.difference(ele.location,AppVersion.location)
            if(national.length==0) update={ $set: { status: 0 } }
            else update={ $set: { location: national } }
            ConfigVersion.findOneAndUpdate({ _id: ele._id }, update, function (err, data) {
                if (err) return cb(err);
                ep.emit('updateMatchConfig', data);
            })
        })

        //更新所有配置的version为正在publish的common版本的version+1
        ep.after('updateMatchConfig', rd.length, function (list) {
                ConfigVersion.findOne({ platform: "common",status:10 }, function (err, result) {
                    if (err) {
                        logger.error('find gift_version error:', err ,result)
                        return cb(err);
                    }
                    if(result){
                        var update = {
                            $set: {"config.version":Number(result.config.version)+1}
                        }
                        ConfigVersion.update({}, update, { multi: true }, function (err, result) {
                            if (err) {
                                logger.error('update version error:', err ,result)
                                return cb(err);
                            }
                            ep.emit("updateversion", result)
                        })
                    }else{
                        ep.emit("updateversion", result)
                    }
                })
        });
    })  
}
