var mongoose = require('mongoose');
var config   = require('../../config');
var logger = require('../common/logger').logger('models');

logger.info('connect db_cms db', config.db_cms);
mongoose.connect(config.db_cms, {
  server: {poolSize: 20}
}, function (err) {
  if (err) {
    logger.error('connect to %s error: ', config.db_cms, err.message);
    process.exit(1);
  }
});

//注意，修改以下model定义，必要时，需同时修改index.js、index_main.js、index_readonly.js四个文件

// models
require('./admin')
require('./operate_log')
require('./permission_modules')
require('./permission_role')
require('./push')

exports.Admin = mongoose.model('Admin')
exports.OperateLog = mongoose.model('operate_log')
exports.PermissionModules = mongoose.model('permission_modules')
exports.PermissionRole = mongoose.model('permission_role')
exports.Push = mongoose.model('Push')