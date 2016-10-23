
'use strict'
var CONFIG  = require('../../../config');
var Models = require('../../models')
var lodash = require('lodash');
var EventProxy   = require('eventproxy');

module.exports = {
    name: 'find',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*{OperateLogModel}','*q','*limit', '*sort','*page'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var ep = new EventProxy();
        ep.fail(cb);
        var option = {};
        inputs.page = inputs.page || 1;
        var where = lodash.clone(inputs);
        delete where.limit;
        delete where.page;
        var q = inputs.q
        option.limit = Number(inputs.limit) || 15
        
        if(inputs.page>1)option.skip = (inputs.page-1) * option.limit;
        option.sort = { create_at:-1 }

        if(q) {
            where = {$or:[
                {user: new RegExp(q,'i')},
                {operation: new RegExp(q,'i')}
            ]}
            delete where.q
        }
        
        Models.OperateLog.count(where, ep.done(function(rd){
            ep.emit('count', rd);
        }))
        Models.OperateLog.find(where,{} , option , ep.done(function(rd){
            ep.emit('find', rd);
        }))

        ep.all('count','find',function(count,find) {  
            var result = {
                models : find ,
                totalRows: count
            }
            cb(null, result);
        })
  }
}