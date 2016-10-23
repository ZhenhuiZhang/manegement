var CONFIG = require('../../../config');
var CONST = require('../../../const');
var models = require('../../models/index_main');
var cache = require('../../common/cache');
var ConfigVersion = models.ConfigVersion;
var redis = require('../../common/redis');
var EventProxy = require('eventproxy');
var logger = require('../../common/logger').logger('configuration');
var publish = require('../../bll/publish_config/publish');
var tools  = require('../../common/tools');

module.exports = {
    name: 'update',
    description: 'get a config',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,
    inputs: ['?config', '?status', 'AppVersion'],
    outputs: '',
    executor: function (inputs, res, next, cb) {
        var tz = CONFIG.default_timezone;
        inputs.AppVersion = JSON.parse(inputs.AppVersion);
        if(inputs.config) inputs.config = JSON.parse(inputs.config)
        var ep = new EventProxy()
        ep.fail(cb)
        var where = { _id: inputs.AppVersion._id };
        var update = {};
        

        if (parseInt(inputs.status) != 10) {
            //修改配置
            update = { $set: { "config.datas": inputs.config.datas, publish_at: tools.getMoment().tz(tz)} };
            update.$set.location=inputs.AppVersion.location.length!=0?inputs.AppVersion.location:['all'];
            if(!((typeof inputs.AppVersion.platform=='object')&&inputs.AppVersion.platform.constructor==Array))update.$set.platform=inputs.AppVersion.platform.split(',');
            if(inputs.status) update.$set.status = inputs.status;
            ConfigVersion.update(where, update, cb)
        } else {
            //将线上版本下线，更新发布版本,清除缓存
            publish(where,inputs.AppVersion,cb)
        }
    }
}
