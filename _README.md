#BFEFramework
大前端开发框架（包含浏览器端和NodeJS服务器端），基于JS/NodeJS全端开发。 Author: LinWenLong.  Email:lz@leadwit.com

## 项目运行初始化
- npm install
- cd admin && bower install && cd ../

## 启动服务
- grunt run         //使用生产环境配置
- grunt dev         //使用开发环境配置
- grunt test        //使用测试环境配置


## 特别注意！
>- 修改后台UI要修改.shtml文件，实际运行的是html文件。
使用.shtml是为了兼容在windows下直接运行shtml文件。其他平台下生成.html文件，主要是为了处理.shtml里的include指令。
在Windows/IIS环境或任何支持shtml的web server下，也可直接运行shtml文件。

- 修改后，执行 grunt ssi 生成.html文件！
- grunt watch：监控.shtml修改，自动生成.html文件
- grunt compress: 压缩项目指定文件成zip


##目录结构说明
    ├── admin                        后台管理界面目录
    ├── ├── bower_components         后台界面的前端资源依赖
    ├── app                          NodeJS代码目录
    ├── ├── models                   数据库模型    
    ├── logs                         由log4js生成的服务器端运行日志
    ├── dist                       前端资源编译输出目录[必要时使用]
    ├── test                         测试程序目录
    ├── views                        NodeJS视图层目录[必要时使用]
    ├── app.js                       NodeJS应用启动程序
    ├── gruntfile.js                 grunt配置
    ├── config.js                    本应用的系统配置文件
    ├── README.md                    工程说明文档
    ├── bower.json                   bower安装文件
    ├── package.json                 package    

##版本号管理约定
每次合并到master都需要修改版本号，修改版本号的大小，依据发布情况决定，至少是小版本号+1。
本工程使用version-updater(https://www.npmjs.com/package/version-updater)管理版本号，命令如下：
安装：npm install -g version-updater
使用：version [options] command [command-options]

-M --major [howMany]: increase by [howMany] the major version number (X+howMany.0.0); if [howMany] is missing, increase by 1
-m --minor [howMany]: increase by [howMany] the minor version number (x.X+howMany.0); if [howMany] is missing, increase by 1
-p --patch [howMany]: increase by [howMany] the patch version number (x.x.X+howMany); if [howMany] is missing, increase by 1

如：
version update -p
更多说明，见上述链接。