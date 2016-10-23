
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var Models = require('../../models')

module.exports = {
    name: 'findOne',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,  
    inputs: ['_id'],
    outputs:'{AdminModel}',
    executor: function(inputs,res,next, cb, req){
        Models.Admin.findOne(inputs,cb)
  }
}