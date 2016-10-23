'use strict'
var md5 = require('md5');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('../../config');
var logger = require('../common/logger').logger('utils-auth');
var Modules = require('../models/')

const RANDOM_PSW = '随机密码'

/**
 * 认证类，构造要传入一些参数，将来加入授权
 * @param app Express APP
 * @param User 管理类，至少有findByUsername、findById方法
 */
var Auth = function (app,  User) {
    this.app = app;
    this.login = '/auth/login';
    this.logout = '/auth/logout';
    this.success = '/dashboard/admin/';
    this.User = User;
    this.app.auth = this;
}

Auth.prototype.initialize = function () {
    var that = this;
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    passport.use(new LocalStrategy(function (username, password, done) {
        that.User.findOne({adminname: username}, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: '未找到用户名：'+ username });

            if ( user.pass != md5(md5(password)) ) {
                return done(null, false, { message: '用户名或密码错误' });
            }
            return done(null, user);
        })
    }))
    passport.serializeUser(function (user, done) {
        if (user){
            done(null, user.id);
        }
    });
    passport.deserializeUser(function (id, done) {
        that.User.findOne({_id: id}, function (err, user) {
            if (err) done(err);
            done(null, user);
        });
    });
}

/**
 * Auth的等认证路由
 */
Auth.prototype.routes = function () {
    var that = this;

    this.app.get(that.logout, function (req, res) {
        // logger.trace('Auth.prototype.routes', 'logout success.');
//        logger.trace('logout success.');
        res.clearCookie('admin');
        res.clearCookie('admintoken');
        req.logout();
        res.redirect('/dashboard/admin/login.html');
    });

    this.app.post(this.login, passport.authenticate('local', { successRedirect: this.success, failureRedirect: this.login, failureFlash: false  }));
    this.app.post('/auth/login-ajax', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return res.json({code:2,msg: err})
            }
            if (!user) {
                return res.json({code:1,msg:info.message})
            }
            req.logIn(user, function(err) {
                if (err) {
                    return res.json({code:3,msg: err})
                }
                // httpOnly:禁止程序（如JS）获取cookie值,secure:true:只在https下传输cookie
                res.cookie('admin', JSON.stringify({adminid:user.id,adminname:user.adminname,admingroup:user.group,role:user.role}), {
                    path: '/', maxAge: 1000 * 60 * 60 * 24 * 7,
                    signed: false, httpOnly: false
                });
                var sign = md5(user.id + user.adminname + user.group + user.role + RANDOM_PSW);
                // logger.debug('sign',sign,user.id + user.adminname + user.group + RANDOM_PSW)
                res.cookie('admintoken', sign, {
                    path: '/', maxAge: 1000 * 60 * 60 * 24 * 7,
                    signed: true, httpOnly: true
                })
                res.json({code: 0})
            })
        })(req, res, next);
    })
    this.app.post('/auth/chkToken', function (req, res) {
        if(that.getSign(req) == req.signedCookies['admintoken']){
            res.json({code:0})
        }else{
            logger.debug('身份校验失败',req.cookies.admin);
            res.json({code:1})
        }
    })
    //获取当前用户拥有的权限
    this.app.get('/auth/getRolePrivilege', function (req, res) {
        if(!that.authenticatedAjax(req)) return res.status(403)
        var cookieObj = req.cookies.admin ? JSON.parse(req.cookies.admin) : {}
        Modules.PermissionRole.findOne({ name: cookieObj.role }).populate('privilege_ids',{name:1,CRUD:1,parentname:1,api:1})
        .exec(function(err, rd){
            if(err)return logger.error(err)
            if(rd) 
                res.json(rd.privilege_ids)
            else
                res.json({})
        })        
    })
    //查找模块的上级模块权限
    this.app.post('/auth/getModulePrivilege', function (req, res) {
        var json_arr = req.body;
        var apis = [];
        json_arr.forEach(item=>{
            // console.log(item.api)
            if(typeof item.api=='object')
                apis = apis.concat(item.api)
            else
                apis.push(item.api)
        })
        if(!that.authenticatedAjax(req)) return res.status(403)
        if(!apis)return res.send('')

        //获取当前API的上级模块信息，最多三级
        Modules.PermissionModules.findOne({ api: {$in:apis} }, {name:1,parentname:1}, function(err, rd){
            // console.log(err,rd)
            if(err) return logger.error(err)
            if(!rd) return res.send('')

            var modules_arr = []
            // modules_arr.push(rd)         //为了节省前端存储空间，不回传当前模块权限
            if(!rd.parentname)
                return res.send(modules_arr)
            else
                Modules.PermissionModules.findOne({name: rd.parentname},{name:1,parentname:1},  function(err, rd2){
                    if(err)return logger.error(err)
                    if(!rd2)return res.send(modules_arr)

                    modules_arr.push(rd2)
                    if(!rd2.parentname)
                        return res.send(modules_arr)
                    else
                        Modules.PermissionModules.findOne({ name: rd2.parentname },{name:1,parentname:1},  function(err, rd3){
                            if(err)return logger.error(err)
                            if(!rd3)return res.send(modules_arr)

                            modules_arr.push(rd3)
                            return res.send(modules_arr)
                        })
                })
        })
    })

}

Auth.prototype.getSign = function (req) {
    var cookieObj = req.cookies.admin ? JSON.parse(req.cookies.admin) : {}; 
    var sign = md5(cookieObj.adminid + cookieObj.adminname + cookieObj.admingroup + cookieObj.role + RANDOM_PSW)
    // logger.debug('getSign',sign, cookieObj.adminid + cookieObj.adminname + cookieObj.admingroup + RANDOM_PSW);
    return sign;
}

/**
 * 判断一个用户是否登录了
 */
Auth.prototype.authenticatedAjax = function (req) {
    if (this.getSign(req) == req.signedCookies['admintoken']) {
        return true
    } else {
        return false
    }
}

module.exports = Auth;