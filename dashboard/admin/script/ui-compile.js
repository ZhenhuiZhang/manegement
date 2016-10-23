
var uiCompile = function () {
    return {
        //main function to initiate template pages
        init: function () {
            uiCompile.resizeFrame();
        },
        //调整iFrame的高度
        resizeFrame : function(height,iframeid){
            iframeid = iframeid || "mainFrame";
            height = height || "800";

            //if( window.top != window.self ){
            if(window.self.frameElement && window.self.frameElement.tagName=="IFRAME"){
                var _height = $("body").height();
                _height += 200;
                //console.log('resizeFrame',_height);
                window.parent.uiCompile.resizeFrame(_height,window.self.frameElement.id);
                return;
            }
            $('#'+ iframeid).height(height);
        }
    }
}()
jQuery(document).ready(function() {
    uiCompile.init()
    // PermissionHandler()
    //保存顶部搜索状态
    if(localStorage["cms_top_search_type"])$('#cmsSearchUser').val(localStorage["cms_top_search_type"])
    jQuery("#cmsFilterSearchUser").keypress(function(e){cmsFilterSearchUserHandler(e)});
})

function cmsFilterSearchUserHandler(event){
    if (event.keyCode == 13) {
        var param = {
            search:event.target.value
        }
        localStorage["cms_top_search_type"] = $('#cmsSearchUser').val();
        jQuery.post('/api/user/cms_search_user',param,function(rd){
            try{
                if(rd.code!=0)alert(rd.message)
                if(rd.body.type){
                    location.href = '/dashboard/admin/modules/user/user_list.html?loginname='+rd.body.type;
                }else{
                    if(!rd.body.body.group)rd.body.body.group=""
                    if(rd.body.body.group.indexOf('anchor')>-1){
                        var page = $('#cmsSearchUser').val()
                        if(page == "Edit")location.href = '/dashboard/admin/modules/user/anchor_detail.html?id='+rd.body.body._id;
                        else if(page == "Official")location.href = '/dashboard/admin/modules/user/official_anchor_detail.html?id='+rd.body.body._id;
                        else location.href = '/dashboard/admin/modules/user/anchor_punish.html?id='+rd.body.body._id;
                    }else{
                        location.href = '/dashboard/admin/modules/user/user_detail.html?id='+rd.body.body._id;
                    }
                }
            }catch(e){
                alert(e)
            }
        })
    }
}


function PermissionHandler(){
    //缓存用户权限数据
    //缓存刷新逻辑。登录时重新获取；每天更新一次；
    jQuery.get('/auth/getRolePrivilege',function(rd){
        var json;
        try{
            json = rd
        }catch(e){
            console.error(e,rd)
            json = []
        }
        var obj = {timestamp:new Date(),body:json}
        localStorage['RolePrivilege']=JSON.stringify(obj)
    })

    //获取当前界面中所有权限项。每天更新一次；
    var UI_roles = [];
    $('[data-roles]').each(function(index,item){
        // console.log(item)
        var json = $(item).data('roles').replace(/'/g,'"')
        json = JSON.parse(json)
        UI_roles.push( json)
    })
    console.log(JSON.stringify(UI_roles))
    jQuery.ajax({
        url: '/auth/getModulePrivilege',  
        type: 'POST',  
        data:  JSON.stringify(UI_roles),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',  
        success: function(data, status, xhr) {
            var json;
            try{
                json = data
            }catch(e){
                console.error(e,data)
                json = []
            }
            var obj = {timestamp:new Date(),body:json}
            localStorage['ModulePrivilege'] = JSON.stringify(obj)              
        },  
        error: function(xhr, desc, err) {    
            console.error("Details: " + desc + "\nError:" + err,xhr);
        }  
    })
    //匹配界面和数据，实现界面控制
    var UI_roles_parents = [];     
    var ModulePrivilegeJSON = localStorage['ModulePrivilege'];
    var RolePrivilegeJSON = localStorage['RolePrivilege'];
    try{
        ModulePrivilegeJSON = JSON.parse(ModulePrivilegeJSON)
    }catch(e){
        ModulePrivilegeJSON = {}
    }
    try{
        RolePrivilegeJSON = JSON.parse(RolePrivilegeJSON)
    }catch(e){
        RolePrivilegeJSON = {}
    }
    UI_roles_parents = ModulePrivilegeJSON.body || {}
    UI_roles_parents = UI_roles.concat(UI_roles_parents)        //当前页面声明的权限列表+页面上级模块权限
    $('[data-roles]').each(function(index,item){
        var json = $(item).data('roles').replace(/'/g,'"')
        json = JSON.parse(json)
        // console.log(json)
        if(!chkModulePrivilege(UI_roles_parents, json, RolePrivilegeJSON.body)){
            $(item).addClass('hidden')
        }
    })    
}

/**
 * 检查界面被控无素（及其上级）的权限声明，与 用户拥有权限比对
 * all_mod：包含当前页面模块权限及模块的所有上级的模块权限集合
 * cur_mod：当前要检查的模块权限
 * role_priv：用户拥有的权限
 */
function chkModulePrivilege(all_mod, cur_mod, role_priv){
    if(_.find(role_priv, {name:'SUPER_ADMIN'} )){
        return true     //超管
    }

    if(!_.find(role_priv, {name:cur_mod.name} ) && !_.find(role_priv, {name:cur_mod.parentname}) ){
        var parent_mod = _.find(all_mod, {name:cur_mod.parentname});
        if(parent_mod){
            var parent_parent_mod = _.find(all_mod, {name:parent_mod.parentname});
            if(_.find(role_priv, {name: parent_parent_mod.name} )){
                // console.log('level 3')
                return true;            //拥有分类级模块权限
            }
        }
    }else if(_.find(role_priv, {name:cur_mod.name} ) || _.find(role_priv, {name:cur_mod.parentname}) ){
        // console.log('level 1,2')
        return true;            //拥有模块或模块项目级权限
    }
}