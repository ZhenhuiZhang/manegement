var CONFIG  = require('../../../config');
var models  = require('../../models/index_main');
var ConfigVersion    = models.ConfigVersion;
var logger = require('../../common/logger').logger('config');

module.exports = {
  name: 'remove',
  description: 'remove a config',
  version: '1.0.0',
  checkSign: CONFIG.api_sign_enable,
  inputs: ['_id'],
  outputs:'',
  executor: function(inputs, res, next, cb){
      ConfigVersion.remove({_id:inputs._id}, cb);
  }
}