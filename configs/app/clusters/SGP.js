/**
 * SGP cluster release config
 * 
 * 这里的配置将覆盖config.js中的同名配置项
 */
module.exports = {
    debug : false,
    api_server : 'http://api.livenono.com:2080',
    db : 'mongodb://172.31.8.21:27018/FEWeb?readPreference=nearest',
    db_readonly : 'mongodb://172.31.8.21:27018/FEWeb?readPreference=secondaryPreferred',
    db_report : 'mongodb://172.31.8.21:27018/CMS_Report',
    db_cms : 'mongodb://172.31.8.21:27018/CMS',

    redis_host : '172.31.10.38',

    anchor_middle_object_cron : '0 */5 * * * *',     //每5分钟执行
    punish_unlock : '0 */30 * * * *',                //每30分钟执行
    push_server : 'http://172.31.7.51',
    push_server_port : 3600,
    push_server_api : '/ps/trigger_push'
}