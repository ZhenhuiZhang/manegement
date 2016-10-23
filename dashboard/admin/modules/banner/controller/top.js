framework.angular.controllers.controller("top-list", ['$scope', 'commonRES', '$filter',
    function($scope, service, $filter) {
        var url = framework.getFinalURL('banner/find?banner_type=top', 'api/user.json')
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.onComplete = function (config) {
            // console.log(config);

            //隐藏web平台
            // $('.k-selectable tbody tr').each(function(){
            //     var td = $(this).find('td:eq(2)');
            //     if(td.html() == 'web'){
            //         $(this).addClass('hidden');
            //     }
            // });
        }

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
            if (by_week && by_week.length >0) {
                if (result.length > 0){
                    result += ' or ';
                }
                result += '(';
                for(var i =0 ; i < by_week.length ; i++)
                {
                    var hour_start_time = (parseInt((by_week[i].start_time % 10000) /60)<10)?"0" + parseInt((by_week[i].start_time % 10000) /60) : parseInt((by_week[i].start_time % 10000) /60);
                    var hour_end_time = (parseInt((by_week[i].end_time % 10000) /60)<10)?"0" + parseInt((by_week[i].end_time % 10000) /60) : parseInt((by_week[i].end_time % 10000) /60);
                    var minute_start_time = (((by_week[i].start_time % 10000) % 60)<10)?"0" + ((by_week[i].start_time % 10000) % 60) : ((by_week[i].start_time % 10000) % 60);
                    var minute_end_time = (((by_week[i].end_time % 10000) % 60)<10)?"0" + ((by_week[i].end_time % 10000) % 60) : ((by_week[i].end_time % 10000) % 60);
                    
                    result += weeks[parseInt((by_week[i].start_time) / 10000)] + " ";
                    result += hour_start_time + ":" + minute_start_time + "~";
                    result += hour_end_time + ":" + minute_end_time;
                    if(i != by_week.length - 1)
                    {
                        result += ",";
                    }
                }
                result += ')';
            }
            return result;
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
                for(var i = 0 ; i< dataItem.by_week.length ; i++ )
                {
                    if(parseInt((dataItem.by_week[i].start_time) / 10000) == now.getDay())  //对比星期数是否相同
                    {
                        //当前小时大于等于开始小时，比结束小时小
                        if(now.getHours() >= parseInt((dataItem.by_week[i].start_time % 10000) /60) && now.getHours() < parseInt((dataItem.by_week[i].end_time % 10000) /60))
                        {
                            return 'effected';
                        }
                        //当前小时大于开始小时，小于等于结束小时
                        else if(now.getHours() > parseInt((dataItem.by_week[i].start_time % 10000) /60) && now.getHours() <= parseInt((dataItem.by_week[i].end_time % 10000) /60))
                        {
                            //当前分钟小于等于结束分钟
                            if(now.getMinutes() <= ((dataItem.by_week[i].end_time % 10000) %60))
                            {
                                return 'effected';
                            }
                        }
                        //当前等于开始小时，等于结束小时
                        else if(now.getHours() == parseInt((dataItem.by_week[i].start_time % 10000) /60) && now.getHours() == parseInt((dataItem.by_week[i].end_time % 10000) /60))
                        {
                            //当前分钟大于等于开始分钟，小于等于结束分钟
                            if(now.getMinutes() >= ((dataItem.by_week[i].start_time % 10000) %60) && now.getMinutes() <= ((dataItem.by_week[i].end_time % 10000) %60))
                            {
                                return 'effected';
                            }
                        }
                    }
                }
                // if (dataItem.by_week.indexOf(now.getDay()) >= 0) {
                //     return 'effected';
                // }
            }
            return 'uneffected';
        }
        
        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="top_detail.html?id='+ dataItem._id +'">Edit</a> ';
            // result += '<a ng-click=\'del("' + dataItem._id +'")\'> Delete </a>'
            return result;
        }
        
        $scope.enable_Renderer = function(dataItem){
            return dataItem.enable == 1? 'enable' : 'disable';
        }
        
        $scope.actionChange = function(){
            if($scope.action) {
                return $scope[$scope.action]();
            }
        }
        
        // 删除delete
        $scope.del = function(_id) {
            var _data = getSelectedAllData($scope.top_list_grid);
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
                var _data = getSelectedData($scope.top_list_grid);
                if (_data) {
                    location.href = 'top_detail.html?id=' + _data._id;
                }
            });
        }

    }
]);