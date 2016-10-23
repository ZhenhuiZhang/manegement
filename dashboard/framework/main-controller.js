//Angular部分=============================================================
angular.element(document).ready(
function() {
    // 启动Angular，并注册所有模块的controller
    angular.bootstrap(document, ['framework']);
});
//创建controllers和directives对象，以免angular启动时找不到对象，同时，便于其他页面做扩展
framework.angular = {};
framework.angular.app = angular.module("framework",['framework.services','framework.controllers','framework.directives']);
framework.angular.services = angular.module("framework.services",['ngResource']);
framework.angular.directives = angular.module("framework.directives",[]);
framework.angular.controllers = angular.module("framework.controllers",['framework.services']).run(['$rootScope',function($rootScope){
    $rootScope.loading = true;      //初始化时，设置显示loading
    /**
     * 安全$Apply方法
     * @param fn
     */
    $rootScope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };
}])
.config(['$httpProvider','$provide',function ($httpProvider,$provide){
    //拦截post请求，将request payload 转成 formdata 的提交形式
    $httpProvider.defaults.headers.post = {'Content-Type':'application/x-www-form-urlencoded'};

    $httpProvider.responseInterceptors.push('securityInterceptor');
    $httpProvider.responseInterceptors.push('myHttpInterceptor');

    // $httpProvider.interceptors.push(function($q) {
    //     return {
    //         request: function(config){ 
    //             console.log('request');
    //             return config; },
    //         response: function(response) { 
    //             console.log('response',response.status);
    //             return $q.reject(response); }
    //     };
    // });
    

    //用于设置controllerName
    $provide.decorator('$controller', [
        '$delegate',
        function ($delegate) {
            return function(constructor, locals) {
                if (typeof constructor == "string") {
                    locals.$scope.controllerName =  constructor;
                }
                return $delegate(constructor, locals);
            }
        }]);
    //END
}])
.factory('myHttpInterceptor',['$q','$window','$rootScope', function ($q, $window, $rootScope) {
    return function (promise){
        $rootScope.loading = true;
        return promise.then(function (response) {
            $rootScope.loading = false;
            return response;
        }, function (response) {
            $rootScope.loading = false;
            $rootScope.network_error = true;
            return $q.reject(response);
        });
    };
}])
.provider('securityInterceptor', function() {
    this.$get = function($location, $q) {
      return function(promise) {
        return promise.then(null, function(response) {
          if(response.status === 401) {
            if(confirm('请先登录，是否立即跳转进行登录？')){
                window.parent.location.href=LOGIN_PAGE+'?redirect='+window.location.href;
            }
          }else if(response.status === 403){
              // 这里处理没有权限时的逻辑
          }
          return $q.reject(response);
        });
      };
    };
  });
;
//----------------------------------------------------------------------------------------------------

//function mainCtrl($rootScope,$scope){
framework.angular.controllers.controller("mainCtrl",['$scope','$rootScope','$http',function($scope,$rootScope,$http){
    $scope.MODULE_PATH = "/admin/admin/modules/";

    /**
     *  打开模态窗口。对boardcastToGlobal("openModal", para)的封装
     * @param event 广播名称
     * @param para 参数
     */
    $rootScope.openModal = function(para){
        framework.boardcastToGlobal("openModal", para);
    }

    $rootScope.$on("ngGridKendoui_onComplete",function(event,para){
        try{
            // console.log("ngGridKendoui_onComplete");
            uiCompile.init();                //Grid加载完后，渲染UI组件
            //uiCompile.resizeFrame();        //TODO: 这里依赖于uiCompile类，对本js文件造成了污染
        }catch(e){}
    })
    
    //检查用户登录状态
    $rootScope.adminObj = $.cookie('admin');
    if(!$rootScope.adminObj){
        // console.log('login error',$.cookie('adminid'),$.cookie('adminname'))
        location.href = LOGIN_PAGE;
    }
    $rootScope.adminObj = JSON.parse($rootScope.adminObj);
    $rootScope.USERID = $rootScope.adminObj.adminid;
    $rootScope.USERNAME = $rootScope.adminObj.adminname;
    $rootScope.GROUP = $rootScope.adminObj.admingroup;
    $http({method: 'POST', url: '/auth/chkToken',data:{}})
    .success(function(data, status, headers, config) {
        if(data.code != 0){
            // console.error(data)
            location.href = LOGIN_PAGE
        }
        // PermissionHandler()
    })
    .error(function(data, status, headers, config) {
        // console.error('error',data)
        location.href = LOGIN_PAGE;
    })

    /**
     * Service请求服务器端异常处理公共函数
     * @param err
     */
    $rootScope.serviceSubmitError = function (err) {
        alert('服务器端返回错误，提交失败。' +( IS_DEBUG ? err :'' )  );
        $rootScope.loading = false;      //返回数据，关闭显示loading
    }
}]);

framework.angular.controllers.controller("endCtrlForIframe",['$scope','$rootScope',function($scope,$rootScope){
    var url = window.location.href.replace('https://','').replace('http://','');
    if(framework.inIframe){
		//这部分代码比较旧了，优化的话，考虑改为PostMessage        @LinWenLong on 201511
        console.info("注册广播（modal-init):", url);
        //当本页面加载完成后，监听调用页面的广播，接收发来的数据。
        $rootScope.$on("modal-init:"+url,function(event,para){
            if(framework.DEBUG){
                console.log("iframe 收到广播",para);
            }
            if($rootScope.modal_onLoad){
                $rootScope.modal_onLoad(para);
            }
        });

        //框架页面加载完成后，发送广播。这是实现框架之间通讯的关键一步。
        //console.log("endCtrlForIframe 发广播 iframePageLoaded:"+url);
        framework.boardcastToGlobal("iframePageLoaded:"+url, {});
        //END
    }
}])