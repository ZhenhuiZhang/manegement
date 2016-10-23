framework.angular.controllers.controller("medal-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = ""
        $scope.disable = false;
        if (location.search) {
            service.get({
                api: 'medal',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
            });

            method = "update"
        }else{
            method = 'create'
        }


        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = $scope.model;
            service.save({
                api: 'medal',
                method: method, 
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    if(method == "update")
                        location.reload();
                    else
                        location.href = 'medal_list.html';
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
        }
    }
]);