'use strict'
var CONFIG = require('../../../config');
var Models = require('../../models');

module.exports = {
    name: 'findOne',
    description: 'find push',
    checkSign: CONFIG.api_sign_enable,
    version: '1.0.0',
    inputs: ['_id','*sort','*limit','*page'],
	outputs: '[{PushModal}]',
	executor: function (inputs, res, next, cb) {
		Models.Push.findOne(inputs, function(err,rd){
            if(err)return cb(err)
            cb(null, rd)
		})
	}
}