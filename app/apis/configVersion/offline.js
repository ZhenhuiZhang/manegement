var CONFIG  = require('../../../config');
var models  = require('../../models/index_main');
var ConfigVersion    = models.ConfigVersion;
var EventProxy = require('eventproxy');
var logger = require('../../common/logger').logger('config');

module.exports = {
  name: 'offline',
  description: 'offline a config',
  version: '1.0.0',
  checkSign: CONFIG.api_sign_enable,
  inputs: ['_id'],
  outputs:'',
  executor: function(inputs, res, next, cb){
        var ep = new EventProxy()
        ep.fail(cb)
        ep.once('findcommon',function(findcommon){
            ConfigVersion.findOneAndUpdate({ _id: inputs._id }, {$set:{status:0}}, function (err, data) {
                if (err) {
					logger.error('offline config error:', err ,data)
					return cb(err);
				}
                cb(null,data)
            })
        })

        ConfigVersion.find({platform:'common','status':10}, function(err,rd){
            if (err) {
                logger.error('find published common config error:', err ,rd)
                return cb(err);
            }
            if(rd.length==0)return cb(1, {error:"there is no common configuration published,you can't offline this configuration!"})
            ep.emit('findcommon', rd);
        });
  }
}