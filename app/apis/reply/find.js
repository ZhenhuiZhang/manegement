'use strict'
var CONFIG  = require('../../../config');
var models = require('../../models')
var Reply    = models.Reply;
var EventProxy   = require('eventproxy');

module.exports = {
	name: 'find',
	description: 'get book list',
	version: '1.0.0',
	checkSign: CONFIG.api_sign_enable,           //是否校验签名  
	inputs: ['*deleted','*limit', '*sort', '*page',],
	outputs: '[{ReplyModal}]',
	executor: function (inputs, res, next, cb) {
		var ep = new EventProxy();
        ep.fail(cb);
		let where = {};

		//分页
		var option = {}
        option.limit = Number(inputs.limit) || 20
        option.sort = inputs.sort || '-create_at';

        inputs.page = inputs.page || 1;
        if (inputs.page > 1) option.skip = (inputs.page - 1) * option.limit;

		if (inputs.deleted){
			where.deleted = inputs.deleted === "false"?false:true
		}

		Reply.count(where, function (err,rd) {
            ep.emit('count', rd);
        })

        Reply.find(where, {},option, function(err, rd){
			ep.emit('find', rd)
		})

        ep.all('count', 'find', function (count, find) {
            var result = {
                models: find,
                totalRows: count
            }
            cb(null, result)
        })
		
	}
}