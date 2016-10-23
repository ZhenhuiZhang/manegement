'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var Models = require('../../models')

module.exports = {
    name: 'findOne',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['_id'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        Models.PermissionRole.findOne(inputs,cb)
  }
}