var fs = require('fs');

//用于生成打包文件名
var mydate = new Date();
var datenow = mydate.getFullYear().toString();
if((mydate.getMonth()+1) < 10){
    datenow += '0';
}
datenow += (mydate.getMonth()+1).toString();
if((mydate.getDate()+1) < 10){
    datenow += '0';
}
datenow += (mydate.getDate()).toString();
if((mydate.getHours()) < 10){
    datenow += '0';
}
datenow += (mydate.getHours()).toString();
if((mydate.getMinutes()) < 10){
    datenow += '0';
}
datenow += (mydate.getMinutes()).toString();
var zipname = 'cmsmanager'+datenow+'.zip';     //文件名
//END

module.exports = function(grunt){
    grunt.initConfig({
        //编译前端系统中所有模块的模板文件shtml生成html
        ssi: {
            default: {
                options: {
                    cacheDir: './.tmp/.ssiCache',
                    baseDir: 'dashboard/admin/modules/*/'      //include指令的相对目录
                },
                files: [
                    {
                        expand: true,
                        cwd: './dashboard/admin/modules/',
                        src: ['**/*.shtml'],
                        dest: './dashboard/admin/modules/',
                        ext:'.html'
                    }
                ]
            },
            index: {
                options: {
                    cacheDir: './.tmp/.ssiCache',
                    baseDir: 'dashboard/admin/'      //include指令的相对目录
                },
                files: [
                    {
                        expand: true,
                        cwd: './dashboard/admin/',
                        src: ['*.shtml'],
                        dest: './dashboard/admin/',
                        ext:'.html'
                    }
                ]
            }
        }
        ,
        //监控前端系统中所有模块的模板文件shtml的变化，生成html
        watch: {
            options: {
                spawn: false
            },
            shtml: {
                files: [ 'dashboard/admin/modules/**/*.shtml', 'dashboard/admin/*.shtml','dashboard/admin/modules/**/*.html', 'dashboard/admin/*.html'],
                tasks: [ 'shell:cleanSSICache','ssi']
            }
        },
        //压缩指定的目录到zip文件
        compress: {
            main: {
                options: {
                    archive: zipname
                },
                files: [
                    {src: ['app/**','static/**','fullstack_modules/**',
                        'node_modules','logs','admin/**',
                        'app.js','package.json','settings.js','README.md','gruntfile.js']
                    }
                ]
            }
        }
        ,
        shell:{
            //删除SSI编译时产生的临时文件。有的系统中缓存完全不会刷新。 @Owen.Lin on 20151123
            cleanSSICache:{
                command:[
                    // 'rm -rf .tmp',              //mac
                    'rd/s/q .tmp'            //windows
                ].join('&&')
            },
            cleanSSICacheAndCreate:{
                command:[
                    // 'rm -rf .tmp',              //mac
                    'rd/s/q .tmp',           //windows
                    'grunt ssi'
                ].join('&&')
            }
        }
    });
    grunt.loadNpmTasks('grunt-ssi');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks("grunt-shell");

    //改为使用make发布
    grunt.registerTask('fontConfigHandler','前端配置文件配置',function(type){
        type = type || 'debug';
        grunt.log.writeln('使用 '+ type +' 模式发布config.js');
        if(type=='test'){
            grunt.file.copy('./dashboard/admin/script/config_test.js','./dashboard/admin/script/config.js');
        }
    })

    grunt.registerTask('build',['fontConfigHandler']);
    grunt.registerTask('deploy',['ssi']);                         //执行发布前的处理工作
    grunt.registerTask('watchSSI',['ssi','watch:shtml']);                       //开发环境下监控模板变化
    grunt.registerTask('default',['ssi','watch:shtml']);                        //默认命令，开发环境下监控模板变化

    //执行一些预处理操作，并以生产环境配置启动本系统
    grunt.registerTask('run',['fontConfigHandler:release']);
    //测试环境下启动服务脚本
    grunt.registerTask('test',['fontConfigHandler:test']);
    //开发环境下启动服务脚本
    grunt.registerTask('dev',['build','shell:cleanSSICache','ssi']);
};
/*
生产环境下用grunt run，启动服务；
开发环境下用grunt dev，启动服务,同时新开一个命令行窗口执行grunt watchSSI命令
特别注意：
    如果更改了npm中依赖包的版本，在不同环境下时（如在生产环境部署，需要先执行npm install）
*/