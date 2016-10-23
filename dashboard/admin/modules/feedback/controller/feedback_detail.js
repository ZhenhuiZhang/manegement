framework.angular.controllers.controller("feedback_detail", ['$scope', 'commonRES',
function($scope, service) {
    if(location.search){
        service.get({
            api:'feedback',
            method:'findOne',
            id:location.search.split('=')[1]
        }, function (datas) {
            $scope.model = datas.body;
        })
    }
}])