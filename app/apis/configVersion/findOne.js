var CONFIG = require('../../../config');
var models = require('../../models/index_main');
var lodash = require('lodash')
var logger = require('../../common/logger').logger('config');
var ConfigVersion = models.ConfigVersion;

module.exports = {
	name: 'findOne',
	description: 'get a config',
	version: '1.0.0',
	checkSign: CONFIG.api_sign_enable,
	inputs: ['*_id','*operation', '*status', '*platform'],
	outputs: '{configVersionModel}',
	executor: function (inputs, res, next, cb) {
		var where = inputs
		var type = inputs.operation?inputs.operation:"";
		delete where.operation

		//如果是common的创建页面，则查询现有的最大版本号
		if (inputs.platform != 'common' && type == 'publish') {
			delete where.platform
			//平台的view页面，将common的和platform的merge
			ConfigVersion.findOne({ platform: 'common', status: 10 }, {}, { sort: { platform_ver: -1 } }, function (err, find_common) {
				if (err) {
					logger.error('find published common config error:', err ,find_common)
					return cb(err);
				}
				ConfigVersion.findOne(where, {}, { sort: { platform_ver: -1 } }, function (err, rd) {
					rd.config = lodash.merge(find_common.config,rd.config)
					cb(err, rd)
				});
			});
		} else {
			ConfigVersion.findOne(where, {}, { sort: { 'config.version': -1 } }, function(err,rd){
				if (err) {
					logger.error('findOne config error:', err ,rd)
					return cb(err);
				}
				cb(null,rd)
			})
		}
	}
}