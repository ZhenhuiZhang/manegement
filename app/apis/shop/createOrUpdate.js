
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
    inputs: ['{shop}'],
    outputs:'{TopicModel}',
    executor: function(inputs,res,next, cb, req){
        if(inputs.shop._id){
            inputs.shop.update_at = moment();
            var update = {}
            update.address=inputs.shop.address 
            update.phone=inputs.shop.phone
            update.pic=inputs.shop.pic
            update.title=inputs.shop.title
            Models.Topic.update({_id:inputs.shop._id},update,cb)
        }else{
            Models.Topic.findOne({title:inputs.shop.title},function(err,rd){
                if(rd) return cb(1,"该编号已被使用")
                Models.Topic.create(inputs.shop,cb)
            })
        }
  }
}