var log4js = require('log4js');
var config = require('../../config');

//log4js的输出级别6个: trace, debug, info, warn, error, fatal

log4js.configure(config.log4js.config);

var dateFileLog = log4js.getLogger('default');

exports.use = function(app) {
    //页面请求日志,用auto的话,默认级别是WARN
    app.use(log4js.connectLogger(dateFileLog, config.log4js.connectLogger ) );
}

exports.logger=function(name,level){
    name = name || 'default';
    level = level || config.log4js.connectLogger.level;
    var logger = log4js.getLogger(name);
//    logger.setLevel( log4js.levels[ level.toUpperCase() ] );
    logger.setLevel( level );
    return logger;
}