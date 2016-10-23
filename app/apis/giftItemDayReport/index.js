var tools = require('../../common/tools');

var category = {
    name: 'giftItemDayReport', //名字和URL中名称大小写相对应
    description: 'gift item day report services',
    fields: [],     //用于指定接口字段
    types: [],      //用于指定接口字段数据类型
    services:tools.requiresToArray(__dirname, null, 'index.js')
}
module.exports = category;