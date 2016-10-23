'use strict'
/**
 * PushServer通讯。用于主播上线时发送PUSH消息给订阅者
 */
var logger  = require('../common/logger').logger('push');
var models  = require('../models');
var User = require('../models/index_readonly').User;
var PushLogs = require('../models/index_main').PushLogs;
var push_server_client = require('./libs-push-server/client');
var CONFIG  = require('../../config')
var Linq  = require('../libs/linq')
var tools = require('../common/tools');
var moment = require('moment');
var EventProxy = require('eventproxy');
var md5 = require('md5');

/**
 * user_id: 主播ID
 * 
 * 每天只更新一次
 */
exports.send = function(push,timezone) { 
    //  if(!CONFIG.enabled_push){return;}      //推送开关
    var ep = new EventProxy();
    var tz = timezone || 'Asia/Jakarta'
    logger.debug('push', push)
    var msg_obj = {
        title: 'Nonolive',
        // body: "${user.loginname} is on LIVE and waiting for you now! Don't miss it!",
        body: push.title,
        data: { url_scheme: 'room://?user_id=${user.user_id}' },
        icon: 'nn_notification_icon',
    }
    push.content=push.content.replace('http://', '').replace('room://', '')
    if(push.push_type=='anchor') msg_obj.data.url_scheme = 'room://?user_id='+ push.content;
    if(push.push_type=='page') msg_obj.data.url_scheme = 'http://'+push.content;

    var skip = 0,limit = 1000, count = 0
    //这里是发送逻辑入口  
    send_fun_use_db(skip, limit);


    function send_fun_use_db(skip_, limit_){
        logger.debug('send_fun_use_db');
        var where = {
            FCM_id:{$exists: true},
            create_at:{$gte: tools.getMoment(push.start_time).tz('Asia/Jakarta'),$lte:tools.getMoment(push.end_time).tz('Asia/Jakarta')}
        }
        logger.debug('time',tools.getMoment(push.registDay).tz('Asia/Jakarta').format(),tools.getMoment().tz('Asia/Jakarta').startOf('day').format())
        User.find(where, {_id:0, FCM_id:1}, {skip: skip_, limit:limit_}, function(err, rd){
                if(err || (!rd||!rd.length)){
                    logger.info('push over', count);
                    models.Push.findOneAndUpdate({_id:push._id}, {$set:{"ispush":1}}, {}, function(err,rd){
                        logger.debug("setPushStatus",push._id)
                    })
                    return;     //发送完毕
                   
                }
                count += rd.length

                var datas = {}
                datas.android = Enumerable.From(rd)
                                .Select(function (item) { 
                                    return {android:item.FCM_id.android}
                                })
                                .ToArray()
                datas.ios = Enumerable.From(rd)
                                .Select(function (item) { 
                                    return {ios:item.FCM_id.ios}
                                })
                                .ToArray()
                var platforms = ['android','ios']
                platforms.forEach(platform=>{
                    if(!datas[platform] || !datas[platform].length)return;
                    
                    var tokens_ = JSON.stringify(datas[platform])
                    tokens_ = tokens_.replace(/"FCM_id":/g,'')
                                .replace(/"android":/g,'')
                                .replace(/"ios":/g,'')                
                                .replace(/,\{\}/g,'')
                                .replace(/\{|\}|\[|\]/g,'')
                                .replace(/"/g,'')
                                .replace(/,,/g,',')
                    tokens_ = tokens_.split(',')
                    //过滤发送次数超过限制的用户
                    if(!tokens_.length){
                        logger.info('no tokens available', platform)
                        return;
                    }

                    logger.info(platform, 'tokens.length', tokens_.length)
                    logger.debug(platform, 'tokens', tokens_)
                    push_server_client.send(tokens_, msg_obj, platform, function (err, rd) {
                        if(err)return logger.error(err)
                        logger.debug('return multicastPush:', rd.success, rd.failure, rd.canonical_ids)

                        savePushLogs({
                            user_id: "000000",loginname: "system",
                            fans_num:tokens_.length,
                            create_at: new Date(),              data_source: 'db',
                            platform: platform,                 success: rd.success, failure: rd.failure,
                            canonical_ids: rd.canonical_ids,    results: rd.results,
                        })

                        // response 格式: 
                        // success: 0,          //成功数量
                        // failure: 199,        //失败数量
                        // canonical_ids: 0,    //需要更新token的数量
                        // results:[{ token: '123123',
                            // error: 'InvalidRegistration',
                            // registration_id: null }]         //每一个失败的token，原因，新token                         
                    })                        
                })
                skip_ = skip_ + limit_
                send_fun_use_db(skip_, limit_)
        })  
    }
}





function savePushLogs(obj){
    PushLogs.create(obj,function(err,rd){
        if(err)logger.error(err,rd)
    })    
}


// '[{"FCM_id":{"android":"abcabc"}},{"FCM_id":{"android":"abcabc"}},{"FCM_id":{"ios":"123123","android":"abcabc"}}]'