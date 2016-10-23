
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
            '*sender','*sender_user_id','*receive','*receive_user_id','*gift_id','*date_start', '*date_end',
            '*limit','*page'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        var option = []

        var where = {}
        var group = {
            _id:{date:{$dateToString: { format: "%Y-%m", date: "$date"}}},
            sum_count: {$sum: '$sum_count'},
            sum_account: { $sum: "$sum_account" }   
        }

        if(inputs.sender) where.sender = inputs.sender
        if(inputs.receive) where.receive = inputs.receive
        if(inputs.sender_user_id){ 
            where.sender_user_id = Number(inputs.sender_user_id)
            group._id.sender_user_id = "$sender_user_id"
            group.sender = {$first:"$sender"}
        }
        if(inputs.receive_user_id) {
            where.receive_user_id = Number(inputs.receive_user_id)
            group._id.receive_user_id = '$receive_user_id'
            group.receive = {$first:"$receive"}
        }
        if(inputs.gift_id) {
            where.gift_id = Number(inputs.gift_id)
            group._id.gift_id = '$gift_id'
            group.gift_name = {$first:"$gift_name"}
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
            if(dimension.indexOf('sender_user_id') != -1){ 
                group._id.sender_user_id = "$sender_user_id"
                group.sender = {$first:"$sender"}
            }
            if(dimension.indexOf('receive_user_id') != -1){
                group._id.receive_user_id = '$receive_user_id'
                group.receive = {$first:"$receive"}
            }
            if(dimension.indexOf('gift_id') != -1){ 
                group._id.gift_id = '$gift_id'
                group.gift_name = {$first:"$gift_name"}
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

        cms_report_db.GiftItemMonthReport.aggregate(option).allowDiskUse(true).exec(function(err,rd){
                if(err) cb(null,err)

                rd.forEach(function(element) {
                    element.gift_id = element._id.gift_id
                    element.receive_user_id = element._id.receive_user_id
                    element.sender_user_id = element._id.sender_user_id
                    element.date = new Date(element._id.date)

                    delete element._id
                }, this);
                
                if(inputs.type == 'export'){
                    var fields = ['date','sum_account','sum_count','sender_user_id','sender','receive_user_id','receive','gift_id','gift_name' ]
                    var fieldNames = ['date','Coins','Gift Count','sender UserId','Sender','Receive UserId','Receive','GiftId','Gift Name' ]
                    var csv = json2csv({ data: rd, fields: fields,fieldNames: fieldNames });

                    var stream = resumer().queue(csv);
                    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
                    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                    res.send(csv);
                }else{
                    cms_report_db.GiftItemMonthReport.count({}, function(err,count){
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