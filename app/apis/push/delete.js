'use strict'
var CONFIG = require('../../../config');
var Models = require('../../models');

module.exports = {
    name: 'delete',
    description: 'delete push',
    checkSign: CONFIG.api_sign_enable,
    version: '1.0.0',
    inputs: ['_id'],
	outputs: '[{PushModal}]',
	executor: function (inputs, res, next, cb) {
		Models.Push.remove(inputs ,cb);
	}
}