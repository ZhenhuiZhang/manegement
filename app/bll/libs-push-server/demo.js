'use strict'
var thrift = require('thrift');
var PushService = require('./PushService');
var ttypes = require('./aiopns_types');

var connection = thrift.createHttpConnection("192.168.0.20", 7075, {
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


// multicastDbPush
var dbmessage = new ttypes.DBMessage();
dbmessage.key = 'roomid1'
client.multicastDbPush(dbmessage, function (err, response) {
    console.log('return multicastDbPush, key=' + response.key);
})

// multicastPush
var tokens = ['AIzaSyBMYckk4VNHr4z41UcLZ6rfatRc0pBm8_o', 'AIzaSyBMYckk4VNHr4z41UcLZ6rfatRc0pBm8_2']
var message = new ttypes.Message
message.time_to_live = 86400 // the max live time in seconds.
var notification = new ttypes.NotificationPayload()
notification.title = 'helloworld title.'
notification.body = 'helloworld body.'
message.notification = notification
message.data = { 'url_scheme': 'room://?user_id=123' }
client.multicastPush(tokens, message, function (err, response) {
    console.log('return multicastPush, success=' + response.success
        + ', failure=' + response.failure
        + ', canonical_ids=' + response.canonical_ids);
})

// unicastPush
var to = 'AIzaSyBMYckk4VNHr4z41UcLZ6rfatRc0pBm8_o'
client.unicastPush(to, message, function (err, response) {
    console.log('return unicastPush, token=' + response.token
        + ', error=' + response.error
        + ', registration_id=' + response.registration_id);
})