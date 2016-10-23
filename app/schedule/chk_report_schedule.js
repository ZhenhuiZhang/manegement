//进程重启，检查报表是否成功生成
var config = require('../../config')
var db_main = require('../models/index_main')
var logger = require('../common/logger').logger('chk_report');
var moment = require('moment')
var getTimezone = require('moment-timezone');
var nodemailer = require('nodemailer');
var ScheduleLogs = db_main.ScheduleLogs

module.exports = function(){
    if(process.env.NODE_ENV === 'production'){
        var now = new moment().add(-5,'hours').add(-20,'minutes').add(-1,'days')
        var today = moment.tz(now.format('YYYY-MM-DD'),'utc').startOf('day')

        ScheduleLogs.find({last_time: today.toDate()},function(err,rd){
            if(rd.length == 3){
                logger.info('All report init success!')
            }else{
                var transporter = nodemailer.createTransport('smtps://306372058%40qq.com:vteyjuydwmfrcbaa@smtp.qq.com');
    
                // setup e-mail data with unicode symbols 
                var mailOptions = {
                    from: '"Li Jinrong 👥" <306372058@qq.com>', // sender address 
                    to: 'maron.li@nonolive.com, owen.lin@nonolive.com', // list of receivers 
                    subject: '报表出问题了！', // Subject line 
                    text: today.format('YYYY-MM-DD')+' 今天报表定时任务没有执行成功！', // plaintext body 
                    html: '<b>'+today.format('YYYY-MM-DD')+' 今天报表定时任务没有执行成功！</b>' // html body 
                };
                
                // send mail with defined transport object 
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        return console.log(error);
                    }
                    logger.info('Message sent: ' + info.response);
                });
            }
        })
    }
}