var CONFIG  = require('../../../config');
var models = require('../../models')
var User    = models.User;

module.exports = {
  name: 'findOne',
  description: '查询和返回一个用户',
  version: '1.0.0',
  checkSign: CONFIG.api_sign_enable,           //是否校验签名
  inputs: ['?_id','?user_id'],
  outputs:'{UserModel}',
  executor: function(inputs, res, next, cb){
      User.findOne( inputs , function(err,data) {
        cb(err, data);
      });
  }
}
