framework.angular.controllers.controller("user-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = ""
        $scope.status = {
            '0':"未归还",
            '10':"已归还"
        }
        $scope.model={
            status:0
        }
        if (location.search) {
            service.get({
                api: 'user',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                    service.get({
                    api: 'borrow',
                    method: 'find',
                    user_id: $scope.model.user_id,
                }, function (datas) {
                    $scope.history=datas.body.models
                });
            });

        }

        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            console.log(params)
            service.save({
                api: 'user',
                method: "createOrUpdate", 
            }, {user:params}, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    if($scope.model._id)
                        location.reload();
                    else
                        location.href = 'user_list.html';
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
        }
    }
]);