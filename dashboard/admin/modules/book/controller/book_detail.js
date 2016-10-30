framework.angular.controllers.controller("book-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = ""



        if (location.search) {
            service.get({
                api: 'book',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
            });
        }

        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            params.pic = encodeURIComponent(params.pic)
            console.log(params)
            service.save({
                api: 'book',
                method: "createOrUpdate", 
            }, {book:params}, function (result) {
                console.log(params)
                if (result.code == 0) {
                    alert('submit ok');
                    if($scope.model._id)
                        location.reload();
                    else
                        location.href = 'book_list.html';
                } else {
                    console.log(result.message);
                }
                $rootScope.loading = false;
            });
        }
    }
]);