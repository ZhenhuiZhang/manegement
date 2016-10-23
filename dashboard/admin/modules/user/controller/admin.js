framework.angular.controllers.controller("admin-list", ['$scope', 'commonRES',
    function($scope, service) {
        var url = framework.getFinalURL('admin/find', 'api/admin.json');
        $scope.gridUrl = url;


        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="admin_detail.html?id='+ dataItem._id +'">Edit</a>';
            return result;
        }

        $scope.actionChange = function(){
            $scope[$scope.action]()
        }
        $scope.del = function() {
            var _data = getSelectedAllData($scope.admin_grid);
            if (confirm('您确定要删除吗？')) {
                service.del({
                    api: 'admin',
                    method: "del"
                },getSelectedIds(_data), function(project) {
                    if (project.code==0) {
                        alert('操作成功');
                        location.reload();
                    } else {
                        alert('error:' + project.message);
                    }
                })
            }
        }

        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.admin_grid);
                if (_data) {
                    location.href = 'admin_detail.html?id=' + _data._id;
                }
            });
        }

    }
]);