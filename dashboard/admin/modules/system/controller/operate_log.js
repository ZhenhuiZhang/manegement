framework.angular.controllers.controller("operate_log_list", ['$scope', 'commonRES',
    function($scope, service) {
        var url = framework.getFinalURL('operateLog/find', 'api/operate_log.json');
        $scope.gridUrl = url;
    }
])