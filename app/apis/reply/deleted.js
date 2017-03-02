
'use strict'
var CONFIG  = require('../../../config');
var tools  = require('../../common/tools');
var Models = require('../../models')
var moment = require('moment')

module.exports = {
    name: 'deleted',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,  
    inputs: ['_id'],
    outputs:'{ReplyModel}',
    executor: function(inputs,res,next, cb, req){
        Models.Reply.update({_id:inputs._id},{$set:{deleted:true}},cb)
  }
}