'use strict'
var logger = require('../../common/logger').logger('')
var fs = require('fs')
var Modules = require('../../models/')

const root_path = __dirname + '/../../../dashboard/admin/modules'

//扫描文件，获取模块和权限
exports.scan = function(dir) {
    dir = dir || ''
    dir = root_path + dir
    // console.log('dir',dir)
    var files=getAllFiles(dir)
    var roles_map = {}
    files.forEach(_file=>{
        // console.log(i)
        var body=fs.readFileSync(root_path+'/'+_file, "utf-8");

        //扫描模块
        var reg = new RegExp(/<meta[\r\n]*\t*\s*[\r\n]*name\s*=\s*"permission"[\r\n]*\t*\s*[\r\n]*content\s*=\s*\"([^\"]+)"[\r\n]*\t*\s*[\r\n]*\t*.*[\r\n]*\t*\s*\/?>/mg);
        // if( reg.test(body) ){
        //     console.log('meta',_file)
        //     let matchs = body.match(reg) 
        //     console.log('matchs',matchs)
        //     matchs.forEach(meta=>{
        //         reg = new RegExp(/<meta[\r\n]*\t*\s*[\r\n]*name\s*=\s*"permission"[\r\n]*\t*\s*[\r\n]*content\s*=\s*\"([^\"]+)"[\r\n]*\t*\s*[\r\n]*\t*.*[\r\n]*\t*\s*\/?>/,'mg');
        //         console.log('meta matchs',meta,reg.exec(meta))
        //     })
        // }
        var result;
        while ((result = reg.exec(body)) != null)  {
            // console.log('meta',_file)
            console.log('permission',_file,result[1])
            let json = JSON.parse(result[1].replace(/'/g,'"'))
            // console.log(json)
            json.create_at = new Date()
            Modules.PermissionModules.findOneAndUpdate({name: json.name},{$set: json},{upsert:true},function(err,rd) {
                if(err) console.log(err)
            })
        }

        //扫描模块权限
        var reg2 = new RegExp(/data-roles\s*=\s*\"([^\"]+)\"/g);
        while ((result = reg2.exec(body)) != null)  {
            console.log('data-roles',_file,result[1])
            let json = JSON.parse(result[1].replace(/'/g,'"'))
            json.create_at = new Date()
            if(roles_map[json.parent])
                roles_map[json.parent].push(json)
            else
                roles_map[json.parent] = [json]
            
            Modules.PermissionModules.findOneAndUpdate({name:json.name},{$set: json},{upsert:true},function(err,rd) {
                if(err) console.log(err)
            })
        }
    })
    // console.log(roles_map)
    // for(let k in roles_map){
    //     let json = roles_map[k]
    //     console.log('json',k, json)
    //     Modules.PermissionModules.findOneAndUpdate({name: k},{$set: {privilege: json}},{upsert:true},function(err,rd) {
    //         if(err) console.log(err)
    //     })
    // }
}

function getAllFiles(root) {
    var res = [], files = fs.readdirSync(root);
    files.forEach(function (file) {
        if(file.endsWith('.js'))return
        if(file.endsWith('.html'))return

        var pathname = root + '/' + file, stat = fs.lstatSync(pathname);
        // console.log(root,file)

        if (!stat.isDirectory()) {
            res.push(pathname.replace(root_path, '.'));
        } else if(file !='controller'){
            res = res.concat(getAllFiles(pathname));
        }
    })
    return res
}

//初始化权限项
exports.role_init = function() {
    Modules.PermissionModules.findOneAndUpdate({name: 'SUPER_ADMIN'},{name: 'SUPER_ADMIN'},{upsert:true},(err,rd)=>{
        if(err)return logger.error(err)
        logger.info('init role.')
    })
}