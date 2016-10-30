
'use strict'
var CONFIG  = require('../../../config');
var tools  = require('../../common/tools');
var Models = require('../../models')
var moment = require('moment')

module.exports = {
    name: 'createOrUpdate',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,  
    inputs: ['{borrow}'],
    outputs:'{BorrowModel}',
    executor: function(inputs,res,next, cb, req){
        if(inputs.borrow._id){
            inputs.borrow.update_at = moment();
            Models.Borrow.update({_id:inputs.borrow._id},inputs.borrow,cb)
        }else{
            inputs.borrow.return_at = moment().add("days",30)
            Models.Borrow.create(inputs.borrow,cb)
        }
  }
}