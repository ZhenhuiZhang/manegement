'use strict';
var __ = require('lodash')
var CMS_Models  = require('../models');
var Main_Models = require('../models/index_main')
var Models = __.extend(CMS_Models,Main_Models)

/**
 * 清理 和 赋值 API描述中的输入参数的格式
 * *：可选参数
 * ?：其一必传
 * 1?：分组其一必传
 * []: 数组参数
 * {XxxModel}：XXX model对象（按key=val的url参数传入，目前不支持嵌套子对象）
 */
exports.getAndCleanInputs = function(arr, inputs) {
    var new_arr = {};
    if(!arr) return new_arr;
    arr.forEach(function(item){
        item = item.replace(/\*/g,'').replace(/\d?\?/g,'').replace(/\[|\]/g,'');
        var reg = new RegExp(/\{(\w+)Model\}/);        
        if(item.startsWith('{') && reg.test(item) ){
            var model_name = reg.exec(item)[1];
            var Model = Models[model_name];
            for(let key in Model.schema.tree){
                if(inputs[key]) new_arr[key] = inputs[key]
            }
        }else{
            if(inputs[item]) new_arr[item] = inputs[item]
        }
    })
    return new_arr;
}

/**
 * 检查参数列表中的所有必选项是否有值
 */
exports.checkInputs = function(arr,inputs) {
    if(!arr) return true;
    var check = 0;
    var existOnce = 0;  //是否？符号，即至少包含一组参数中的一个
    var checkOnce = 0;
    arr.forEach(function(item){
        if(item.startsWith('*'))return        //可选参数
        if(item.startsWith('{'))return        //对象参数，视为可选
        
        item = item.replace(/\[|\]/g,'');
        if(item.includes('?')){
            item = item.replace(/\d?\?/g,'');
            existOnce++;
            if(!inputs[item])checkOnce++
        }else if(!inputs[item])check++
    })
    return check>0 ? false : true;
}