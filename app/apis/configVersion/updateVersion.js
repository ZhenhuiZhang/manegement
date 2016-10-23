var CONFIG  = require('../../../config');
var models  = require('../../models/index_main');
var logger = require('../../common/logger').logger('config');
var ConfigVersion    = models.ConfigVersion;
var CONST = require('../../../const');
var cache = require('../../common/cache');
var redis = require('../../common/redis');

module.exports = {
    name: 'updateVersion',
    description: 'updateVersion',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,
    inputs: [],
    outputs:'',
    executor: function(inputs, res, next, cb){
        ConfigVersion.findOne({ platform: "common" ,status:10},{},{sort:{"config.version":-1}}, function (err, result) {
            if (err) {
                logger.error('find version error:', err ,result)
                return cb(err);
            }
            var update = {
                $set: {
                    "config.version":parseInt(result.config.version)+1
                }
            }
            ConfigVersion.update({}, update, { multi: true }, function (err, result) {
                if (err) {
                    logger.error('update version error:', err ,result)
                    return cb(err);
                }
                //删除所有的缓存项
                redis.keys(CONST.CACHE_NAME_CONFIG +'*').then(function (keys) {
                    var pipeline = redis.pipeline()
                    keys.forEach(key=> pipeline.del(key) )
                    logger.info("delete all "+CONST.CACHE_NAME_CONFIG+" cache", keys.length)
                    pipeline.exec()
                })
                redis.keys(CONST.CACHE_NAME_GIFT_FIND +'*').then(function (keys) {
                    var pipeline = redis.pipeline()
                    keys.forEach(key=> pipeline.del(key) )
                    logger.info("delete all "+CONST.CACHE_NAME_GIFT_FIND+" cache", keys.length)
                    pipeline.exec()
                })
                cb(null, result);
            })
        })
    }
}