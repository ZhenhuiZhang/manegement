
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
    inputs: ['{user}'],
    outputs:'{UserModel}',
    executor: function(inputs,res,next, cb, req){
        if(inputs.user._id){
            inputs.user.update_at = moment();
            Models.User.update({_id:inputs.user._id},inputs.user,cb)
        }else{
            Models.User.create(inputs.user,cb)
        }
  }
}