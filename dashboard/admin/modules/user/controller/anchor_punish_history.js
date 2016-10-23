framework.angular.controllers.controller("anchor-punish-history", ['$scope', 'commonRES',
    function($scope, service) {

        var url = framework.getFinalURL('userStatusLogs/findUser?_id='+location.search.split('=')[1],'');
        $scope.gridUrl = url; 
        
    }
])