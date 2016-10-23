
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

        var stream = cms_report_db.LiveLogsMonthReport.find(where).cursor()

        var fields = ['date','location','user_id','loginname','anchor_group','admin_remark','regist_time','gift_revenue_history','fans','sum_count','sum_live_times','sum_revence','sum_UV','sum_follow_count','sum_gift_count','day_live_times_1','day_live_times_2','day_live_times_3','day_live_times_4','day_live_times_5','day_live_times_6','day_live_times_7','day_live_times_8','day_live_times_9','day_live_times_10','day_live_times_11','day_live_times_12','day_live_times_13','day_live_times_14','day_live_times_15','day_live_times_16','day_live_times_17','day_live_times_18','day_live_times_19','day_live_times_20','day_live_times_21','day_live_times_22','day_live_times_23','day_live_times_24','day_live_times_25','day_live_times_26','day_live_times_27','day_live_times_28','day_live_times_29','day_live_times_30','day_live_times_31','day_revence_1','day_revence_2','day_revence_3','day_revence_4','day_revence_5','day_revence_6','day_revence_7','day_revence_8','day_revence_9','day_revence_10','day_revence_11','day_revence_12','day_revence_13','day_revence_14','day_revence_15','day_revence_16','day_revence_17','day_revence_18','day_revence_19','day_revence_20','day_revence_21','day_revence_22','day_revence_23','day_revence_24','day_revence_25','day_revence_26','day_revence_27','day_revence_28','day_revence_29','day_revence_30','day_revence_31','day_UV_1','day_UV_2','day_UV_3','day_UV_4','day_UV_5','day_UV_6','day_UV_7','day_UV_8','day_UV_9','day_UV_10','day_UV_11','day_UV_12','day_UV_13','day_UV_14','day_UV_15','day_UV_16','day_UV_17','day_UV_18','day_UV_19','day_UV_20','day_UV_21','day_UV_22','day_UV_23','day_UV_24','day_UV_25','day_UV_26','day_UV_27','day_UV_28','day_UV_29','day_UV_30','day_UV_31','day_follow_count_1','day_follow_count_2','day_follow_count_3','day_follow_count_4','day_follow_count_5','day_follow_count_6','day_follow_count_7','day_follow_count_8','day_follow_count_9','day_follow_count_10','day_follow_count_11','day_follow_count_12','day_follow_count_13','day_follow_count_14','day_follow_count_15','day_follow_count_16','day_follow_count_17','day_follow_count_18','day_follow_count_19','day_follow_count_20','day_follow_count_21','day_follow_count_22','day_follow_count_23','day_follow_count_24','day_follow_count_25','day_follow_count_26','day_follow_count_27','day_follow_count_28','day_follow_count_29','day_follow_count_30','day_follow_count_31','day_gift_count_1','day_gift_count_2','day_gift_count_3','day_gift_count_4','day_gift_count_5','day_gift_count_6','day_gift_count_7','day_gift_count_8','day_gift_count_9','day_gift_count_10','day_gift_count_11','day_gift_count_12','day_gift_count_13','day_gift_count_14','day_gift_count_15','day_gift_count_16','day_gift_count_17','day_gift_count_18','day_gift_count_19','day_gift_count_20','day_gift_count_21','day_gift_count_22','day_gift_count_23','day_gift_count_24','day_gift_count_25','day_gift_count_26','day_gift_count_27','day_gift_count_28','day_gift_count_29','day_gift_count_30','day_gift_count_31'];
        var fieldNames = ['date','location','UserId','Loginname','Anchor Group','Admin Remark','Regist Time','gift revenue history','fans','Live Count','Live Times','Gift Value','UV','Follow Count','Gift Count','day_live_times_1','day_live_times_2','day_live_times_3','day_live_times_4','day_live_times_5','day_live_times_6','day_live_times_7','day_live_times_8','day_live_times_9','day_live_times_10','day_live_times_11','day_live_times_12','day_live_times_13','day_live_times_14','day_live_times_15','day_live_times_16','day_live_times_17','day_live_times_18','day_live_times_19','day_live_times_20','day_live_times_21','day_live_times_22','day_live_times_23','day_live_times_24','day_live_times_25','day_live_times_26','day_live_times_27','day_live_times_28','day_live_times_29','day_live_times_30','day_live_times_31','day_revence_1','day_revence_2','day_revence_3','day_revence_4','day_revence_5','day_revence_6','day_revence_7','day_revence_8','day_revence_9','day_revence_10','day_revence_11','day_revence_12','day_revence_13','day_revence_14','day_revence_15','day_revence_16','day_revence_17','day_revence_18','day_revence_19','day_revence_20','day_revence_21','day_revence_22','day_revence_23','day_revence_24','day_revence_25','day_revence_26','day_revence_27','day_revence_28','day_revence_29','day_revence_30','day_revence_31','day_UV_1','day_UV_2','day_UV_3','day_UV_4','day_UV_5','day_UV_6','day_UV_7','day_UV_8','day_UV_9','day_UV_10','day_UV_11','day_UV_12','day_UV_13','day_UV_14','day_UV_15','day_UV_16','day_UV_17','day_UV_18','day_UV_19','day_UV_20','day_UV_21','day_UV_22','day_UV_23','day_UV_24','day_UV_25','day_UV_26','day_UV_27','day_UV_28','day_UV_29','day_UV_30','day_UV_31','day_follow_count_1','day_follow_count_2','day_follow_count_3','day_follow_count_4','day_follow_count_5','day_follow_count_6','day_follow_count_7','day_follow_count_8','day_follow_count_9','day_follow_count_10','day_follow_count_11','day_follow_count_12','day_follow_count_13','day_follow_count_14','day_follow_count_15','day_follow_count_16','day_follow_count_17','day_follow_count_18','day_follow_count_19','day_follow_count_20','day_follow_count_21','day_follow_count_22','day_follow_count_23','day_follow_count_24','day_follow_count_25','day_follow_count_26','day_follow_count_27','day_follow_count_28','day_follow_count_29','day_follow_count_30','day_follow_count_31','day_gift_count_1','day_gift_count_2','day_gift_count_3','day_gift_count_4','day_gift_count_5','day_gift_count_6','day_gift_count_7','day_gift_count_8','day_gift_count_9','day_gift_count_10','day_gift_count_11','day_gift_count_12','day_gift_count_13','day_gift_count_14','day_gift_count_15','day_gift_count_16','day_gift_count_17','day_gift_count_18','day_gift_count_19','day_gift_count_20','day_gift_count_21','day_gift_count_22','day_gift_count_23','day_gift_count_24','day_gift_count_25','day_gift_count_26','day_gift_count_27','day_gift_count_28','day_gift_count_29','day_gift_count_30','day_gift_count_31' ]

        res.setHeader('Content-Disposition', 'attachment; filename="live_logs_month_report.csv"');
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