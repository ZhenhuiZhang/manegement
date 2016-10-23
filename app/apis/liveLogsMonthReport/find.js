
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var cms_report_db = require('../../models/index_report')
var json2csv = require('json2csv');
var fs = require('fs')
var resumer = require('resumer')

module.exports = {
    name: 'find',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*dimension',
            '*user_id','*platform','*host_manager','*anchor_group','*location','*date_start', '*date_end',
            '*limit','*page'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var option = []
        
        var where = {}

        if(inputs.type == 'export'){
            var group = {
                _id:{date:{$dateToString: { format: "%Y-%m", date: "$date"}}},
                sum_count: {$sum: "$sum_count"},
                sum_live_times: { $sum: "$sum_live_times" },
                sum_revence: { $sum: "$sum_revence" },
                sum_UV: { $sum: "$sum_UV" },
                sum_DAU: { $sum: "$sum_DAU" },
                sum_follow_count: { $sum: "$sum_follow_count" },
                sum_gift_count: { $sum: "$sum_gift_count" },
                admin_remark: {$first:"$admin_remark"},
                regist_time: {$first:"$regist_time"}
            }
        }else{
            var group = {
                _id:{date:{$dateToString: { format: "%Y-%m", date: "$date"}}},
                sum_count: {$sum: "$sum_count"},
                sum_live_times: { $sum: "$sum_live_times" },
                sum_revence: { $sum: "$sum_revence" },
                sum_UV: { $sum: "$sum_UV" },
                sum_DAU: { $sum: "$sum_DAU" },
                sum_follow_count: { $sum: "$sum_follow_count" },
                sum_gift_count: { $sum: "$sum_gift_count" }
            }
        }

        if(inputs.user_id) {
            where.user_id = Number(inputs.user_id)
            group._id.user_id = "$user_id"
            group.loginname = {$first:"$loginname"}
            group.regist_time = {$first:"$regist_time"} 
            group.admin_remark = {$first:"$admin_remark"}
        }
        //取消platform维度 @jinrong 20160808
        // if(inputs.platform) {
        //     where.platform = inputs.platform
        //     group._id.platform = '$platform'
        // }
        if(inputs.anchor_group) {
            where.anchor_group = {$regex: inputs.anchor_group}
            group._id.anchor_group = '$anchor_group'
        }
        if(inputs.location) {
            where.location = inputs.location
            group._id.location = '$location'
        }
        //日期格式yyyy-MM-dd hh:mm:ss 或其他js日期格式
        if (inputs.date_start) {
            where.date = where.date || {};
            where.date["$gte"] = new Date(inputs.date_start);
        }
        if (inputs.date_end) {
            where.date = where.date || {};
            where.date["$lt"] = new Date(inputs.date_end);
        }

        if(inputs.dimension){
            var dimension = inputs.dimension.split(',')
            if(dimension.indexOf('user_id') != -1){ 
                group._id.user_id = "$user_id"
                group.loginname = {$first:"$loginname"}
                group.regist_time = {$first:"$regist_time"} 
                group.admin_remark = {$first:"$admin_remark"}
            }

            //取消platform维度 @jinrong 20160808
            // if(dimension.indexOf('platform') != -1){
            //     group._id.platform = '$platform'
            // }
            if(dimension.indexOf('anchor_group') != -1){ 
                group._id.anchor_group = '$anchor_group'
            }
            if(dimension.indexOf('location') != -1){ 
                group._id.location = '$location'
            }
        }

        option.push({
            $match : where
        })
        option.push({
            $group : group
        })
        option.push({
            $sort:{'_id.date': -1}
        })
        if(inputs.limit){
            option.push({
                $skip: (inputs.page-1) * Number(inputs.limit)
            })
            option.push({
                $limit: Number(inputs.limit)
            })
        }

        cms_report_db.LiveLogsMonthReport.aggregate(option).allowDiskUse(true).exec(function(err,rd){
            if(err) cb(null,err)

            // console.log(err,rd)
            rd.forEach(function(element) {
                element.user_id = element._id.user_id
                element.platform = element._id.platform
                element.anchor_group = element._id.anchor_group
                element.date = new Date(element._id.date)
                element.location = element._id.location

                delete element._id
            }, this);
            
            cms_report_db.LiveLogsMonthReport.count({}, function(err,count){
                if(err) cb(null,err)

                var result = {
                    models : rd ,
                    totalRows: count
                }
                cb(null, result);
            })
        })
  }
}