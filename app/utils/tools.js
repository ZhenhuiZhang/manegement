var fs = require('fs');

var Tools = function () {}

//搜索加载目录内的所有js，并调用require得到这些exports
// * path       搜索目录，绝对目录
// * recursive  是否递归搜索子目录
//把这个方法用各个目录的index.js代替，实现一样的功能
Tools.prototype.requires = function (path) {

    var rqs = [];
    var files = fs.readdirSync(path);
    files.forEach(function (file) {
        if (file.length - 3 == file.indexOf('.js')) {
            rqs[rqs.length] = require(path + '/' + file);
        }
    });
    return rqs;
}

//通过master页面渲染page，要求master里面有'content'属性
// * app        app对象
// * res        response对象
// * master     master页面
// * page       模板页面
//把这个方法扩展到app，成为master方法，传入master, page, options, fn
Tools.prototype.render = function (app, res, master, page, options, fn) {

    app.render(page, options, function (err, html) {

        options['content'] = html;
        res.render(master, options);
        delete  options['content'];
    });
}

module.exports = new Tools();