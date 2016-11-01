'use strict'

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

var config = {
    debug:true,
    port: 5199,                      //web端口
    
    session_secret: 'nonolive_secret',
    api_sign_enable : false,  //CMS自有的API，是否启用签名
    db: 'mongodb://127.0.0.1:27017/BOOKWeb',                          //业务主库
    default_timezone : 'Asia/Jakarta',


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
            level: 'trace',      //用auto的话,默认级别是WARN,log4js的输出级别6个: trace, debug, info, warn, error, fatal
            format:':method :url'
        }
    },
}

module.exports = config;
