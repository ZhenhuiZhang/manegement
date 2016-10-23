var tools = require('../../common/tools');

var category = {
    name: 'payItemMonthReport', //名字和URL中名称大小写相对应
    description: 'pay item month report services',
    fields: [],     //用于指定接口字段
    types: [],      //用于指定接口字段数据类型
    services:tools.requiresToArray(__dirname, null, 'index.js')
}
module.exports = category;