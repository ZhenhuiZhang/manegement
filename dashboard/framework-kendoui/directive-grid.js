/**
 * 对 Kendoui 的Angular封装。依赖Angular、LAB、md5，即当前的页面中，Angular、LAB等类库必须已被引入。
 * 另外，还依赖于 framework.angular.directives 的定义
 */
(function(jQuery) {
    var IS_MOBILE = window.screen.width < 800;
    var SECRET_KEY_ = API_SECRET_KEY || '';
    
    var _hide_header_col = false;
    
    //根据参数生成签名
    //paras type is string
    var CreateSign = function(paras_str,pageinfo){
        var token = '';
        var url_query = '';
                
        if(pageinfo){
            paras_str += (paras_str.indexOf('?')==-1 ? '?' :'&') + 'page='+ pageinfo.page + "&limit="+ pageinfo.limit;
        }
        if(paras_str.indexOf('?')!=-1){
            paras_str = paras_str.split('?')[1];
        }
        var paras = {};
        var paras_str_arr = paras_str.split('&');
        for(var i in paras_str_arr){
            var tmp = paras_str_arr[i].split('=');
            paras[tmp[0]] = tmp[1];
        }
        
        if(paras){
            var token_arr = [];
            for(var i in paras){
                url_query += '&'+ i +'='+ paras[i];
                token_arr.push(i);
            }
            token_arr.sort();
            token_arr.forEach(function(item){
                token += paras[item];
            });
        }
        token = md5(SECRET_KEY_ + token);
        
        return token;
    }
    window.__Renderer_helper = function(data,method,scopeId){
        scopeId = scopeId || 'demoGrid'
        method = method || 'handlebar'
        return angular.element('#'+ scopeId).scope()[method+'_Renderer'](data)
    }    
    
    
    //默认配置参数
    var config = {
        path:""       //组件路径
        ,selector:""
        ,dataAdapter:""
        ,culture:"en"
        ,autoCloseLoading:true
        ,timezone: window.localStorage.getItem('timezone') || jstz.determine().name()
        ,loadUrl:function(url){
            this.dataAdapter.transport = {
                read : url,
                parameterMap : function(options, operation) {
                    console.log(operation)
                    if (operation == "read") {
                        var parameter = {
                            page : options.page,
                            limit : options.pageSize
                        }
                        // var sign = CreateSign(url,parameter);
                        // parameter.sign = sign;
                        config.pageChange(options.page, options.pageSize);
                        return parameter;
                    }
                }
            };
            this.dataAdapter.page = 0;
            var grid = this.selector.data("kendoGrid");
            var dataSource = new kendo.data.DataSource(this.dataAdapter);
            grid.setDataSource(dataSource);
        },
        reload:function(){
            var grid = this.selector.data("kendoGrid");
            var dataSource = new kendo.data.DataSource(this.dataAdapter);
            grid.setDataSource(dataSource);
        },
        getSelectedRowData:function(_index){
            var grid = this.selector.data("kendoGrid");
            var selectedRows = grid.select();
            var selectedItem;
            for (var i = 0; i < selectedRows.length; i++) {
                selectedItem = grid.dataItem(selectedRows[i]);
                break;
            }
            return selectedItem;
        },
        getSelectedAllRowData:function(_index){
            var grid = this.selector.data("kendoGrid");
            var selectedRows = grid.select();
            var selectedItem=[];
            for (var i = 0; i < selectedRows.length; i++) {
                selectedItem.push(grid.dataItem(selectedRows[i]));
            }
            return selectedItem;
        },
        dbclick:function(fun){
            $("#"+this.id).on("dblclick", ".k-grid-content tr", function (event){
                fun(event);
            });
        },
        search:function(baseurl){
            var _oldurl = baseurl || config.attr.url;
            baseurl = baseurl || config.attr.url;
            var _urlParam = '';
            if(baseurl.indexOf('?') != -1){
                baseurl = _oldurl.split('?')[0];
                _urlParam = _oldurl.split('?')[1];
            }
                        //将querystring装换为JSON对象。即：a=1&b=2 => {a:1,b:2}
            var urlParamObject = {};
            for(var urlParamArray = _urlParam.split('&'), i=0; i<urlParamArray.length; i++){
                if(urlParamArray[i].split('=').length == 2){
                    urlParamObject[urlParamArray[i].split('=')[0]] = urlParamArray[i].split('=')[1];
                }
            }
            
            var searchObject = angular.element(".J_toolbar :input","#"+ this.id).serializeObject();
            for(key in searchObject) {
                if($('[name='+key+']').data('type') == 'date'){
                    searchObject[key] = searchObject[key]? moment.tz(searchObject[key],config.timezone).utc().format(): searchObject[key]
                }
            }
            for(key in urlParamObject) {
                if(!searchObject[key] && urlParamObject[key]){
                    searchObject[key] = urlParamObject[key];
                }
            }
            var url = baseurl ;
            if (Object.getOwnPropertyNames(searchObject).length > 0){
                url += '?';
                for(key in searchObject) {
                    url += key + '=' + searchObject[key] + '&';
                }
            }
            this.loadUrl(url);
            
            //兼容手机屏幕的逻辑 by Owen.Lin on 20160514
            if(IS_MOBILE){    
                $('.k-grid-header').hide();     //隐藏grid-header
                $('.k-grid-content colgroup').html('<col style="width:30%"></col><col style="width:70%"></col>');
            }
            else if(_hide_header_col)
                // $('.k-grid-header').remove()
                $('.k-grid-content colgroup').remove()
            //END

            var cookies_json = {};
            angular.element(".J_toolbar :input","#"+ this.id).each(function(){
                var model = $(this).attr('ng-model');
                if(!model){return;}
                cookies_json[model] = $(this).val();
            });
            //this.id是Grid的id，如果担心不同页面的cookie互相影响，应保证每个页面里的Grid的ID命名不同。
//            $.cookie('search_'+ this.id, JSON.stringify(cookies_json));           //依赖$.cookie插件.
            localStorage['search_'+ this.id] = JSON.stringify(cookies_json);        //只有在页面初始化完成后，才能使用this.id方法，否则使用config.attr.id
        },
        clearSearch:function(){
//            $.removeCookie('search_'+ this.id);                       //依赖$.cookie插件
            localStorage.removeItem('search_'+ this.id);                //只有在页面初始化完成后，才能使用this.id方法
            location.reload();                                          //简单的刷新页面，用于获取新的数据
        },
        pageChange:function(page, limit){
            var cookies_json = localStorage['search_'+ config.attr.id];
            cookies_json = cookies_json ? JSON.parse(cookies_json) : {} ;
            cookies_json.page = page;
            cookies_json.limit = parseInt(limit);
            localStorage['search_'+ config.attr.id] = JSON.stringify(cookies_json);
//            console.log('pageChange cookie',cookies_json);
        },
        initSearch : function(scope, baseurl){
            var _oldurl = baseurl;
            baseurl = baseurl || config.attr.url;
            var url_par_='';
            if(!baseurl){
                return;
            } else if(baseurl.indexOf('?') != -1){
                url_par_ = baseurl.split('?')[1];
                baseurl = baseurl.split('?')[0];
            }

            //将querystring装换为JSON对象。即：a=1&b=2 => {a:1,b:2}
            var url_par_kv_ = {};
            for(var url_par_arr_ = url_par_.split('&'), i=0; i<url_par_arr_.length; i++){
                url_par_kv_[url_par_arr_[i].split('=')[0]] = url_par_arr_[i].split('=')[1];
            }
            //END

            var search = [];
            var cookies_json = localStorage['search_'+ config.attr.id];
            if(cookies_json){
                cookies_json = JSON.parse(cookies_json);
                
                //显示搜索框里的值
                for(var k in cookies_json){
                    var model = cookies_json[k];
                    if(!model || k.indexOf('__') == 0 ){continue;}
                    //判断querystring与localStrage是否冲突
                    if(url_par_kv_[k]){
                        //当querystring与localStrage参数冲突时，使用querystring参数覆盖localStrage参数
                        scope[k] =  url_par_kv_[k];
                        delete url_par_kv_[k];
                    }else{
                        scope[k] =  model;
                    }
                    if(k == 'page' || k == 'limit'){continue;}
                    if(k == 'date_start' || k == 'date_end'){
                        model = moment.tz(model,config.timezone).utc().format()
                    }
                    search.push(k+'='+model);
                }

                //检查querystring/JSON对象，覆盖原querystring
                url_par_ = '';
                for(var k in url_par_kv_){
                    if(!k)continue;
                    url_par_ += url_par_ ? '&'+ k +'='+ url_par_kv_[k] : k +'='+ url_par_kv_[k] ;
                }
                //END

                //将搜索条件应用到grid
                baseurl += "?" + search.join('&') + ( url_par_ && url_par_.length ? '&'+ url_par_ : '');
            }else{
                baseurl = _oldurl;
                cookies_json = {page:0,limit:0};
            }
            if(baseurl.substr(-1)=='?'){
                baseurl=baseurl.replace('?','');
            }
            cookies_json.__search = baseurl;
            return cookies_json;
        }
    };

    //获取当前组件路径
    var filenameAndPath = "/directive-grid.js";    //当前文件名及上一级路径，必须与这里的变量相同
    config.path = $("script[src$='"+ filenameAndPath +"']").attr("src").replace(filenameAndPath,"");
    //========================================================================================================

    framework.angular.directives.directive("ngGridKendoui", ['$window','$parse','$rootScope','$compile',function (win,$parse,$rootScope,$compile) {
        return {
            restrict: 'A',
            controller:function($scope, $element, $attrs){
                // 加载组件相关资源。  controller 是在link之前执行的，在这里加载CSS，可以更快的呈现内容
                var jqx_base_css =config.path + "/kendoui/styles/kendo.common.min.css";
                var jqx_bootstrap_css = config.path + "/kendoui/styles/kendo.default.min.css";
                if ($("link[href='"+jqx_base_css+"']").length==0){
                    var styleTag = document.createElement("link");
                    styleTag.setAttribute('type', 'text/css');
                    styleTag.setAttribute('rel', 'stylesheet');
                    styleTag.setAttribute('href', jqx_base_css);
                    $("head")[0].appendChild(styleTag);
                    styleTag = document.createElement("link");
                    styleTag.setAttribute('type', 'text/css');
                    styleTag.setAttribute('rel', 'stylesheet');
                    styleTag.setAttribute('href', jqx_bootstrap_css);
                    styleTag.setAttribute('media', 'screen');
                    $("head")[0].appendChild(styleTag);
                }
                //END
            },
            link: function (scope, element, attr){
                var _config = $.extend(config,_config);

                //处理当前组件的配置参数
                var options = "{"+ attr.ngGridKendoui.replace(/'/g,"\"") +"}";
                options = $.parseJSON(options);
                options.datafields = {};
                options.columns = [];
                
                //垂直布局模板，用于兼容手机版
                _config.columns_mobile = [];
                //自定义循环模板
                _config.rowTemplate = null;
                //自定义纵向循环模板
                _config.rowTemplateForMobile = null;

                _config.autoCloseLoading = options.autoCloseLoading != undefined ? options.autoCloseLoading : _config.autoCloseLoading;
                _config = $.extend(options, _config);
                _config = $.extend(attr, _config);          //TODO: 这两个extend操作的先后顺序，还要再考虑下
                config.attr = $.extend(attr, {});           //将HTML的属性扩展给config，为使内部方法方便引用

                if(element.find("tbody")){
                    element.find("tbody th").each(function(index,ele){
                        var _row = { fieldname:"",fieldtype:"",title:"",width:null };
                        var columns_row = { field:'',title:'',template:null };
                        var sort = {};

                        if($(ele).data("option")){
                            var td_option = "{"+ $(ele).data("option").replace(/'/g,"\"") +"}";
                            td_option = $.parseJSON(td_option);
                            _row.fieldname = td_option.fieldName || td_option.fieldname || "";
                            _row.fieldtype = td_option.fieldType || td_option.fieldtype || "";
                            _row.width = td_option.width || "";
                            _row.template = td_option.template || null;
                            _row.format = td_option.format || null;

                            //_config.datafields[td_option.fieldName] = {type: td_option.fieldType || ""};
                        }else{
                            _row.fieldname = $(ele).data("fieldName") || $(ele).data("fieldname") || "";
                            _row.fieldtype = $(ele).data("fieldType") || $(ele).data("fieldtype") || "";
                            _row.width = $(ele).data("width") || "";
                            _row.template = $(ele).data("template") || null;
                            _row.format = $(ele).data("format") || null;

                            //_config.datafields[_fieldname] = {type: _fieldtype};
                        }
                        if(_row.template && (_row.template.indexOf("\\\"") || _row.template.indexOf("\\\'")) ) {
                            _row.template = _row.template.replace(/\\\"/g,"'").replace(/\\\'/g,"'");
                        }
                        _config.datafields[_row.fieldname] = {type: _row.fieldtype};

                        columns_row.field = _row.fieldname;
                        columns_row.title = $(ele).text() || _row.fieldname;
                        columns_row.width = $(ele).data("width") || "";
                        columns_row.format = _row.format;

                        //根据选择的时区设置时间 @jinrong 20160918
                        if(_row.fieldtype == 'date'){
                            columns_row.template = function(item){
                                var result = item[_row.fieldname] ? moment(item[_row.fieldname]).tz(config.timezone).format('YYYY-MM-DD HH:mm:ss') : ''
                                return result;
                            }
                        }
//                        if(_row.width){ columns_row.width = _row.width; }

                        /*
                        支持三种data-renderer方法，分别是：
                        1、data-renderer="count_Renderer"，即 使用JS函数
                        2、data-renderer="function count_Renderer(dataItem){}"，即 直接内嵌函数
                        3、data-renderer="scope.count_Renderer"，即 使用angular controller函数
                         */
                        var fun_name = 'scope.'+_row.fieldname +"_Renderer";
                        if($(ele).data("renderer")){ //自定义字段；从HTML模板中读取Renderer函数
                            //renderer方法必须使用 字段名+Renderer 的命名形式
                            var renderer;
                            if($(ele).data("renderer").indexOf('function ')!=-1){
                                renderer = eval($(ele).data("renderer"));               //得到函数体，并从字符串创建函数
                                fun_name = _row.fieldname +"Renderer";
                            }else if(typeof eval($(ele).data("renderer")) == 'function'){
                                fun_name = $(ele).data("renderer");
                            }
                            try{
                                columns_row.template = eval(fun_name);              //调用函数
                            }catch(e){}
                        }else if(typeof eval(fun_name) == 'function'){              //从angular中读取Renderer函数，即支持不在HTML中定义，而直接在angular的controller中预设函数被调用
                            try{
                                columns_row.template = eval(fun_name);              //调用函数
                            }catch(e){}
                        }
                        _config.columns.push(columns_row);
                        //_config.datafields.push(datafields_row);
                        

                        //构造模板，为了兼容手机版式。   
                        if(IS_MOBILE && $(ele).data("showinmobile")!='0' && !element.find("tbody.rowTemplateForMobile").length){
                            var style_tmp = '';
                            if( index==element.find("tbody th").length-1 )
                                style_tmp = "style='border-bottom:1px black solid;'";
                            var row_ = '<tr class="mobiletr"><th '+ style_tmp +'>'+ columns_row.title +'</th><td '+ style_tmp +'>#';
                            if(columns_row.format)
                                row_ += '=kendo.format("'+ columns_row.format +'", '+ _row.fieldname +')'
                            //纵向显示时，暂时仅支持从angular中读取Renderer方法   @linwl on 20160514
                            else if(angular.element('#'+ _config.id).scope()[_row.fieldname +"_Renderer"])
                                row_ += '=__Renderer_helper(data,\''+ _row.fieldname +'\',\''+ _config.id +'\')'
                            else                                                          
                                row_ += ':'+ _row.fieldname
                            row_ += '#</td></tr>'
                            
                            _config.columns_mobile.push(row_);
                        }
                        //END
                    })
                }

                var _initSearch = config.initSearch(scope, _config.url);

                _config.url = _initSearch && _initSearch.__search ? _initSearch.__search : _config.url;
                if(_config.url){
                    // var url = _config.url.split("?")[1].split("&")
                    _config.dataAdapter = {
                        transport : {
                               read : _config.url,
                               parameterMap : function(options, operation) {
                                   console.log(options)
                                if (operation == "read") {
                                    var parameter = {
                                        page : options.page,
                                        limit : options.pageSize
                                    };
                                    // var sign = CreateSign(_config.url,parameter);
                                    // parameter.sign = sign;
                                    config.pageChange(options.page, options.pageSize);
                                    return parameter;
                                }
                            }
                        },
                        type: "json",
                        schema: {
                            total: _config.schema_total || "body.totalRows",
                            data: _config.schema_data || "body.models",
                            model: { fields: _config.datafields }
                        },
                        sort: _config.sort,
                        page: _initSearch.page || 1,         //从当前环境读取分页参数
                        pageSize: _config.limit || null,
                        serverPaging: true,
                        serverFiltering: false,
                        serverSorting: false
                    };
                }else if(_config.data){
                    _config.dataAdapter = _config.data;
                }
                if(attr.ngData){      //动态绑定scope中的本地数据源
                     _config.dataAdapter = scope[attr.ngData] || {} ;
                }

                //加载必须的类库，并执行
                $LAB.script(_config.path + "/kendoui/js/kendo.web.min.js").wait()
                .script(_config.path + "/kendoui/js/cultures/kendo.culture."+_config.culture+".min.js")
                .wait(function(){
                    //支持从html定义循环模板  @linwl on 20160514
                    if(element.find("tbody.rowTemplate").length){
                        _config.rowTemplate = kendo.template(element.find(".rowTemplate").html());
                        element.remove("tbody.rowTemplate");
                        _hide_header_col = true;
                    }
                    if(element.find("tbody.rowTemplateForMobile").length){
                        _config.rowTemplateForMobile = kendo.template(element.find(".rowTemplateForMobile").html());
                        element.remove("tbody.rowTemplateForMobile");
                    }
                    if(_config.columns_mobile.length){
                        _config.rowTemplateForMobile = kendo.template( _config.columns_mobile.join('') )
                        _config.columns_mobile = null
                    }
                    // console.log(_config.pageable)
                    // if(_config.pageable.indexOf('{')!=-1)
                    // {
                    //     try{
                    //         _config.pageable = JSON.parse(_config.pageable)
                    //     }catch(e){}
                    // }
                    // console.info(_config);
                    var grid_source = {
                        culture: _config.culture || "zh-CN",
                        dataSource: _config.dataAdapter,
                        height: _config.height,
                        editable: (_config.editable && _config.editable =='true') ? true: false,
                        filterable: (_config.filterable && _config.filterable !='true') ? false: kendo.cultures[_config.culture].filterable ||true,
                        sortable: (_config.sortable && _config.sortable !='true') ? false: true,
                        pageable:  _config.pageable ? _config.pageable : {refresh: false, pageSizes:[15,50,100]},
                        resizable: (_config.resizable && _config.resizable !='true') ? false: true,
                        scrollable: (_config.scrollable && _config.scrollable !='true') ? false: true,
                        columns: _config.columns,
                        columnResizeHandleWidth: 6,
                        selectable: _config.selectable || "row",//Grid单选或者多选
                        dataBinding: function(e) {
                            $rootScope.$broadcast("ngGridKendoui_onDataBinding_"+ _config.id,null);
                        },
                        dataBound: function(e) {
                            //当Grid编译完成后，发送广播
                            $rootScope.$broadcast("ngGridKendoui_onComplete",_config.id);
                            $rootScope.$broadcast("ngGridKendoui_onComplete_"+ _config.id,null);

                            if(_config.onComplete){       //HTML属性方式传入   优先级最高
                                scope[_config.onComplete](_config);
                            }else if(scope.onComplete){                //重载方式调用
                                scope.onComplete(_config);
                            }

                            if(_config.autoCloseLoading){         //loading控制
                                $rootScope.safeApply(function() {
                                    $rootScope.loading = false;
                                });
                            }
                        },
                        rowTemplate: IS_MOBILE ? _config.rowTemplateForMobile : _config.rowTemplate
                        // rowTemplate: IS_MOBILE ? kendo.template( _config.columns_mobile.join('') ) : _config.rowTemplate 
                        // rowTemplate: $('#mobileTemplate').length? kendo.template($("#mobileTemplate").html()) : null
                    };

                    var _thead,_tfoot;
                    if(element.find("thead").length){
                        _thead = element.find("thead td").html();
                        _thead = $('<div class="toolbar J_toolbar"></div>').append(_thead);
                        _thead = $('<div class="k-toolbar k-grid-toolbar J_k-grid-toolbar-box"></div>').append(_thead);
                    }
                    if(element.find("tfoot").length){
                        _tfoot = element.find("tfoot td").clone().html();
                        _tfoot = $('<div class="statusbar"></div>').append(_tfoot);
                        _tfoot = $('<div class="k-toolbar k-grid-toolbar J_k-grid-toolbar-box"></div>').append(_tfoot);
                    }

                    element = element.wrap('<div class="ngGridkendo" id="'+ _config.id +'"></div>').parent().html("<div></div>");       //替换掉当前元素
                    _config.selector = element.find("div");
                    _config.selector.kendoGrid(grid_source);    //调用组件的编译方法
                    scope[_config.id] = _config;                 //在当前scope中创建Grid对象，并传入这个Grid的配置参数

                    //模拟初始化事件
                    var initialized = function () {
                        //当Grid编译完成后，发送广播
                        $rootScope.$broadcast("ngGridKendoui_initialized",_config);

                        if(_config.oninitialized){       //HTML属性方式传入   优先级最高
                            scope[_config.oninitialized](_config);
                        }else if(scope.onInitialized){                //重载方式调用
                            scope.onInitialized(_config);
                        }

                        $("#"+ _config.id).find(".k-grid-content").css("min-height",60);        //数据区域的最小高度
                        if(_thead){
                            $compile(_thead)(scope);
                            angular.element("#"+ _config.id).find(".k-grid-header").before(_thead);            //添加thead工具栏
                                
                            //绑定搜索事件
                            if( angular.element("#"+ _config.id).find("[ng-click='search()']") || angular.element("#"+ _config.id).find('[ng-click="search()"')){
                                scope.search = function(){
                                    _config.search(_config.url);
                                };
                                if(typeof scope['clearSearch'] != 'function') {     //实现支持controller中覆盖
                                    scope.clearSearch = function(){
                                        _config.clearSearch(_config.url);
                                    };
                                }
                            }
                            if( angular.element("#"+ _config.id).find("[ng-keydown='searchOnkeydown($event)']") || angular.element("#"+ _config.id).find('[ng-keydown="searchOnkeydown($event)"')) {
                                scope.searchOnkeydown = function ($event) {
                                    if ($event.keyCode != 13) { return; }
                                    _config.search(_config.url)
                                };
                            }
                            //END
                        }
                        if(_tfoot){
                            $compile(_tfoot)(scope);
                            $("#"+ _config.id).find(".k-grid-content").after(_tfoot);           //添加tbood工具栏
                        }

                        if(_config.oninitialized){       //HTML属性方式传入   优先级最高
                            scope[_config.oninitialized](_config);
                        }else if(scope.onInitialized){                //重载方式调用
                            scope.onInitialized(_config);
                        }
                        
                        //兼容手机屏幕的逻辑 by Owen.Lin on 20151207
                        if(IS_MOBILE){    
                            $('.k-grid-header').hide();     //隐藏grid-header
                            $('.k-grid-content colgroup').html('<col style="width:30%"></col><col style="width:70%"></col>');
                        }
                        else if(_hide_header_col)
                            // $('.k-grid-header').remove()
                            $('.k-grid-content colgroup').remove()
                        //END
                    };
                    initialized();

                    //监视数据源的变化，重新加载Grid。必须放在_config.selector后面。
                    //特别注意：这里的数据格式与列表不同，应该直接传入数据的数组
                    if(attr.ngData){
                        var watchGrid_ = function(newData){
                            if(newData && newData.data){
                                if(!newData.sort){
                                    newData.sort = _config.sort;
                                }
                                if(!newData.pageSize){
                                    newData.pageSize = null;
                                }
                                _config.dataAdapter = newData;
                            }
                            else{
                                _config.dataAdapter = {data:newData,
                                    sort: _config.sort,
                                    pageSize: null
                                };
                            }

                            var grid = _config.selector.data("kendoGrid");
                            console.log(_config.selector)
                            var dataSource = new kendo.data.DataSource(_config.dataAdapter);
                            grid.setDataSource(dataSource);
                        };
                        watchGrid_(scope[attr.ngData]);     //直接应用数据，用于应用在本插件还没有载入（执行），上层controller已经apply数据的情况
                        scope.$watch(attr.ngData, function(newData, oldData) {      //这里监听本插件载入后apply数据的情况
                            watchGrid_(newData);
                        });
                    }
                });
            }
        }
    }]);
})(jQuery);