/**
 * 把读取user表正在禁播的用户把user_status_log里对应的记录is_effect改为1  
 */
'use strict'
var logger  = require('../app/common/logger').logger('update_user_status_logs');
var models  = require('../app/models/index_main');
var User    = models.User;
var UserStatusLogs    = models.User_Status_Logs;
var cmsModels = require('../app/models/')
var tools = require('../app/common/tools');
var moment = require('moment');

var updateCount = 0;
var where = {"anchor_status_obj.deadline":{ $exists: true }} 
logger.info('update_user_status_logs start');
var lasttime = moment.utc().valueOf();
initStatus()

//初始化is_effect=0
function initStatus(){
    UserStatusLogs.update({},{ $set: { is_effect: 0 } },{multi: true}, function(err, rd){
        if(err) logger.error('init error!',err)
        if(!rd.length){
            logger.info("init finish!Total init row:" + rd.n);
        }
        update_user_status_logs(update_user_status_logs,where)
    })
}

//更新在有效惩罚的用户记录
function update_user_status_logs(cb,where){
    User.findOne(where ,{},{sort: {_id: -1}}, function(err, punishUser){
        if(err) return logger.error('update UserStatusLogs error:', err);
        if(!punishUser){
            logger.info('update UserStatusLogs over,update rows:', updateCount);
            //将实际操作记录写进操作日志中
            var operation = {
                user: "System task",
                operation: "UserStatusLogs,set is_effect=1",
                origin_content: "update rows:" + updateCount,
                submit_content: "",
            }
            cmsModels.OperateLog.create(operation, function (err, rd) {process.exit()})
            return false         //发送完毕
        }
        if(!(punishUser.anchor_status_obj.deadline)){
             var where_next = where
            where_next._id = {$lt: punishUser._id};
            return cb(cb,where_next)
        }


        var update ={ 
            is_effect: 1 ,
            deadline:tools.getMoment(punishUser.anchor_status_obj.deadline).utc(),
            remark:punishUser.anchor_status_obj.remark,
            status : punishUser.anchor_status
        }
        UserStatusLogs.findOneAndUpdate({user_id:punishUser.user_id},update, {sort: {create_at: -1},upsert:true }, function(err,rd){
            logger.debug('update UserStatusLogs,user_id:', punishUser.user_id)
            if (err) {
                logger.error("update UserStatusLogs", err);
                return false;
            }
            //每一千条打印一下日志
            if(updateCount%1000==0){
                var curtime = moment.utc().valueOf();
                var costtime = curtime - lasttime;
                logger.info('already modify row:'+updateCount+",costtime:"+costtime+"ms");
            }
            updateCount += 1
        })


        var where_next = where
        where_next._id = {$lt: punishUser._id};
        cb(cb,where_next)
    })
}