'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');

module.exports = {
    name: 'cms_search_user',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['?search'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        inputs.user_id = Number(inputs.search);
        var where = {}
        //如果是用户id的话就直接查询用户，否则就是查询用户名，使用模糊搜索
        if(isNaN(Number(inputs.search))){
            where.loginname = inputs.search;
                return cb(null,{type:inputs.search})
        }else{
             where.user_id = Number(inputs.search)
             apiclient.get('/user/findOne',where,function(err,rd){
                if(!rd||err) return cb(err,rd)
                return cb(null,rd)
            })
        }
        
  }
}