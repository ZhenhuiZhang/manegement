var API = require('../utils/api');
var logger = require('../common/logger').logger('test');

// var io = require('../utils/socket')();
var events = require('../utils/events');

module.exports = function (app) {
    app.get('/ping', function (req, res) {
        res.send("pong")
    });

    app.get('/test', function (req, res) {

        var api = new API();
        api.scan('/Users/linwenlong/DEV/JavaScript/FoxyDashboard/app/apis');
        //接口路由
        api.routes(app);

//        api.invoke(userApi.services[0],{},function(err,obj){
        api.invoke('/user/getAll/1',{},function(err,obj){
            logger.trace(err);
            logger.trace(obj);
        });

        logger.debug('debug');
        logger.warn('warn');
        logger.info('info');

        res.send("test");
    });

//     app.get('/socket', function (req, res) {
// //        var io = require('socket.io')();
// //        io.on('connection',function(socket){
// //            socket.emit('server message','all message');
// //        });
//         io.sockets.emit('test','test all message');     //推送给所有客户端

// //        io.listen(8084);

// //        global.socket = 'all message';
//         res.send("all message");
//     });

    app.get('/broadcast_user', function (req, res) {
        events.userEmit(req.cookies.userid,"server message","测试用户broadcast");

        res.send("broadcast");
    });

    app.get('/broadcast', function (req, res) {
        events.broadcastEmit("server boardcast","测试全局broadcast");

        res.send("测试全局broadcast");
    });

}