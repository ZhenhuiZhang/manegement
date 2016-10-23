'use strict'
var CONFIG  = require('../../../config');
var fs = require('../../controllers/mod/fs.js')

module.exports = {
    name: 'scan',
    description: '',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,           //是否校验签名  
    inputs: [],
    outputs:'',
    executor: function(inputs,res,next, cb, req){
        fs.scan()
        cb(null)
    }
}