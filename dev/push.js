'use strict'

var logger  = require('../app/common/logger').logger('push','debug');
var push_server_client = require('../app/bll/libs-push-server/client');
var CONFIG  = require('../config')
var tools = require('../app/common/tools');
var moment = require('moment');
var EventProxy = require('eventproxy');


const platform = 'ios'
var tokens = ['cIe3kL2tSBM:APA91bFjApqSmqOZPJQxePvl9IwbZijb0TLAyeKGvEf4l6C-p961LNWyvU4eSqPhM571fZzyylt6Kua1-yOffT0mW9LYbN3xhjFKekTsnhGOxnfJa3wB9ybFqXNIfmpwujsEQGaPVDtg']
var msg_obj = {
        title: 'test',
        body: 'test',
        data: { url_scheme: 'http://m.nonolive.com/' },
        icon: 'nn_notification_icon',
    }

push_server_client.send(tokens, msg_obj, platform, function (err, rd) {
    logger.debug(err,rd)
})