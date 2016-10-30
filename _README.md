#BFEFramework
大前端开发框架（包含浏览器端和NodeJS服务器端），基于JS/NodeJS全端开发。

## 项目运行初始化
- npm install
- cd admin && bower install && cd ../

## 启动服务



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
