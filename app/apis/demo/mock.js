
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var Mock = require('mockjs')

module.exports = {
    name: 'mock',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*id'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var data = Mock.mock({
            // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
            'list|1-10': [{
                // 属性 id 是一个自增数，起始值为 1，每次增 1
                'id|+1': 1
            }]
        })
        console.log('url',req.url,req.url.split('?')[0] )
              
        cb(null,data.list)
  }
}