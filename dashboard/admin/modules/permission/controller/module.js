framework.angular.controllers.controller("permission-module-list", ['$scope', 'commonRES', '$rootScope',
    function($scope, service , $rootScope) {
        var url = framework.getFinalURL('permissionModules/find','api/gift.json',false);
        $scope.gridUrl = url;

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="module_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>';
            return result;
        }
        
        $scope.actionChange = function(){
            if($scope.action) {
                return $scope[$scope.action]();
            }
        }

        $scope.scan = function(){
            service.get({
                api: 'module',
                method: 'scan'
            },function(data){
                alert('module scan success!')
            })
        }
        
        // 删除delete
        $scope.del = function() {
            var _data = getSelectedAllData($scope.grid1);
            if (_data) {
                if (confirm('您确定要删除吗？')) {
                    service.del({
                        api: 'permissionModules',
                        method: "del",
                        _id: getSelectedIds(_data)
                    }, function(project) {
                        if (true) {
                            alert('操作成功,'  );
                            location.reload();
                        } else {
                            alert('操作失败,' + project.respDesc);
                        }
                    });
                }
            }
        }

        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.gift_list_grid);
                if (_data) {
                    location.href = 'module_detail.html?_id=' + _data._id;
                }
            });
        }

    }
]);