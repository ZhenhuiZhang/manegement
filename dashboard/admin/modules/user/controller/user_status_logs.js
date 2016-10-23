framework.angular.controllers.controller("user-status-logs-list", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var url = framework.getFinalURL('userStatusLogs/find', '', '');
        $scope.gridUrl = url; 
    }
]);