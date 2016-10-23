framework.angular.controllers.controller("welcomeModalCtrl",
['$scope', '$rootScope',function($scope, $rootScope) {
    
    /**
     *页面数据，回传数据
     * modal_onLoad是父controller里的虚方法（面向对象里类的概念）。
     * 在这里的实际中是父controller里调用$rootScope.modal_onLoad，在子controller里提供modal_onLoad，并写入到$rootScope中。
     * @param config 父页面传来的数据
     */
    $rootScope.modal_onLoad = function(config){
        //获取父页面传来的数据
        $scope.data = config.data;
        $scope.data.name = 'test name';
        //添加提交按钮的处理事件
        config.onSubmitForModal(function(){
            //设置返回数据            
            config.resultData = $scope.data;
            return true;
        });
    }
}
]);