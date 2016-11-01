framework.angular.controllers.controller("borrow-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = ""
        $scope.model={
            status:0
        }
        if (location.search) {
            service.get({
                api: 'borrow',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
            });
        }

        $scope.bookChange = function($event){
            service.get({
                api: 'book',
                method: 'findOne',
                number: $($event.target).val()
            }, function (datas) {
                if(!datas.body){
                    $($event.target).parents().siblings(".alert").show()
                    $($event.target).parents().siblings(".alert").text("该编号的图书不存在！")
                }else{
                    $scope.model.name=datas.body.name
                    $($event.target).parents().siblings(".alert").hide()
                }
            });
        }

        $scope.userChange = function($event){
            service.get({
                    api: 'user',
                    method: 'findOne',
                    user_id: $($event.target).val()
                }, function (datas) {
                    if(!datas.body){
                        $($event.target).parents().siblings(".alert").show()
                        $($event.target).parents().siblings(".alert").text("学生不存在！")
                    }else{
                        $($event.target).parents().siblings(".alert").hide()
                    }
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
                api: 'borrow',
                method: "createOrUpdate", 
            }, {borrow:params}, function (result) {
                console.log(params)
                if (result.code == 0) {
                    alert('submit ok');
                    if($scope.model._id)
                        location.reload();
                    else
                        location.href = 'borrow_list.html';
                } else {
                    alert(result.message)
                }
                $rootScope.loading = false;
            });
        }
    }
]);