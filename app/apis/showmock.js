/*
* service暂时不需要使用.只是在后台给其他service调用,在其他service的成功回调里面调用
*/
var models = require('../models');
var logger = require('../utils/logger').logger('api-mock');

var Mock = require('mockjs');
var Random = Mock.Random;

var productList = {
    'name': 'productList',
    'version': 1,
    'description': 'productList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
                'totalRows': 20,
                'models|15': [
                    {
                        'id|+1': 1,
                        'name|1': ['汕头','天津','厦门','北京','广州','深圳','福建','海外'],
                        'description': '@title',
                        'deploypath': ['@word','@word','@word'].join('/'),
                        'creator_id': '@name',
                        'creationdate': "@date('yyyy-MM-dd')" + ' ' + "@time('HH:mm:ss')"
                    }
                ]
            });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};
/**
 * 产品配置管理--配置列表
 */
var productConfigList = {
    'name': 'productConfigList',
    'version': 1,
    'description': 'productConfigList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
            'totalRows': 20,
            'models|15': [
                {
                    'id|+1': 1,
                    'name|1':'@word(3, 5).txt',
                    'product|1': ['Hummer','U3','BF'],
                    'description': '@title',
                    'configs':'列出此配置文件的所有配置项。有多少？列表形式？',
                    'creator_id': '@name',
                    'creationdate': "@date('yyyy-MM-dd')" + ' ' + "@time('HH:mm:ss')",
                    'path': ['@word','@word','@word'].join('/')
                }
            ]
        });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};

/**
 * 产品配置版本管理
 */
var productVersionList = {
    'name': 'productVersionList',
    'version': 1,
    'description': 'productVersionList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
            'totalRows': 20,
            'models|15': [
                {
                    'id|+1': 1,
                    'name|1':'@word(3, 5).txt',
                    'description': '@title',
                    'cluster|1': ['汕头','天津','厦门','北京','广州','深圳','福建','海外'],
                    'count': '@natural(0,100)',
                    'creator_id': '@name',
                    'creationdate': "@date('yyyy-MM-dd')" + ' ' + "@time('HH:mm:ss')",
                    'status': '@natural(0,1)',
                    'deployuser': '@name',
                    'deploydate': "@date('yyyy-MM-dd')" + ' ' + "@time('HH:mm:ss')",
                    'modifyHistory': '',
                    'configPkg':''
                }
            ]
        });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};




/**
 * 服务器集群
 */
var clusterList = {
    'name': 'clusterList',
    'version': 1,
    'description': 'clusterList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
            'totalRows': 20,
            'models|10': [
                {
                    'id|+1': 1,
                    'name|1': ['汕头','天津','厦门','北京','广州','深圳','福建','海外'],
                    'count': '@natural(0,100)',
                    'onlineNum': {'production':'@natural(0,100)','gray':'@natural(0,100)','test':'@natural(0,100)'},
                    'middlewareVersion': {'Hummer':'@natural(0,10)','U3':'@natural(0,10)','BF':'@natural(0,10)'},
                    'configVersion': {'Hummer':'@natural(0,10)','U3':'@natural(0,10)','BF':'@natural(0,10)'}
                }
            ]
        });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};

var serverList = {
    'name': 'serverList',
    'version': 1,
    'description': 'serverList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
            'totalRows': 20,
            'models|15': [
                {
                    'id|+1': 1,
                    'name': '@name',
                    'serverip': '@ip',
                    'middlewareVersion': {'Hummer':'@natural(0,10)','U3':'@natural(0,10)','BF':'@natural(0,10)'},
                    'configVersion': {'Hummer':'@natural(0,10)','U3':'@natural(0,10)','BF':'@natural(0,10)'},
                    'status': '@natural(0,1)',
                    'cluster|1': ['汕头','天津','厦门','北京','广州','深圳','福建','海外'],
                    'historyCluster|1': ['汕头','天津','厦门','北京','广州','深圳','福建','海外'],
                    'inClusterTime': "@date('yyyy-MM-dd')",
                    'regTime': "@date('yyyy-MM-dd')",
                    'group|1': ['生产环境','测试环境'],
                    'modify': '@natural(0,1)'
                }
            ]
        });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};


var serverGroupList = {
    'name': 'serverGroupList',
    'version': 1,
    'description': 'serverGroupList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
            'totalRows': 3,
            'models|3': [
                {
                    'id|+1': 1,
                    'name|1': ['生产环境','灰度环境','测试环境'],
                    'remark': '这里写分组说明@title(3)',
                    'count': '@natural(0,1000)'
                }
            ]
        });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};

var serverMiddlewareList = {
    'name': 'serverMiddlewareList',
    'version': 1,
    'description': 'serverMiddlewareList Mock',
    'inputs': [],
    'outputs': [],
    'executor': function (inputs, callback) {
        var datas = Mock.mock({
            'totalRows': 20,
            'models|15': [
                {
                    'id|+1': 1,
                    'name|1':'@word(3, 5).txt',
                    'product|1': ['Hummer','U3','BF'],
                    'version': '@natural(0,10).@natural(0,10)',
                    'description': '@title',
                    'creator_id': '@name',
                    'creationdate': "@date('yyyy-MM-dd')" + ' ' + "@time('HH:mm:ss')",
                    'status': '@natural(0,1)',
                    'deployuser': '@name',
                    'deploydate': "@date('yyyy-MM-dd')" + ' ' + "@time('HH:mm:ss')",
                    'modifyHistory': '',
                    'configPkg':''
                }
            ]
        });

        callback(null, Mock.mock({
            code: '00',
            message: 'success',
            body: datas
        }));
    }
};



var category = {
    name: 'showmock',
    description: 'mock',
    fields: [],
    types: [],
    services: [
        productList , productConfigList , productVersionList ,
        clusterList , serverList , serverGroupList , serverMiddlewareList
    ]
}

module.exports = category;
