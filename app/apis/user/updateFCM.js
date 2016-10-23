'use strict'
var CONFIG = require('../../../config');
var User = require('../../models/index_main').User;
var PushLogs = require('../../models/index_main').PushLogs;
var Models = require('../../models')
var logger = require('../../common/logger').logger('');
var lodash = require('lodash');

module.exports = {
    name: 'updateFCM',
    description: '清除FCM_id，用于用户登出时解绑关系',
    checkSign: CONFIG.api_sign_enable,
    inputs: ['date_start'],
    version: '1.0.0',
    outputs: "",
    executor: function (inputs, res, next, cb, req) {
        var where = {}
        if (inputs.date_start) {
            where.create_at = where.create_at || {};
            where.create_at["$gte"] = new Date(inputs.date_start);
        }

        cb(null)

        handleEach(handleEach,where,req)
    }
}

var length = 0

function handleEach(cb,where,req){
    PushLogs.findOne(where,{},{sort: {_id: -1},limit:1},function(err,rd){
        if(rd.results != null){
            rd.results.forEach(function(ele,index){
                if(ele.error == "NotRegistered"){
                    User.update({ ["FCM_id." + rd.platform]: ele.token },{ $unset: { ["FCM_id." + rd.platform]: 1 } }, function (err, res) {
                        if (err) {
                            logger.error("update user", err);
                            return false;
                        }
                        if (res.nModified == 1) {
                            logger.debug('clearFcmSuccess', rd.platform, ele.token)
                            //将实际操作记录写进操作日志中
                            var operation = {
                                user: JSON.parse(req.cookies.admin).adminname,
                                operation: "clearFCM",
                                origin_content: "platform:" + rd.platform + ",FCM:'" + ele.token + "',error:" + ele.error,
                                submit_content: "",
                            }
                            Models.OperateLog.create(operation, function (err, rd) { })
                            length += 1
                        }
                    })
                }

                if(rd.results.length == index+1){
                    var where_next = where
                    where_next._id = {"$lt": rd._id}
                    cb(cb,where_next,req)
                }
            })
        }else{
            var where_next = where
            where_next._id = {"$lt": rd._id}
            cb(cb,where_next,req)
        }

        if(!rd){
            var total = {
                user: JSON.parse(req.cookies.admin).adminname,
                operation: "clearFCM_Sum",
                origin_content: "Total:" + length + ",From(Date):" + JSON.stringify(where.create_at.$gte),
            }
            Models.OperateLog.create(total, cb);
            logger.info("clearFcm finish!Total effect row:" + length);
        }
    })
}