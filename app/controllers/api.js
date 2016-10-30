var lodash = require('lodash')
var api_client = require('../common/api_client')
var logger = require('../common/logger').logger('controller/api')
var tools = require('../common/tools')
var Models = require('../models/')
var api_permission = require('./mod/api_permission')

module.exports = function(app) {
    app.all('/api/*', permission, function(req,res,next) {
        var api_path = req.path.replace('/api/','/')
        
        //检查登录状态,单元测试环境下不校验
        if(process.env.NODE_ENV !== 'testUnit' && !app.auth.authenticatedAjax(req)) return res.status(403).send('')

        //获取和保存操作日志
        if(req.body.operate_log){
            var operate_log = lodash.clone(req.body.operate_log)
            delete req.body.operate_log
        }
        
        //本地存在API时，调用本地
        if(lodash.has(app.locals.api.services,api_path +'/1.0.0')) return next()
            
        //透传到APIServer
        if(req.method=='POST')
            api_client.post(api_path,req.body,function(err,params) {
                if(err)logger.error(err)
                res.send(params)
            })
        else
            api_client.get(api_path,req.query,function(err,params) {
                if(err)logger.error(err)
                res.send(params)
            })
    })
    app.get('/player',function(req,res,next) {
        res.send(app.locals.api)
    })

    app.get('/tmp/forTwoWeek', function(req, res, next){
        api_client.get('/statis/calcAuthorStatis', function(err, params, _request, _response){
            if(err)logger.error(err);
            res.writeHead(200, {
                'Content-Type' : 'text/csv',
                'Content-Disposition' : 'attachment; filename=data.csv'
            });
            res.write(_response.body);
            res.end();
            next();
        });
    })

    function permission(req,res,next){
        //单元测试环境下不校验
        if(!app.auth.authenticatedAjax(req)&&process.env.NODE_ENV !== 'testUnit') return res.status(403).send('')
        return api_permission.auth(req,res,next)
    }
}

