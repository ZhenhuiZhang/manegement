'use strict'
var thrift = require('thrift');
var PushService = require('./PushService');
var ttypes = require('./aiopns_types');
var logger  = require('../../common/logger').logger('pushserver');
var CONFIG  = require('../../../config');

logger.debug('pushserver config',CONFIG.push_server, CONFIG.push_server_port)
var connection = thrift.createHttpConnection(CONFIG.push_server, CONFIG.push_server_port, {
    transport: thrift.TBufferedTransport(),
    protocol: thrift.TBinaryProtocol(),
    headers: { "Connection": "close" },
    https: false
})

connection.on('error', function (err) {
    console.error('push-server', err)
})

// Create a PushService client with the connection
var client = thrift.createClient(PushService, connection);

// multicastPush
exports.send = function(tokens, message_obj, platform, cb) {
    var message             = new ttypes.Message
    message.time_to_live    = 1800             // the max live time in seconds.
    message.data            = message_obj.data
    if(platform=='ios')
        message.priority = 'high'
    var notification        = new ttypes.NotificationPayload()
    notification.icon       = message_obj.icon
    notification.title      = message_obj.title
    notification.body       = message_obj.body
    // notification.sound      = platform=='android' ? 'default' : ''
    notification.sound      = 'default'
    if(platform=='ios')
        notification.badge  = '1'
    message.notification    = notification

    logger.info('call push-server', tokens.length)    
    try{
        client.multicastPush(tokens, message, cb)
    }catch(e){
        logger.error(e)
    }
}