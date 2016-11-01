
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
            Models.Borrow.update({_id:inputs.borrow._id},inputs.borrow,function(err,result){
                Models.Book.findOne({number:inputs.borrow.book},function(err,rd){
                    Models.Book.update({_id:rd._id},{bollow_num:rd.bollow_num-1,last_num:rd.last_num+1},cb)
                })
            })
        }else{
            inputs.borrow.return_at = moment().add("days",30)
                Models.Book.findOne({number:inputs.borrow.book},function(err,rd){
                    if(rd.bollow_num == rd.book_num) return cb(1,"该编号的书已经被借完了")
                    Models.Borrow.create(inputs.borrow,function(err,result){
                        Models.Book.update({_id:rd._id},{bollow_num:rd.bollow_num+1,last_num:rd.last_num-1},cb)
                    })
            })
        }
  }
}