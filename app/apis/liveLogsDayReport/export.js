
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var cms_report_db = require('../../models/index_report')
var moment = require('moment')
var path = require('path')
var md5 = require('md5')
var fs = require('fs')

module.exports = {
    name: 'export',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*date_start', '*date_end','*anchor_group','*location'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var where = {}
        //日期格式yyyy-MM-dd hh:mm:ss 或其他js日期格式
        if (inputs.date_start) {
            where.date = where.date || {};
            where.date["$gte"] = new Date(inputs.date_start);
        }
        if (inputs.date_end) {
            where.date = where.date || {};
            where.date["$lt"] = new Date(inputs.date_end);
        }
        if(inputs.anchor_group) {
            where.anchor_group = {$regex: inputs.anchor_group}
        }
        if(inputs.location) {
            where.location = inputs.location
        }

        var stream = cms_report_db.LiveLogsDayReport.find(where).cursor()

        var fields = ['date','location','user_id','loginname','platform','anchor_group','admin_remark','regist_time','sum_live_times','sum_revence','sum_UV','sum_follow_count','sum_gift_count','sum_count' ]
        var fieldNames = ['date','location','UserId','Loginname','Platform','Anchor Group','Admin Remark','Regist Time' ,'Live Times','Gift Value','UV','Follow Count','Gift Count','Live Count']

        res.setHeader('Content-Disposition', 'attachment; filename="live_logs_day_report.csv"');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(fieldNames.join(',')+'\n')]);
        res.write(dataBuffer);
        stream.on('data',function(data){
            var rd = JsonToArray(data,fields).join(',') + '\n'
            res.write(rd);
        })
        stream.on('end',function(){
            res.end();
        })
  }
}

function JsonToArray(obj,fields){
    var result = []
    fields.forEach(function(ele){
        if(typeof(obj[ele]) == 'object' && !(obj[ele] instanceof Array)){
            if(obj[ele]){
                var date_format = new moment(obj[ele]).toISOString()
                result.push(date_format)
            }else{
                result.push(' ')
            }
        }else if(typeof(obj[ele]) == 'string'){
            if(obj[ele]){
                var string_format = obj[ele].split(',').join('`').replace(new RegExp("\n","gm"),"")
                result.push('`'+string_format+'`')
            }else{
                result.push(' ')
            }
        }else{
            result.push(obj[ele])
        }
    })
    return result
}