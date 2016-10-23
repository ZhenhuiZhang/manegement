var logger = require('../../common/logger').logger('')
var Modules = require('../../models/')
var EventProxy = require('eventproxy')
var Linq = require('../../libs/linq')
var lodash = require('lodash')

/**
 * 检查用户角色权限。
 * 需要确认执行过登录检查 TODO
 */
exports.auth = function(req,res,next) {
    var cookieObj = req.cookies.admin ? JSON.parse(req.cookies.admin) : {};
    logger.debug(cookieObj)
    logger.debug(req.path)
    logger.debug(req.query)
    return next()  
}
