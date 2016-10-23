'use strict'
var lodash = require('lodash');
var md5 = require('md5');
var type = require('./api/type');
var system = require('./api/system');
var logger = require('../common/logger').logger('api');
var tools = require('../common/tools');
var apiTools = require('./api_tools');
var restify = require('restify');
var CONFIG = require('../../config');
var fs = require('fs');

//构造器
var API = function() {
    this.categories = {};
    this.fields = {};
    this.services = {};
    this.systemInputs = []; //系统级输入
    this.systemOutputs = []; //系统级输出
    type(this); //初始化types
    system(this); //初始化system包
}

API.prototype.checkSign = function(paras) {
    var API_MD5_KEY = CONFIG.secret_key;       //API密钥，长度要求32位.

    var querys = [];
    var querys_val = [];
    for(var i in paras){
        if('sign' == i.toLowerCase())
        continue;
        querys.push(i);
    }
    querys.sort();
    querys.forEach(function(n){
        querys_val.push(paras[n]);
    })
  
    var md5str = API_MD5_KEY + querys_val.join('');
    // logger.debug(md5str)
    md5str = md5(md5str)

    // 对比签名
    if(md5str != paras.sign){
        return false;
    }
    
    //对比时间戳，允许6分钟内时差
    var datediff = Math.abs(tools.DateDiff('h',new Date(paras.timestamp),new Date() ));
    if(datediff > CONFIG.request_timestamp){
        return false;
    }
    
    return true;
}

//智能处理string,map,object; 这些reg & get是可以用this['categories'][obj.key()]统一操作的
//TODO string-->///string...
//TODO 类型查找顺序，先service自己，再category，最后是system全局
API.prototype.wrap = function(obj, clazz) {
    if (obj instanceof clazz) {
        return obj;
    } else if (typeof(obj) == 'string') {
        return new clazz(this.Type.parseKey(obj));
    } else {
        return new clazz(obj);
    }
}

API.prototype.unwrap = function(obj, clazz) {
    if (typeof(obj) == 'string') {
        return obj;
    } else if (obj instanceof clazz) {
        return obj.key();
    } else {
        obj = new clazz(obj);
        return obj.key();
    }
}

API.prototype.regCategory = function(category) {
    category = this.wrap(category, this.Category);
    //logger.debug('regCategory: ' + category.key());
    this.categories[category.key()] = category;
}
API.prototype.regField = function(field) {
    field = this.wrap(field, this.Field);
    this.fields[field.name] = field;
}

API.prototype.regService = function(service, callback) {
    service = this.wrap(service, this.Service);
    service.executor = callback
    // logger.debug('regService: ' + service.key());
    this.services[service.key()] = service;
}

API.prototype.getCategory = function(category) {
    category = this.unwrap(category, this.Category);
    // logger.debug('getCategory: ' + category);
    return this.categories[category];
}

API.prototype.getService = function(service) {
    service = this.unwrap(service, this.Service);
    // logger.debug('getService: ' + service);
    return this.services[service];
}
API.prototype.scan = function(path) {
    var self = this;
    var requires = function (path) {
        var rqs = [];
        var files = fs.readdirSync(path);
        files.forEach(function (file) {
            //使用/目录/index.js的方式加载
            if(!file.includes('.')){
                // logger.debug('api scan',path + '/' + file)
                rqs[rqs.length] = require(path + '/' + file);
            }
        });
        return rqs;
    }

    var requires_ = requires(path);
    requires_.forEach(function(c) {
        if (c instanceof Function) {
            c = new c(self);
        }

        //简单加载category和里面的service
        var category = new self.Category(c);
        self.regCategory(category);
        if (c.services) {
            c.services.forEach(function(svc) {
                var service = new self.Service(svc);
                if (!service.category) {
                    service.category = category.name;
                }
                self.regService(service, service.executor);
            })
        }
    })
}

API.prototype.invoke = function(service, inputs,res,next, callback,req) {
    // logger.debug('invoke: ' + service + ', with: ' + JSON.stringify(inputs));
    logger.debug('invoke: ' + service);
    
    var svc = this.getService(service);
    if (svc == null) {
        logger.debug('no service found: ' + service);
        callback(new Error('no service found for ' + service), null);
    } else {
        //根据服务的配置情况，执行签名验证
        if(svc.checkSign && (!inputs.sign || !inputs.timestamp || !this.checkSign(inputs) ) ){
            return next(new restify.NotAuthorizedError('wrong sign.'));
        }
        delete inputs.sign;
        delete inputs.timestamp;
        if( !apiTools.checkInputs(svc.inputs, inputs) ){
            return next(new restify.InvalidArgumentError('Argument Error'));
        }
        //只保留API中定义的输入参数
        var clean_inputs = apiTools.getAndCleanInputs(svc.inputs, inputs)
        svc.executor(clean_inputs, res ,next , callback,req)
    }
}

API.prototype.routes = function(app) {
    var self = this;
    var routeInvoke = function(req, res, next) {
        var c = req.params.c;
        var s = req.params.s;
        var _params = req.query;
        _params = lodash.extend(req.body, _params);
        var v = req.params.v || req.headers['accept-version'] || _params.v || '1.0.0';      //API协议版本
        
        logger.debug( req.method , '/' + c + '/' + s + '/' + v, _params);        
        self.invoke('/' + c + '/' + s + '/' + v, _params, res ,next , function(err, outputs) {
                if (err) {
                    // logger.debug('callback', err,outputs);
                    if(typeof(err) == 'number'){
                        return res.send(200, { code:err,message:outputs,timestamp: tools.getMoment.utc().format() });       //业务级错误
                    }else{
                        logger.error(err);
                        if(err.statusCode && err.message && err.body)
                            return res.send(500, {code:err.body.code, message: err.message, timestamp: tools.getMoment.utc().format() })       //业务级错误
                        else
                            return res.send(500, {code:500,message:err,timestamp: tools.getMoment.utc().format() })       //业务级错误
                    }
                } else {
                    var result = {code: 0,body:outputs,timestamp: tools.getMoment.utc().format()}
                    return res.send(result);
                }
            },
            req
        )
    }
    //同时支持get和post
    app.get('/api/:c/:s', routeInvoke);
    app.post('/api/:c/:s', routeInvoke);
    // app.get({path:'/:c/:s',version:['1.0.0','2.0.0']}, routeInvoke);
    // app.get('/:c/:s/:v', routeInvoke);
};

module.exports = API;