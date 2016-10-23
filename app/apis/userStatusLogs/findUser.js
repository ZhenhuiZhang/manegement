'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var Models = require('../../models')
var Models_main = require('../../models/index_main')


module.exports = {
    name: 'findUser',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: ['*_id'],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        Models_main.User.find({_id:inputs._id},function(err,rd) {
             Models_main.User_Status_Logs.find({user_id:rd[0].user_id},{},{sort:{_id:-1}},function(err,logs) {
                var result = {
                        models : logs ,
                        totalRows: logs.length
                    }
                    cb(null, result);
            })
        })
  }
}