//前端核心类库
var Framework = function(){
    this.DEBUG = false;     //false or true

    //构造函数，实例化时执行
    this.init = function(){ };

    //判断当前页面是否在iFrame中
    this.inIframe = window.self.frameElement && window.self.frameElement.tagName=="IFRAME";

    /*
     * 得到当前HOST
     */
    this.getHost = function(){
        if(this.inIframe){
            var host = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
            return host;
            // return window.parent.framework.getHost();
        } else{
            var host = location.host;
            return host;
        }
    }

    return this.init();        //实例化时执行
}
/**
 * 向当前页面发广播
 * @param notic 广播事件标识
 * @param para 广播参数
 */
Framework.prototype.boardcast = function(notic,para){
    //console.info(notic,para);
    var injector = angular.element(document).injector();
    if(injector){
        var rootScope = injector.get("$rootScope");
        //两种方式都可以
        //angular.element(document).scope().$broadcast(notic,para);
        rootScope.$broadcast(notic,para);
    }
}
Framework.prototype.getRootScope = function(){
    var injector = angular.element(document).injector();
    if(injector){
        return injector.get("$rootScope");
    }else{
        return {};
    }
}
/**
 * 向所有页面广播
 * @param notic 广播事件标识
 * @param para 广播参数
 */
Framework.prototype.boardcastToGlobal = function(notic,para){
    notic = notic.replace('https://','').replace('http://','');
    if(this.DEBUG){
        console.info("向所有页面广播（"+ notic +"） -->>");
    }

    if(this.inIframe){
        if(this.DEBUG){
            console.info("            框架内发起的广播（"+ notic +"） -->>");
        }
        if(window.parent.framework){
            window.parent.framework.boardcast(notic,para);      //主页面发广播
        }
        //所有 iframe 发广播
        for(var i=0;i<window.parent.frames.length;i++){
            if(window.parent.frames[i].framework)
                window.parent.frames[i].framework.boardcast(notic,para);
        }    
    } else {
        if(this.DEBUG){
            console.info("            主页面发起的广播（"+ notic +"） -->>");
        }

        this.boardcast(notic,para);                           //主页面发广播

        //所有 iframe 发广播
        for(var i=0;i<window.parent.frames.length;i++){
            if(window.frames[i].framework)
                window.frames[i].framework.boardcast(notic,para);
        }
    }
}

/**
 * 得到最终的URL
 * @param url_debug DEBUG时的URL
 * @param url_release release时的URL
 * @param is_debug [非必填]当前系统状态
 * @param api_path_prefix [非必填]调用API数据的前缀地址
 * @returns {*|string}
 */
Framework.prototype.getFinalURL = function(url_release,url_debug,is_debug,api_path_prefix){
    var _is_debug = is_debug != undefined ? is_debug :IS_DEBUG;
    var _api_path_prefix = api_path_prefix != undefined ? api_path_prefix : (_is_debug ? API_PATH_PREFIX_DEBUG : API_PATH_PREFIX );

    var url = _api_path_prefix;
    if(_is_debug){
        url += url_debug;
    }else{
        url += url_release;
    }

    return url;
}

/**
 * 生成弹窗
 *  $('#name').modal();显示弹窗name是参数中的name
 *  title是弹窗的标题
 *  bodys是弹窗的主体
 *  buttons是弹窗中的按钮，并且绑定函数
 *  toggle_handle，监听事件
 */
Framework.prototype.prompt = function(param) {
    var _param  = {
        name:'',
        title:'提示框',
        bodys:'',
        buttons:'',
        toggle_handle:function(){}
    }
    _param = angular.extend(_param,param);
    var text = '<div class="modal fade" id="'+_param.name+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">'+
        '<div class="modal-dialog" role="document">'+
            '<div class="modal-content">'+
                '<div class="modal-header">'+
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>'+
                    '<h4 class="modal-title" id="myModalLabel">'+_param.title+'</h4>'+
                '</div>'+
                '<div class="modal-body">';
    text += _param.bodys

    text+='</div>'+
            '<div class="modal-footer">';

    text+= _param.buttons
    text+=      '</div>'+
            '</div>'+
        '</div>'+
    '</div>';
    var modal = $(text)
    modal.appendTo('body')
    
    _param.toggle_handle()
    // $('#myModal').modal();
    return modal;
}


//实例化
var framework = new Framework();