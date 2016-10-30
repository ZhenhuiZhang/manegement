var CONFIG  = require('../../../config');
var models = require('../../models')
var Book    = models.Book;

var findOne = {
  name: 'findOne',
  description: '查询和返回一个图书',
  version: '1.0.0',
  checkSign: CONFIG.api_sign_enable,           //是否校验签名
  inputs: ['?_id','?number'],
  outputs:'{BookModel}',
  executor: function(inputs, res, next, cb){
      Book.findOne( inputs , function(err,data) {
        cb(err, data);
      });
  }
}
module.exports = findOne;