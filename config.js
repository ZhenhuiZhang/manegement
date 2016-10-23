'use strict'
var release_config = require('./configs/app/clusters/release')

/**
 * 获取命令行参数，并判断命令行中是否包含指定的参数
 * @param key
 * @returns {boolean}
 */
var commandLineContain = function(key){
    var command = process.argv.slice(2);
//    console.log(command);
    if(!command.length){
        return false;
    }
    if(command.indexOf('--'+key) != -1 || command.indexOf('-'+key.substring(0,1)) != -1 ){
        return true;
    }else{
        return false;
    }
}
/**
 * 根据命令行参数，获取json指定属性
 * @param json
 * @returns {string}
 */
var switchTypeByCommadLine = function(json){
    var result='';
    if(commandLineContain('release')){
        result=json['release'];
    }else if(commandLineContain('debug')){
        result=json['debug'];
    }else if(commandLineContain('test')){
        result=json['test'];
    }else{
        result=json['DEFAULT'];
    }
    return result;
}

/**
 * 各运行环境下的数据库名
 */
var DB_CONFIG = {
    'release':'FEWeb',               //生产环境库
    'debug':'FEWeb',          //开发环境库.TODO: 需要新建一个SalmonBFE专用的库
    'test':'FEWeb',                  //测试环境库
    'DEFAULT':'FEWeb'
};
/**
 * 各运行环境下的端口
 */
var PORT_CONFIG = {
    'release':5199,                      //生产环境
    'debug':5199,                        //开发环境
    'test':5199,                         //测试环境
    'DEFAULT':5199
};
/**
 * 各运行环境下的socket端口
 */
var SOCKET_PORT_CONFIG = {
    'release':8094,                      //生产环境
    'debug':8094,                        //开发环境
    'test':18084,                        //测试环境
    'DEFAULT':18084
};
/**
 * 各运行环境下的日志打印级别
 */
var LOG_CONFIG = {
    'release':'warn',                   //生产环境
    'debug':'trace',                    //开发环境
    'test':'trace',                      //测试环境
    'DEFAULT':'trace'                   //测试环境
};

var config = {
    debug:true,
    port: switchTypeByCommadLine(PORT_CONFIG),                      //web端口
    // socket_port: switchTypeByCommadLine(SOCKET_PORT_CONFIG),        //socket端口
    
    session_secret: 'nonolive_secret',
    api_sign_enable : false,  //CMS自有的API，是否启用签名
    
    db: 'mongodb://127.0.0.1:27017/BOOKWeb',                          //业务主库
    
    api_server:'http://127.0.0.1:5401/',
    default_timezone : 'Asia/Jakarta',

    // redis 配置，默认是本地
    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_db: 0,

    log4js:{                        //日志模块设置
        config:{
            appenders: [
                {
                    type: 'console'
                },
                {
                    type: 'dateFile',                   //file，dateFile
                    filename: 'logs/log',
                    pattern: "_yyyy-MM-dd.log",         //日期后缀格式
                    maxLogSize: 2048000,                //2M分隔
                    backups:4,
                    alwaysIncludePattern: true
                }
            ],
            replaceConsole: true
        },
        connectLogger:{                                     //建议:开发时用trace或debug，部署时用warn
            level: switchTypeByCommadLine(LOG_CONFIG),      //用auto的话,默认级别是WARN,log4js的输出级别6个: trace, debug, info, warn, error, fatal
            format:':method :url'
        }
    },
}

module.exports = config;
