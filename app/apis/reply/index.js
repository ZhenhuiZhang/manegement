'use strict'
var tools = require('../../common/tools');

module.exports = {
    name: 'reply', //名字和URL中名称大小写相对应
    description: '',
    fields: [],
    types: [],
    services:tools.requiresToArray(__dirname, null,'index.js')
}