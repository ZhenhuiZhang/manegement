'use strict'
var tools = require('../../common/tools');

module.exports = {
    name: 'user', 
    description: '',
    fields: [],
    types: [],
    services:tools.requiresToArray(__dirname, null,'index.js')
}