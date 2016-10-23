'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');

module.exports = {
    name: 'officialFindOne',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['?_id','?my_id','?user_id','?mobile', '*mobile_region', '?email','?loginname','?facebook_id','?twitter_id','?google_id'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        apiclient.get('/user/findOne',inputs,function(err,rd){
            cb(err,rd.body)
        })
  }
}