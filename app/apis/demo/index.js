'use strict'
var tools = require('../../common/tools');

module.exports = {
    name: 'demo', //名字和URL中名称大小写相对应
    description: '接口说明',
    fields: [],
    types: [],
    services:tools.requiresToArray(__dirname, null,'index.js')
}