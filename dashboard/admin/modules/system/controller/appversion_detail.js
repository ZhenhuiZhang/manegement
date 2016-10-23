framework.angular.controllers.controller("version-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = '';

        if (location.search) {
            service.get({
                api: 'appVersion',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
            });

            method = 'update'
        }else{
            $scope.model = {}
            $scope.model.download = 'https://play.google.com/store/apps/details?id=com.nono.android'
            
            $('input').removeAttr('readonly disabled');
            method = 'create'
        }
        
        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            service.save({
                api: 'appVersion',
                method: method, 
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    if(method == "update")
                        location.reload();
                    else
                        location.href = 'appversion.html';
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
        }
    }
]);