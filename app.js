var config = require('./config');
require('colors');
var path = require('path');
var http = require('http');
var express = require('express');
var ejs = require('ejs');
var request = require('request');
var errorhandler = require('errorhandler');
var tools = require('./app/utils/tools');
var logger = require('./app/common/logger').logger('app');
var compress = require('compression');
var bodyParser = require('body-parser');
var API = require('./app/utils/api');
var session = require('express-session');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));

// Request logger。请求时间
// app.use(requestLog);

//静态资源目录
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// 通用的中间件
app.use(require('response-time')());
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(bodyParser.json({limit: '1mb',uploadDir: './uploads/'}));
app.use(require('method-override')());
app.use(require('cookie-parser')(config.session_secret));
app.use(compress());
app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
}))


var Models = require('./app/models');
var Auth = require('./app/middlewares/auth');
var auth = new Auth(app, Models.Admin);
auth.initialize();
auth.routes();


var routes = tools.requires(path.join(__dirname, 'app/controllers'));
for (var i in routes) {
    routes[i](app);
}

var schedule = tools.requires(path.join(__dirname, 'app/schedule'));
for (var i in schedule) {
    schedule[i]();
}

var api = new API();
api.scan(path.join(__dirname, './app/apis'));
api.routes(app);
app.locals = app.locals||{};
app.locals.api = api;

if (!module.parent) {
    var server = http.createServer(app);
    server.listen(config.port, function() {
        console.log('server listening on port ' + config.port )
    })
}

module.exports = app;