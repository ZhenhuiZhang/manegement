var settings = require('../../config');
//var events = require('events');
var logger = require('../common/logger').logger('socket');
var events = require('./events');

var io_ = null;     //简单的单例模式


//监听broadcast事件，用于全局发送socket
events.broadcastOn(function(data){
    logger.debug('events.broadcast');
    if(io_){
        io_.sockets.emit(data.event,data.data);              //调用sockets.emit向所有客户端发送socket消息
    }else{
        logger.warn('broadcast时socket连接为空');
    }
});

/**
 * 创建socket，并结合event向客户端发送消息
 * @param server[非必须]
 * @returns io
 */
module.exports = function (server) {
    if(!io_){
        io_ = require('socket.io')(server);
        if(server == undefined){
            io_.listen(settings.socket_port);
        }
        io_.on('connection', function (socket) {
            logger.trace('a user connected');

            socket.on('setUserPipe',function(user){                 //用户登录时，创建独立的socket通道
                logger.debug('setUserPipe',user);
                events.userOn(user.userid, function(data){          //在业务中，通过events.emit发送广播，这里接收广播，意图在于业务完成后，才发送socket消息
                    logger.debug('events.userOn',user);
                    socket.emit(data.event,data.data);              //调用socket.emit向客户端发送socket消息
                });
            });
        });
    }
    return io_;
}