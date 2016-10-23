framework.angular.controllers.controller("gift-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('gift/find','api/gift.json',false);
        $scope.gridUrl = url +"?status={$gte:0}"; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="gift_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>';
            return result;
        }

        $scope.pic_Renderer = function(dataItem){
            var result = '<img src="'+ dataItem.pic +'" style="width:50px;" />';
            return result;
        }

        $scope.status_Renderer = function(dataItem){
            if(dataItem.status == 10) return '<span class="label label-success">enable</span>'
            else return  '<span class="label label-danger">disable</span>' 
        }

        //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
        
        $scope.live_times_Renderer = function(dataItem) {
            var times = dataItem.live_times;
            if (times == undefined) {
                return '';
            }
            if (isNaN(times)){
                return times;
            }
            return Math.floor(times / 60 / 60) + ':' + (Math.floor(times / 60) % 60 ) + ':' + times % 60
        }

        $scope.actionChange = function(){
            if($scope.action) {
                return $scope[$scope.action]();
            }
        }
        
        // 删除delete
        $scope.del = function() {
            var _data = getSelectedAllData($scope.grid1);
            if (_data) {
                if (confirm('您确定要删除吗？')) {
                    service.del({
                        api: 'user',
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

        //修改
        $scope.update = function() {
            var _data = getSelectedData($scope.gift_list_grid);
            if (_data) {
                location.href = 'update.html?id=' + _data.id;
            }
        }

        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.gift_list_grid);
                if (_data) {
                    location.href = 'gift_detail.html?id=' + _data._id;
                }
            });
        }

    }
]);