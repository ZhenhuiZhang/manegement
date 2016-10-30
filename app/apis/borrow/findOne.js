var CONFIG  = require('../../../config');
var models = require('../../models')
var Borrow    = models.Borrow;

module.exports = {
  name: 'findOne',
  description: '查询和返回一个图书',
  version: '1.0.0',
  checkSign: CONFIG.api_sign_enable,           //是否校验签名
  inputs: ['?_id'],
  outputs:'{BorrowModel}',
  executor: function(inputs, res, next, cb){
      if(!Object.keys(inputs).length)return cb(null,null)
      Borrow.findOne( inputs , function(err,data) {
        cb(err, data);
      });
  }
}
