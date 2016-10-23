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
    //单元测试环境下不校验
    if(process.env.NODE_ENV === 'testUnit'){return next() }
    var cookieObj = req.cookies.admin ? JSON.parse(req.cookies.admin) : {};
    logger.debug(cookieObj)
    logger.debug(req.path)
    logger.debug(req.query)

    var cur_api = req.path.replace(/^\/api/,'')
    var ep = new EventProxy();
    var location = req.query.location || req.body.location 
    logger.debug('cur_api',cur_api)


    //通过用户cookie获取角色ID,进而获取角色所拥有的权限
    Modules.PermissionRole.findOne({ name: cookieObj.role }).populate('privilege_ids').exec(function(err, rd){
        // logger.debug('PermissionRole.findOne',rd)
        if(err)return logger.error(err)
        ep.emit('role_mod', rd)
    })

    //获取当前API的上级模块信息，最多三级
    Modules.PermissionModules.findOne({ api: cur_api }, function(err, rd){
        // console.log(err,rd)
        if(err)return logger.error(err)
        ep.emit('cur_mod', rd)
        if(!rd){
            ep.emit('cur_mod_parents', '')
            return
        }

        var modules_arr = []
        modules_arr.push(rd)
        if(!rd.parentname)
            return ep.emit('cur_mod_parents', modules_arr)
        else
            Modules.PermissionModules.findOne({name: rd.parentname}, function(err, rd2){
                if(err)return logger.error(err)
                if(!rd2)return ep.emit('cur_mod_parents', modules_arr)

                modules_arr.push(rd2)
                if(!rd2.parentname)
                    return ep.emit('cur_mod_parents', modules_arr)
                else
                    Modules.PermissionModules.findOne({ name: rd2.parentname }, function(err, rd3){
                        if(err)return logger.error(err)
                        if(!rd3)return ep.emit('cur_mod_parents', modules_arr)

                        modules_arr.push(rd3)
                        return ep.emit('cur_mod_parents', modules_arr)
                    })
            })
    })
    ep.all('role_mod','cur_mod_parents',function(role_mod, cur_mod) {
        if(!role_mod) return res.status(403).send('') 
        var role_mod_privilege = role_mod.privilege_ids
        //查找是否具备超管权限
        if(lodash.find(role_mod_privilege, m=>m.name=='SUPER_ADMIN'))return next()

        if(!role_mod_privilege || !cur_mod){
            return res.status(403).send('')  
        }

        //检查location国家参数权限
        if(location && role_mod.location && role_mod.location.length && role_mod.location.indexOf('all')==-1 && role_mod.location.indexOf(location) == -1 ){
            return res.status(403).send('')
        }
        //END

        //用户角色中是否有相应API的权限声明
        var queryResult = Enumerable.From(role_mod_privilege)
                        .Where(item => item.api.indexOf(cur_api)!=-1)
                        .ToArray()
        logger.debug('queryResult.length', queryResult.length)
        if(queryResult.length){
            return next()       //拥有权限
        }else{
            //用户角色中是否有当前API的上级模块的权限声明
            var cur_mod_parentids = Enumerable.From(role_mod_privilege)
                        .Where(item => lodash.find(cur_mod,m=>m.name==item.name || m.api==item.api) )
                        .ToArray()
            logger.debug('cur_mod_parentids.length', cur_mod_parentids.length)
            if(cur_mod_parentids.length){
                return next()       //拥有权限
            }else
                return res.status(403).send('')
        }
        
    })
}
//http://lovemew67.github.io/2013/02/22/newstream/
//http://my.oschina.net/calvinchen/blog/137932
//http://mongoosejs.com/docs/2.7.x/docs/populate.html