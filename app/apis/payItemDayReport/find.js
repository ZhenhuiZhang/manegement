
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
    inputs: ['*type',
            '*dimension',
            '*gold','*status','*user_id','*platform','*date_start', '*date_end','*currency',
            '*limit','*page'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var option = []
        
        var where = {}
        var group = {
            _id:{
                date:{$dateToString: { format: "%Y-%m-%d", date: "$date"}},
                currency:'$currency'
            },
            sum_count: {$sum: "$sum_count"},
            sum_account: { $sum: "$sum_account" }, 
            gold: {$sum: '$gold'}
        }

        if(inputs.status) {
            where.status = Number(inputs.status)
            group._id.status = '$status'
        }
        if(inputs.user_id) {
            where.user_id = Number(inputs.user_id)
            group._id.user_id = '$user_id'
            group.loginname = {$first:"$loginname"}
        }
        if(inputs.platform) {
            where.platform = inputs.platform
            group._id.platform = '$platform'
        }
        if(inputs.currency) {
            where.currency = inputs.currency
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
            if(dimension.indexOf('status') != -1){
                group._id.status = '$status'
            }
            if(dimension.indexOf('user_id') != -1){ 
                group._id.user_id = '$user_id'
                group.loginname = {$first:"$loginname"}
            }
            if(dimension.indexOf('platform') != -1){ 
                group._id.platform = '$platform'
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

        cms_report_db.PayItemDayReport.aggregate(option).allowDiskUse(true).exec(function(err,rd){
                if(err) cb(null,err)
                console.log(err,rd)
                rd.forEach(function(element) {
                    // element.gold = element._id.gold
                    element.platform = element._id.platform
                    element.currency = element._id.currency
                    element.status = element._id.status
                    element.user_id = element._id.user_id
                    element.date = new Date(element._id.date)

                    delete element._id
                }, this);

                if(inputs.type == 'export'){
                    var fields = ['date','gold','currency','sum_account','user_id','loginname','platform','status' ]
                    var fieldNames = ['date','gold','currency','Price','UserId','Loginname','platform','status' ]
                    var csv = json2csv({ data: rd, fields: fields,fieldNames: fieldNames });

                    var stream = resumer().queue(csv);
                    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
                    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                    res.send(csv);
                }else{
                    cms_report_db.PayItemDayReport.count({}, function(err,count){
                        if(err) cb(null,err)

                        var result = {
                            models : rd ,
                            totalRows: count
                        }
                        cb(null, result);
                    })
                }
            })
  }
}