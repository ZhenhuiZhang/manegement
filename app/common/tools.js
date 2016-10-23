var moment = require('moment');
var md5 = require('md5');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
  date = moment(date);

  if (friendly) {
    return date.fromNow();
  } else {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
};

exports.getMoment = moment;

exports.validateId = function (str) {
  return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

exports.render = function (res, file, data) {
    var filepath = path.join(__dirname,'../views/', file+'.html');
    var html = fs.readFileSync(filepath, 'utf8');

    var result = ejs.render(html, data);
    res.write(result);
    res.send(200);
}
exports.renderHtml = function (res, html, data) {
    var result = ejs.render(html, data);
    res.write(result);
    res.send(200);
}

exports.DateDiff = function(interval,date1,date2){
    var long = date2.getTime() - date1.getTime(); //相差毫秒
    switch(interval.toLowerCase()){
    case "y": return parseInt(date2.getFullYear() - date1.getFullYear());
    case "m": return parseInt((date2.getFullYear() - date1.getFullYear())*12 + (date2.getMonth()-date1.getMonth()));
    case "d": return parseInt(long/1000/60/60/24);
    case "w": return parseInt(long/1000/60/60/24/7);
    case "h": return parseInt(long/1000/60/60);
    case "n": return parseInt(long/1000/60);
    case "s": return parseInt(long/1000);
    case "l": return parseInt(long);
    }
}

exports.requires = function (path,router,filter) {
    var files = fs.readdirSync(path);
    files.forEach(function (file) {
        var condition = file.indexOf('.js')!=-1;
        if(filter)
           condition = file.indexOf('.js')!=-1 && filter.test(file);  
        if( condition ) {
            require(path + '/' + file)(router);
        }
    });
}
exports.requiresToArray = function (path,router,filter) {
    var arr = [];
    var files = fs.readdirSync(path);
    files.forEach(function (file) {
        var condition = file.indexOf('.js')!=-1;
        if(filter)
           condition = file.indexOf('.js')!=-1 && filter != file;
        if( condition ) {
            if(router)
                arr.push( require(path + '/' + file)(router) );
            else
                arr.push( require(path + '/' + file) );
        }
    });
    
    return arr;
}

/**
 * 生成一个指定位数的随机数
 */
exports.getRandom = function (n) {
    var jschars = ['0','1','2','3','4','5','6','7','8','9'];
    var res = "";
    for(var i = 0; i < n ; i ++) {
        var id = Math.ceil(Math.random()*9);
        res += jschars[id];
    }
    return res;
};

/**
 * 获取一个订单，格式:[userid]YYMMDDHHmmssSSS***（***为三位随机数）
 * 位数＝ userid长茺+18
 * now:[可选]指定时间
 * userid:[可选]用户ID 
 */
exports.getOrderId = function(now,userid) {
    now = now || new Date();
    now = moment(now);
    
    var result = '';
    if(userid)result += userid;
    result += now.format('YY');
    result += now.format('MM');
    result += now.format('DD');
    result += now.format('HH');
    result += now.format('mm');
    result += now.format('ss');
    result += now.format('SSS');
    result += exports.getRandom(3);
    return result;
}