'use strict'
var CONFIG = require('../../../config');
var Models = require('../../models');
var EventProxy   = require('eventproxy');

module.exports = {
    name: 'find',
    description: 'find push',
    checkSign: CONFIG.api_sign_enable,
    version: '1.0.0',
    inputs: ['*sort','*limit','*page'],
	outputs: '[{PushModal}]',
	executor: function (inputs, res, next, cb) {
		var ep = new EventProxy();
        ep.fail(cb);
		var where = {};
		var option = {};

		option.limit = Number(inputs.limit) || 20
        if(inputs.sort)
            option.sort = JSON.parse('{' +   inputs.sort.replace(/(\w+):(-)?1/g,'"$1":$21')  + '}')
        else
            option.sort = { create_at:-1 }
        
        inputs.page = inputs.page || 1;
        if(inputs.page>1)option.skip = (inputs.page-1) * option.limit;

		Models.Push.count(where, ep.done(function(rd){
            ep.emit('count', rd);
        }))

		Models.Push.find(where, {}, option, ep.done(function(rd){
            ep.emit('find', rd);
		}))

		ep.all('count','find',function(count,find) {  
            var result = {
                models : find ,
                totalRows: count
            }
            cb(null, result);
        })
	}
}