framework.angular.controllers.controller("banner-list", ['$scope', 'commonRES', '$filter',
    function($scope, service, $filter) {
        var url = framework.getFinalURL('banner/find', 'api/user.json');
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911


        var weeks = ['Sunday', 'Monday', 'Tuesday',  'Wednesday','Thursday', 'Friday', 'Staurday']
        //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
        $scope.effect_time_Renderer = function(dataItem){
            var by_date = dataItem.by_date;
            var by_week = dataItem.by_week;
            if (!by_date && !by_week ) {
                return 'null';
            }
            var result = '';
            if (by_date) {
                result +=$filter('date')(new Date(by_date.start_time),'yyyy-MM-dd HH:mm');
                result += ' ~ ';
                result +=$filter('date')(new Date(by_date.end_time), 'yyyy-MM-dd HH:mm');
            }
            if (by_week) {
                if (result.length > 0){
                    result += ' or ';
                }
                result += '(';
                by_week.forEach(function(x) {
                    result += ' ' + weeks[parseInt(x) % 7];
                });
                result += ')';
            }
            return result;
        }
        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="banner_detail.html?id='+ dataItem._id +'">Edit</a> ';
            // result += '<a ng-click=\'del("' + dataItem._id +'")\'> Delete </a>'
            return result;
        }
        
        $scope.enable_Renderer = function(dataItem){
            return dataItem.enable == 1? 'enable' : 'disable';
        }
        
        $scope.effect_now_Renderer = function(dataItem) {
            var isEffect = false;
            var now = new Date(), startTime, endTime;
            if (dataItem.by_date){
                if (dataItem.by_date.start_time) {
                    startTime = new Date(dataItem.by_date.start_time);
                }
                if (dataItem.by_date.end_time) {
                    endTime = new Date(dataItem.by_date.end_time);
                }
                if (startTime && endTime && now.getTime() >= startTime.getTime() && now.getTime() <= endTime.getTime()) {
                    return 'effected';
                }
            } 
            if (dataItem.by_week) {
                if (dataItem.by_week.indexOf(now.getDay()) >= 0) {
                    return 'effected';
                }
            }
            return 'uneffected';
        }

        $scope.actionChange = function(){
            if($scope.action) {
                return $scope[$scope.action]();
            }
        }
        
        // 删除delete
        $scope.del = function(_id) {
            var _data = getSelectedAllData($scope.banner_list_grid);
            if (_data) {
                if (confirm('Are you sure to delete?')) {
                    service.del({
                        api: 'banner',
                        method: "delete"
                    },getSelectedIds(_data), function(result) {
                        if (result.code == 0) {
                            alert('delete ok,'  );
                            location.reload();
                        } else {
                            alert('delete fail,' + result.respDesc);
                        }
                    });
                }
            }
            else 
            {
                $scope.action = "";
            }
            return false;
        }

        //修改
        $scope.update = function() {
            var _data = getSelectedData($scope.user_list_grid);
            if (_data) {
                location.href = 'update.html?id=' + _data.id;
            }
        }

        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.banner_list_grid);
                if (_data) {
                    location.href = 'banner_detail.html?id=' + _data._id;
                }
            });
        }

    }
]);