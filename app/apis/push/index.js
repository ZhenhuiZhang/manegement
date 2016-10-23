'use strict'
var tools = require('../../common/tools');

module.exports = {
    name: 'push', 
    description: '',
    fields: [],
    types: [],
    services:tools.requiresToArray(__dirname, null,'index.js')
}