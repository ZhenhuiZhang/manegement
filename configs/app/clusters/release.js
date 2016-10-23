/**
 * 注意!!!!
 * 需要发布到线上的配置，不要在这个文件中手工修改。
 * 此文件将被集群配置自动覆盖。
 */
module.exports = {
    debug : false,
    api_server : 'http://api.livenono.com:2080',
    db : 'mongodb://172.31.10.38:27018/FEWeb?readPreference=nearest',
    db_readonly : 'mongodb://172.31.10.38:27018/FEWeb?readPreference=secondaryPreferred',
    db_report : 'mongodb://172.31.10.38:27018/CMS_Report',
    db_cms : 'mongodb://172.31.10.38:27018/CMS',

    redis_host : '172.31.10.38',

    anchor_middle_object_cron : '0 */5 * * * *',     //每5分钟执行
    punish_unlock : '0 */30 * * * *',                //每30分钟执行
    push_server : '172.31.0.226',
    push_server_port : 3500,
}