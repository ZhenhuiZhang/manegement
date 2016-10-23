framework.angular.controllers.controller("medal-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('medal/list','',false);
        $scope.gridUrl = url

        $scope.pic_Renderer = function(dataItem){
            var result = '<img src="'+ dataItem.pic +'" style="width:50px;" />';
            return result;
        }

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="medal_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>&nbsp';
            result += '<a href="#" class="delete-btn icon-ban-circle" data-id=' + dataItem._id +'>Delete</a>';
            return result;
        }
        
        // 删除单个敏感词
        $scope.delete = function(id) {
            if (id) {
                if (confirm('Are you sure to delete?')) {
                    service.save({
                        api: 'medal',
                        method: "remove",
                    },{_id:id}, function(result) {
                        if (result.code == 0) {
                            alert('delete ok,'  );
                            location.reload();
                        } else {
                            alert('delete fail,' + result.respDesc);
                        }
                    });
                }
            }
            return false;
        }


        $scope.onComplete = function (config) {
            $('.delete-btn').on('click',function(){
                var id=$(this).attr("data-id");
                $scope.delete(id);
            })
        }

    }
]);