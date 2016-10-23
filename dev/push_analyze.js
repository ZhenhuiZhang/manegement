'use strict'

var logger  = require('../app/common/logger').logger('push','debug')
var CONFIG  = require('../config')
var tools = require('../app/common/tools')
var moment = require('moment')
var EventProxy = require('eventproxy')
var Modules = require('../app/models/')
var Modules_main = require('../app/models/index_main')
var fs = require("fs")
var md5 = require("md5")
var CONST  = require('../const')
var redis 	= require('../app/common/redis')

//android, 7月12号，1.1.1
//ios, 7月25号，1.2.0


// var anchor_id = 87303
var anchor_id = 326411
//按推荐逻辑取取粉丝集合

const MAX_PUSH_TIME = 8
var logfile =  "dev/logs/log_push_analyze_"+ anchor_id +'-' + (new Date()).valueOf() +".txt"
var skip = 0, limit = 1000, count = 0, count_all = 0, count_date = 0, count_unfollow = 0, count_nopush = 0
var st = new Date();  


fun(skip, limit)

function fun(skip_, limit_){
    Modules_main.Friends.find({status:0, follow_user_id: anchor_id, user_id:{$exists:true}}, {_id:0, user_id:1}, {skip: skip_, limit:limit_}, function(err, friends){
        if(err)logger.error(err)
        if(!friends.length){
            logger.info('analyze over：','all=',count_all,',FCMok=', count, ',diff=',count_all - count, '，date=', count_date , '，nopush＝', count_nopush)
            
            var duration = (new Date() - st)
            logger.info(logfile , duration + "ms")            
            return          //发送完毕
        }
        
        var ids = JSON.stringify(friends)
        ids = ids.replace(/"user_id":/g,'')
                .replace(/,\{\}/g,'')
                .replace(/\{|\}|\[|\]/g,'')
                .replace(/"/g,'')
        ids = ids.split(',')

        count_all += ids.length
        // logger.info('uids.length',  ids.length)


        Modules_main.User.find({user_id:{$in: ids}, FCM_id:{$exists: false} }, {_id:0, user_id:1,create_at:1}, function(err, rd){
            if(err)return logger.error(err)
            fs.open(logfile,"a",function(err,fd){
                var buf = new Buffer( JSON.stringify(rd) )
                fs.write(fd,buf,0,buf.length,0,function(err,written,buffer){});
            })
        })
        Modules_main.User.count({user_id:{$in: ids}, FCM_id:{$exists: true} }, function(err, rd){
            if(err)return logger.error(err)
            count += rd
            // logger.info(' FCMok count',  rd, count)
        })

        // Modules_main.User.count( {status:{$ne:0}, user_id:{$in: ids}, FCM_id:{$exists: true} }, function(err, rd){
        //     if(err)return logger.error(err)
        //     count_unfollow += rd
        //     logger.info(' unfollow count',  rd, count_unfollow)
        // })

        //FCM不存在，且注册时间是功能上线以前的
        Modules_main.User.count({user_id:{$in: ids}, FCM_id:{$exists: false}, create_at:{$lte: tools.getMoment('2016-07-26T00:00:00.000Z') } }, function(err, rd){
            if(err)return logger.error(err)
            count_date += rd
            // logger.info('count_date',  rd, count_date)
        })

        //查询主播粉丝条数达到限制的人数
        Modules_main.User.find({user_id:{$in: ids}, FCM_id:{$exists: true} }, {_id:0, FCM_id:1}, function(err, rd){
            if(err)return logger.error(err)
            
            logger.debug('nopush temp', rd.length)
            rd.forEach(user_=>{
                var FCM_id = user_.FCM_id.ios || user_.FCM_id.android
                var platform = user_.FCM_id.ios ? 'ios' : 'android'

                let CACHE_KEY = CONST.CACHE_NAME_PUSH_UCOUNT + md5(FCM_id)      //将key变短
                redis.get(CACHE_KEY, function (err, result) {
                    if(!result || Number(result) < MAX_PUSH_TIME){
                        //可以发送的
                        // logger.debug('push_num', result)
                    }else{
                        //超过限制的
                        count_nopush++
                        logger.debug('push_num', result)
                        // logger.debug('count_nopush=',count_nopush)
                    }
                })
            })
        })

        skip = skip + limit
        fun(skip, limit)
    })
}


//统计FCM异常（字段不存在、空值等）的用户数据（总数、导出）


//对比推送数据






