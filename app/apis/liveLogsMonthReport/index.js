var tools = require('../../common/tools');

var category = {
    name: 'liveLogsMonthReport', //名字和URL中名称大小写相对应
    description: 'live logs Month report services',
    fields: [],     //用于指定接口字段
    types: [],      //用于指定接口字段数据类型
    services:tools.requiresToArray(__dirname, null, 'index.js')
}
module.exports = category;