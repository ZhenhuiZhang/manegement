framework.angular.controllers.controller("user-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        if (location.search) {
            service.get({
                api: 'user',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                if (!$scope.model.hidden_anchor) {
                    $scope.model.hidden_anchor = 0;
                }
                if (!$scope.model.show_in_botoom) {
                    $scope.model.show_in_botoom = 0;
                }
            });
        }
        
        $scope.save = function () {
            return false;
            if (!confirm('Are you sure to submit？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            service.save({
                api: 'user',
                method: 'update'
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    location.reload();
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
        }
        
        function addDays(theDate, days) {
            return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
        }
    }
]);