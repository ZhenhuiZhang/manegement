'use strict'
var CONFIG  = require('../../../config');
var EventProxy = require('eventproxy');
var Models = require('../../models/index_readonly')
var json2csv = require('json2csv');
var fs = require('fs')
var resumer = require('resumer')
var PayItem = Models.PayItem

module.exports = {
    name: 'export',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*user_id', '*loginname', '*order_id', '*status',
        '*date_start', '*date_end', '*remark', '*platform',
        '*limit', '*sort', '*page'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var ep = new EventProxy()
        ep.fail(cb)
        var where = {}
        var option = {}

        if (inputs.platform) where.platform = inputs.platform
        if (inputs.user_id) where.user_id = { $in: inputs.user_id.split(',').map(x => parseInt(x)) }
        if (inputs.loginname) where.loginname = { $in: inputs.loginname.split(',').map(x => new RegExp(x, "i")) }
        //支持不等于语法
        if (inputs.status) where.status = inputs.status.indexOf('!') != -1 ? { status: { $ne: parseInt(inputs.status) } } : parseInt(inputs.status)
        if (inputs.order_id) where.order_id = inputs.order_id;

        //日期格式yyyy-MM-dd hh:mm:ss 或其他js日期格式
        if (inputs.date_start) {
            where.create_at = where.create_at || {};
            where.create_at["$gte"] = new Date(inputs.date_start);
        }
        if (inputs.date_end) {
            where.create_at = where.create_at || {};
            where.create_at["$lte"] = new Date(inputs.date_end)
        }
        if (inputs.remark) where.remark = new RegExp(inputs.remark)

        PayItem.find(where, {}, option, function(err,rd){
            var fields = ['create_at','iap_receipt','remark','order_id','platform','user_id','currency','price','gold','status','update_at' ]
            var fieldNames = ['Pay Time','iap receipt','remark','Order Id','Platform','User Id','Currency','price','Gold','Status','Update Time' ]
            var csv = json2csv({ data: rd, fields: fields,fieldNames: fieldNames }).replace(/,,/g,',0,');
            
            var stream = resumer().queue(csv);
            res.setHeader('Content-Disposition', 'attachment; filename="PayItem.csv"');
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.send(csv);
        })
  }
}