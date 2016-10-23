framework.angular.controllers.controller("pay_items_detail", ['$scope', 'commonRES',
function($scope, service) {
    if(location.search){
        service.get({
            api:'payItem',
            method:'findOne',
            id:location.search.split('=')[1]
        }, function (datas) {
            $scope.model = datas.body;
        })
    }
}])