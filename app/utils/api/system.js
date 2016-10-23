var logger = require('../../common/logger').logger('api');

module.exports = function (api) {
    //注册V1协议的Req & Resp的字段
    var category = new api.Field({'name': 'category', 'type': 'string', 'system': true, 'required': true, 'description': '服务类别'});
    var service = new api.Field({'name': 'service', 'type': 'string', 'system': true, 'required': true, 'description': '服务名称'});
    var version = new api.Field({'name': 'version', 'type': 'string', 'system': true, 'required': true, 'description': '服务版本'});
    var sign = new api.Field({'name': 'sign', 'type': 'string', 'system': true, 'required': true, 'description': '数字签名'});
    var time = new api.Field({'name': 'time', 'type': 'datetime', 'system': true, 'required': true, 'description': '请求时间'});
    api.regField(category);
    api.regField(service);
    api.regField(version);
    api.regField(sign);
    api.regField(time);
    api.systemInputs = [category.name, service.name, version.name, sign.name, time.name];

    var code = new api.Field({'name': 'code', 'type': 'string', 'system': true, 'required': true, 'description': '响应代码'});
    var message = new api.Field({'name': 'message', 'type': 'string', 'system': true, 'required': true, 'description': '响应消息'})
    api.regField(code);
    api.regField(message);
    api.systemOutputs = [code.name, message.name];

    // logger.debug('init category system');
}