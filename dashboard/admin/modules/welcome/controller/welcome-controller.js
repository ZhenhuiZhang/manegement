framework.angular.controllers.controller("welcomeCtrl",
['$scope', '$rootScope', 'commonRES',function($scope, $rootScope, service) {

    //读取一些公共信息，存入localStoreage，便于后续处理
    service.get({
        api:'gift',
        method:'find'
    }, function (datas) {
        console.log(datas)
        if(datas.code==0){
            localStorage['gift_models']= JSON.stringify(datas.body.models);
        }
    })
    //END

}])