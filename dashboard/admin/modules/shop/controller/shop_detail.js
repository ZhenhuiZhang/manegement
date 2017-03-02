framework.angular.controllers.controller("shop-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = ""



        if (location.search) {
            service.get({
                api: 'shop',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                $("#pic").attr("src",$scope.model.pic)
            });
        }


        $('[name="pic"]').on("change",function(e){
            var files = this.files;
            var img = new Image();
            var reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = function(e){
                var mb = (e.total/1024)/1024;
                if(mb>= 2){
                    alert('文件大小大于2M');
                    return;
                }
                $scope.pic=this.result
                $("#pic").attr("src",$scope.pic)
            }
        })

        $scope.save = function () {
            if (!confirm('确定提交?？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            params.pic = encodeURIComponent($scope.pic)
            service.save({
                api: 'shop',
                method: "createOrUpdate", 
            }, {shop:params}, function (result) {
                console.log(params)
                if (result.code == 0) {
                    alert('提交成功!');
                    if($scope.model._id)
                        location.reload();
                    else
                        location.href = 'shop_list.html';
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
        }
    }
]);