
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var tools  = require('../../common/tools');
var Models = require('../../models')
var md5 = require('md5')
var mongoose = require('mongoose')

module.exports = {
    name: 'changePass',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,  
    inputs: ['old_pass','new_pass','confirm_pass','_id'],
    outputs:'{AdminModel}',
    executor: function(inputs,res,next, cb, req){
        Models.Admin.findOne({_id:inputs._id},function(err,rd){
            if(rd.pass && rd.pass == md5(md5(inputs.old_pass))){
                if(inputs.new_pass == inputs.confirm_pass){
                    var update = {
                        pass: md5(md5(inputs.new_pass))
                    }
                    Models.Admin.update({_id:rd._id}, {$set:update},{new:true,upsert:true},cb)
                }else{
                    cb(err,{message:'The passwords you typed do not match. Type the same password in both text boxes.'})                    
                }
            }else{
                cb(err,{message:'Old password is wrong.'})
            }
        })

        // Models.Admin.update({_id:inputs._id}, {$set:update},{new:true,upsert:true},cb)
  }
}