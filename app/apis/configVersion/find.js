'use strict'
var CONFIG = require('../../../config');
var Model = require('../../models/index_main');
var EventProxy = require('eventproxy');
var ConfigVersion = Model.ConfigVersion;
var logger = require('../../common/logger').logger('config');
var lodash = require('lodash')

module.exports = {
    name: 'find',
    description: '新增配置版本信息',
    version: '1.0.0',
    checkSign: CONFIG.api_sign_enable,
    inputs: ['*sort','*limit','*page','*platform','*status','*location'],
    outputs: '',
    executor: function (inputs, res, next, cb) {
        var ep = new EventProxy()
        ep.fail(cb)
        var where = lodash.clone(inputs)
		var option = {};

        var del_arr = ['limit', 'sort', 'page', 'q']
        del_arr.forEach(x =>
            delete where[x]
        )

        if (!where.platform) delete where.platform;
        if (!where.status)delete where.status;
        if (where.location){
            where.$or = [{'location':where.location},{'location':'all'}]    
        }else{
            where.location='all'; 
        }
        delete where.location;
        
        option.limit = Number(inputs.limit) || 20
        if(inputs.sort)
            option.sort = JSON.parse('{status: -1,' +   inputs.sort.replace(/(\w+):(-)?1/g,'"$1":$21')  + '}')
        else
           option = { sort: { status: -1, sort: -1, platform: 1, platform_ver: -1 } }
        
        inputs.page = inputs.page || 1;
        if(inputs.page>1)option.skip = (inputs.page-1) * option.limit;

        ConfigVersion.count(where, ep.done(function (rd) {
            ep.emit('count', rd);
        }))

        ConfigVersion.find(where, {}, option, function (err, rd) {
            if (err) {
                logger.error('find configuration error:', err ,rd)
                return cb(err);
            }
            ep.emit('find', rd);
        })

        ep.all('count', 'find', function (count, find) {
            var result = {
                models: find,
                totalRows: count
            }
            cb(null, result);
        })
    }
}