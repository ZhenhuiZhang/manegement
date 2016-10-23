//服务器端socket推送监听
// var socket = io(SOCKET_SERVER);
// socket.emit('setUserPipe',{userid:$.cookie('userid'),
//     username:$.cookie('username'),
//     token:$.cookie('token')
// }, function(result){
// //        console.log('setUserPipe',result);
// });
// socket.on('server boardcast', function(msg){
// //    console.log(msg);
// //    framework.boardcast("notic", {msg:"server message",fun:function(){console.log(msg);}} );
//     framework.boardcast("notic", msg);
// });

//END

framework.angular.controllers.controller("indexCtrl",function($scope,$rootScope){
    $rootScope.loading = false;
    $scope.notices_ = [];

    //notic广播
    $rootScope.$on("notic",function(event,para){
//        if(framework.inIframe){
//            console.info("iframe页面的收到广播("+ event.name +")");
//        }else{
//            console.info("主页面的收到广播("+ event.name +")");
//        }

//        $rootScope.$apply(para.fun);
        $rootScope.safeApply(function(){
            $scope.notices_.push(para);     //在页面中ng-repeat notices_会报错，只有用一个变量中转一下
            $scope.notices = $scope.notices_;
        });
    });
    //END

    $scope.clearNotice = function(){
        $scope.notices_ = [];
        $scope.notices = '';
    }
});





//$(function(){
//    //主菜单权限控制
//    var USERID = $.cookie('userid');
//    var USERNAME = $.cookie('username');
//    var TOKEN = $.cookie('token');
//
//    //主菜单控制
//    if(USERNAME){
//        if(USERNAME == 'administrator'){
//            //不做任何限制
//        }else{
//            $('[data-role="administrator"]').remove();      //按钮元素。删除所有的删除按钮
//            //这行代码如果放在angular
//        }
//    }
//    //END
//});