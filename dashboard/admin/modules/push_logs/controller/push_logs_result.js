framework.angular.controllers.controller("push-logs-result", ['$scope', 'commonRES','$filter', '$rootScope',
function($scope, service, $filter, $rootScope) {

    if (location.search) {
        var _id = location.search.split('=')[1]
        var url = framework.getFinalURL('pushLogs/getResult');
        $scope.gridUrl = url+'?_id=' + _id;
        $scope._id = _id
    }
}])