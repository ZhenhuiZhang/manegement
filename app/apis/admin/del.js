
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var tools  = require('../../common/tools');
var Models = require('../../models')
var md5 = require('md5')

module.exports = {
    name: 'del',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,  
    inputs: ['ids'],
    executor: function(inputs,res,next, cb, req){
        Models.Admin.remove({_id:{ $in:inputs.ids.split(',') }} ,cb)
  }
}