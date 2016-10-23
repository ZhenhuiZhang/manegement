var mailer        = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config        = require('../config');
var logger        = require('./logger').logger('email');
var transporter     = mailer.createTransport(smtpTransport(config.mail_opts));

/**
 * Send an email
 * @param {Object} data 邮件对象
 */
var sendMail = function (data) {
//   if (config.debug) {
//     return;
//   }

  data.from = data.from || config.email_sender;
  // 遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
  transporter.sendMail(data, function (err) {
    if (err) {
      // 写为日志
      logger.error(err);
    }
  });
};
exports.sendMail = sendMail;


var emailToAdmins = function(subject,html) {
    console.log(config.email_sender,config.admin_emails.toString());
    sendMail({
        from: config.email_sender +'<'+ config.mail_opts.auth.user +'>',
        to: config.admin_emails.toString() ,
        subject: 'NonoLive error. '+ subject,
        html: html
    })
}
exports.emailToAdmins = emailToAdmins;