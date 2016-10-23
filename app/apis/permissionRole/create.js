'use strict'
var CONFIG = require('../../../config');
var Models = require('../../models')

module.exports = {
    name: 'create',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['{PermissionRoleModel}'],
    outputs: '',
    executor: function (inputs, res, next, cb, req) {
        inputs.privilege_ids = inputs.privilege_ids.includes('[') || inputs.effect_num.includes('{') ? eval(inputs.privilege_ids) : inputs.privilege_ids; 

        Models.PermissionRole.create(inputs, cb)
    }
}