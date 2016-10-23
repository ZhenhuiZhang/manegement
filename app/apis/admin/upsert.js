
'use strict'
var CONFIG  = require('../../../config');
var apiclient  = require('../../common/api_client');
var tools  = require('../../common/tools');
var Models = require('../../models')
var md5 = require('md5')
var mongoose = require('mongoose')

module.exports = {
    name: 'upsert',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,  
    inputs: ['{AdminModel}'],
    outputs:'{AdminModel}',
    executor: function(inputs,res,next, cb, req){
        if(!Object.keys(inputs).length)return cb(null,null)
        if(!inputs._id) inputs._id = new mongoose.mongo.ObjectID()
        var update = inputs

        console.log(update)
        
        if(update.pass) update.pass = md5(md5(update.pass))
        update.update_at = tools.getMoment.utc().format()
        
        Models.Admin.update({_id:inputs._id}, {$set:update},{new:true,upsert:true},cb)
  }
}