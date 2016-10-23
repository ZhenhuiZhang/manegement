framework.angular.controllers.controller("app-version", ['$scope', 'commonRES',
    function($scope, service) {
        var url = framework.getFinalURL('appVersion/find', 'api/appVersion.json');
        $scope.gridUrl = url;

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="appversion_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>';
            return result;
        }

        $scope.enable_Renderer = function(dataItem){
            var result = ''
            if(dataItem.enable == 1){
                result = '<span class="label label-success">enable</span>';
            }else{
                result = '<span class="label label-danger">disable</span>';
            }
            return result;
        }

        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.app_version_grid);
                if (_data) {
                    location.href = 'appversion_detail.html?id=' + _data._id;
                }
            });
        }
    }
])