framework.angular.controllers.controller("sensitive-word-list", ['$scope', 'commonRES', '$filter',
    function($scope, service, $filter) {
        var url = framework.getFinalURL('words/find', './api/demo.json')
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        
        $scope.sensitiveWord_Renderer = function(dataItem){
            return dataItem.sensitive_word.join(",");
        }
        
        
        $scope.handlebar_Renderer = function(dataItem){
            // var result = '<a class="icon-pencil" href="push_notification_detail.html?id='+ dataItem._id +'">Delete</a> ';
            var result = '<a class="delete-btn icon-pencil btn btn-link" href="sensitive_word_detail.html?id='+ dataItem._id +'">Edit</a>'
            result += '<button class="delete-btn icon-ban-circle btn btn-link" data-id=' + dataItem._id +'> Delete </button>'
            return result;
        }


        // 删除单个敏感词
        $scope.delete = function(id) {
            if (id) {
                if (confirm('Are you sure to delete?')) {
                    service.save({
                        api: 'words',
                        method: "delete",
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