
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var Models = require('../../models')

module.exports = {
    name: 'find',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['{PermissionModulesModel}'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        Models.PermissionModules.find(inputs,{},{ sort: {level:1,name:1}},function(err,rd) {
            cb(err,{
                models: rd,
                totalRows: rd.length
            })
        })
  }
}