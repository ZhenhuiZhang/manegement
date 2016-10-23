'use strict'
var CONFIG = require('../../../config');
var Models = require('../../models')
var lodash = require('lodash')

module.exports = {
    name: 'update',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['{PermissionRoleModel}'],
    outputs: '',
    executor: function (inputs, res, next, cb, req) {
        inputs.privilege_ids = inputs.privilege_ids.includes('[') || inputs.effect_num.includes('{') ? eval(inputs.privilege_ids) : inputs.privilege_ids;
        var update = lodash.clone(inputs);
        delete update._id
        update.location = typeof(update.location)=='string' ? JSON.parse(update.location) : update.location; 
        Models.PermissionRole.findOneAndUpdate({ _id: inputs._id }, { $set: update }, { new: true, upsert: true }, cb)
    }
}