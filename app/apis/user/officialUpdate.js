'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');

module.exports = {
    name: 'officialUpdate',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['?user_id','?loginname','*admin_remark','*{UserModel}','*FCM_id.android','*FCM_id.ios','*location'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        apiclient.get('/user/update',inputs,function(err,rd){
            cb(err,rd.body)
        })
  }
}