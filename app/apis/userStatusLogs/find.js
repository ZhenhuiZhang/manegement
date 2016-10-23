'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var Models = require('../../models');
var Models_main = require('../../models/index_main');
var EventProxy   = require('eventproxy');


module.exports = {
    name: 'find',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*limit','*sort','*page','*q'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var ep = new EventProxy();
        ep.fail(cb);
        var where={}
        var option ={}

        option.limit = Number(inputs.limit) || 30
        if(inputs.sort)
            option.sort = JSON.parse('{' +   inputs.sort.replace(/(\w+):(-)?1/g,'"$1":$21')  + '}')
        else
            option.sort = { create_at:-1 }
        
        inputs.page = inputs.page || 1;
        if(inputs.page>1)option.skip = (inputs.page-1) * option.limit;
        
        Models_main.User_Status_Logs.count(where, ep.done(function(rd){
            ep.emit('count', rd);
        }))
        //默认不返回一些字段。
        //TODO：后续改为可在查询中指定
        Models_main.User_Status_Logs.find( where, {}, option, ep.done(function(rd){
            ep.emit('find', rd);
        }))

        ep.all('count','find',function(count,find) {  
            var result = {
                models : find ,
                totalRows: count
            }
            cb(null, result)
        })
        // Models_main.User_Status_Logs.find({},{},option,function(err,logs) {
        // var result = {
        //         models : logs ,
        //         totalRows: logs.length
        //     }
        //     cb(null, result);
        // })

  }
}