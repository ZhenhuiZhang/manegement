var schedule = require('node-schedule');
var logger = require('../common/logger').logger('anchor_unlock');
var index_main = require('../models/index_main');
var models = require('../models');
var moment = require('moment');
var config = require('../../config');
var User = index_main.User;
var OperateLog = models.OperateLog;
var UserStatusLogs = index_main.User_Status_Logs;
var EventProxy = require('eventproxy');

module.exports = function () {
    // var rule = new schedule.RecurrenceRule();
    // rule.hour = 5;
    // rule.minute = 0;
    // rule.second = 0;  //每天5点运行 解除禁播时间到期的主播禁播状态

    var j = schedule.scheduleJob(config.punish_unlock, function () {
        punishUnlock();
    })
}

function punishUnlock() {
    var ep = new EventProxy();
    ep.fail();
    logger.info('punishUnlock start');
    //"is_effect": 1还没取消的记录
    var where = {
        "deadline": {
            $lte: moment.utc().format(),
        },
        "is_effect": 1
    }
    //更新的状态
    var update = {
        $unset: {
            anchor_status: 1,
            anchor_status_obj: 1,
        }
    }
    var lasttime = moment.utc().valueOf();
    logger.debug('punishUnlock where:',where);
    UserStatusLogs.find(where, function (err, rd) {
        //更新用户状态
        rd.forEach(function (e) {
            User.update({ user_id: e.user_id }, update, { multi: true }, function (err, result) {
                if (err) logger.error(err , e.user_id , result);
                ep.emit("punishUnlock", result)
            })
        })

        ep.after('punishUnlock', rd.length, function (list) {
            var curtime = moment.utc().valueOf();
            var costtime = curtime - lasttime;
            //更新用户状态记录表
            UserStatusLogs.update(where, { $set: { is_effect: 0 } }, { multi: true }, function (err, rd) {
                if (err) logger.err(err, rd);
            })

            //过滤nModified!=1的，统计操作条数
            var result = list.filter(function (value, index, ar) {
                if (value.nModified == 1) return true;
                else return false;
            });
            logger.debug('punishUnlock finish,Total:',result.length);
            if (!config.debug) {
                //将操作记录写进操作日志中
                OperateLog.create({
                    user: "system",
                    operation: "unlock_anchor_bansStatus",
                    origin_content: "ModifiedNum:" + result.length + ",CostTime:" + costtime + "ms",
                    submit_content: "",
                }, function (err, rd) { if (err) logger.err(err, rd); })
            }
            logger.info('punishUnlock end', "ModifiedNum:" + result.length + ",CostTime:" + costtime + "ms");
        })

    })
}