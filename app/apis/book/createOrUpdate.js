
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
    inputs: ['{book}'],
    outputs:'{BookModel}',
    executor: function(inputs,res,next, cb, req){
        if(inputs.book._id){
            inputs.book.update_at = moment();
            Models.Book.update({_id:inputs.book._id},inputs.book,cb)
        }else{
            inputs.book.bollow_num = 0;
            inputs.book.last_num = inputs.book.book_num;
            Models.Book.create(inputs.book,cb)
        }
  }
}