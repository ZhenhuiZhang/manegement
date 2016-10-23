'use strict'
var request =require('request');
var CONFIG = require('../../../config');
var db_main = require('../../models/index_main');
var Models = require('../../models');
var LiveAnchor = db_main.LiveAnchor;
var User = db_main.User;
var EventProxy   = require('eventproxy');
var logger = require('../../common/logger').logger('push');
var moment = require('moment')

module.exports = function(_id,contents,location){
    var ep = new EventProxy();
        ep.fail();
    var where = {
        $or:[]
    };
    location.forEach(item=>{
        where.$or.push({
            location:item,
        })
    })

    ep.once("checkTime",function(checkTime){
        ep.after('contentsUpdate',contents.length,function(list){
            var update = {
                contents:contents,
                'push_attr.cur_oper_time':checkTime.push_attr.cur_oper_time+1
            }
            Models.Push.update({_id:_id}, update,function (err, rd) {
                    if (err) {
                        logger.error('UPDATE PUSH ERROR:', err ,rd)
                        return false;
                    }
                    logger.info(CONFIG.push_server+":"+CONFIG.push_server_port+CONFIG.push_server_api+'?nono_push_id='+_id)
                    request(CONFIG.push_server+":"+CONFIG.push_server_port+CONFIG.push_server_api+'?nono_push_id='+_id, function (error, response, body) {
                        if (error|| (response && response.statusCode !=200) ) logger.error('call triger push service fail.',error, response,body)
                        else logger.info('call triger push service reusle.', response,body)
                    })
                    return true;
                })
            
        });
        contents.forEach((item,index)=>{
            //如果该条不是推送主播，则不用改，否则则看该推送主播是否在直播状态，如果不是则在LiveAnchor表中查找viewers排高的来代替
            if(item.content_type != "anchor") return ep.emit("contentsUpdate","");
            User.findOne({user_id : item.content},function(err , rd){
                if(!rd.anchor_live||rd.anchor_live != 11){
                    LiveAnchor.findOne(where,{},{sort: {viewers: -1},limit:1},function(err,result){
                        if(err||!result) return  ep.emit("contentsUpdate","")
                        contents[index].content = result.user_id;
                        logger.info('push contents update.', contents)
                        where.viewers= {"$lt": result.viewers};
                        ep.emit("contentsUpdate","")
                    })
                }else{
                    ep.emit("contentsUpdate","")
                }
            })
        })
    })

    Models.Push.findOne({_id:_id},function(err,result){
        if(!result||err)return logger.error("find Push item error/not exist",err,result);
        if(result.is_push_now == 0){
            var now = moment()
            var shcedule_push_time = moment(result.shcedule_push_time)
            //如果时间在3分钟内的话就推送，否则是已经修改过推送时间，就不推送了
            if(Math.abs(now.valueOf()-shcedule_push_time.valueOf())>1000*60*3){
                logger.error("schedule Push time not match,current time",now.format(),"pushItem schedule push time",shcedule_push_time.format());
                return false
            }
        }
        if(result.push_attr.oper_times==result.push_attr.cur_oper_time){
            logger.error("Push item's push times can not over oper_times",result.push_attr.oper_times,result.push_attr.cur_oper_time)
            return false
        }
        ep.emit("checkTime",result)
    })
}