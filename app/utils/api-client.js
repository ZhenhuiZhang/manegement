'use strict'
/**
 * restify-APIServer client util
 */
var restify = require('restify');
var md5 = require('md5');
var moment = require('moment');
var urlencode = require('urlencode');
var logger = require('../common/logger').logger('api-client');

function getSign(paras,API_MD5_KEY){
    if(!paras){     //处理为空时
        return md5(API_MD5_KEY);
    }
    
    var querys = [];
    for(var i in paras){
        if('sign' == i.toLowerCase())
        continue;
        querys.push(i);
    }
    querys.sort();
    var querys_val=[];
    querys.forEach(function(n){
        querys_val.push(paras[n]);
    });
    
    return md5(API_MD5_KEY + querys_val.join(''));
}
function json2url(json){
    if(!json)return'';
    var url = [];
    for(var i in json){
        url.push(i +'='+ urlencode( json[i]) )
    }
    return url.join('&');
}
function url2json(url) {
   var obj={};

   function arr_vals(arr){
      if (arr.indexOf(',') > 1){
         var vals = arr.slice(1, -1).split(',');
         var arr = [];
         for (var i = 0; i < vals.length; i++)
            arr[i]=vals[i];
         return arr;
      }
      else
         return arr.slice(1, -1);
   }

   function eval_var(avar){
      if (avar[1].indexOf('[') == 0)
         obj[avar[0]] = arr_vals(avar[1]);
      else
         obj[avar[0]] = avar[1];
   }

   if (url.indexOf('?') > -1){
      var params = url.split('?')[1];
      if(params.indexOf('&') > 2){
         var vars = params.split('&');
         for (var i in vars)
            eval_var(vars[i].split('='));
      }
      else
         eval_var(params.split('='));
   }
   return obj;
}

function getSignUrl(url,paras,key){
    if(!paras && typeof(paras)=='string')paras = {};
    var time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    if(paras && !paras.timestamp){
        paras.timestamp = time;
    }
    url += '?sign='+ getSign(paras,key) + '&'+ json2url(paras);
    return url;
}
function getApiRequestUrl(url,paras,key,client_options){
    var new_url = '';
    if(client_options.signature == false){
        new_url = url +'?'+ json2url(paras);
    }else{
        new_url = getSignUrl(url,paras,key); 
    }
    return new_url;
}


class Client {
    constructor(options){
        options = options || {};
        this.key = options.key;
        this.url = options.url;
    }
    get(url, paras ,cb, client_options) {
        if(typeof(paras)==='function' && !cb){
            cb = paras;
            paras = '';
        }
        client_options = client_options || {};
        if(!client_options.url){
            client_options.url = this.url; 
        }
        var new_url = getApiRequestUrl(url,paras,this.key,client_options);
        
        var client = restify.createJsonClient(client_options);
        var t = new Date();
        client.get(new_url,function(err,req,res,obj){
            var duration = (new Date() - t);
            logger.info("api get", client_options.url + new_url, ("(" + duration + "ms)").green);
            
            // cb(err,req,res,obj);
            cb(err,obj, req, res);
        })
    }
    post(url, paras ,cb, client_options) {
        if(typeof(paras)==='function' && !cb){
            cb = paras;
            paras = '';
        }
        client_options = client_options || {};
        if(!client_options.url){
            client_options.url = this.url; 
        }
        var client = restify.createJsonClient(client_options);
        var t = new Date();
        
        client.post(url, paras ,function(err,req,res,obj){
            var duration = (new Date() - t);
            logger.info("api post", client_options.url + url, ("(" + duration + "ms)").green);
            
            // cb(err,req,res,obj);
            cb(err,obj, req, res);
        })
    }
}
// var Client = function(options){
//     options = options || {};
//     this.key = options.key;
//     this.url = options.url;
// }
// Client.prototype.get = get


module.exports = Client;


/**
 * DEMO

var ApiClient = require('../utils/api-client');
var apiclient = new ApiClient({
    key: 'Hf7weZuREJQ!#DJDI&m8x&1QF!nciLhV',            //由APIServer提供
    url: 'http://192.168.0.20:9000'                     //APIServer地址
});

var where = {
    sender_id: req.session.user.user_id,
    gift_id: req.query.gift_id,
    receive_id: req.query.receive_id,
    quantity: req.query.quantity
}
apiclient.get('/gift/send', where , function(err,rd){
    res.send(err||rd)
})

 */