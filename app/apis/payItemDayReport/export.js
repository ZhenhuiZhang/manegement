
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
    inputs: ['*date_start', '*date_end'],
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

        var stream = cms_report_db.PayItemDayReport.find(where).cursor()

        var fields = ['date','location','gold','currency','sum_account','user_id','loginname','platform','status' ]
        var fieldNames = ['date','location','gold','currency','Price','UserId','Loginname','platform','status' ]

        res.setHeader('Content-Disposition', 'attachment; filename="pay_item_day_report.csv"');
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