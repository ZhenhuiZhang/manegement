var mongoose = require('mongoose');
var config   = require('../../config');
var logger = require('../common/logger').logger('models');
var md5 = require('md5')

logger.info('connect db_cms db', config.db);
mongoose.connect(config.db, {
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
require('./book')
require('./user')
require('./borrow_logs')

mongoose.model('Admin').findOneAndUpdate({
      adminname: "jack",
      pass: md5(md5("123123")),
      group : "super"
    },function(err,rd){
      console.log(err)
      console.log(rd)
})


exports.Admin = mongoose.model('Admin')
exports.Book = mongoose.model('Book')
exports.User = mongoose.model('User')
exports.Borrow = mongoose.model('Borrow')
