framework.angular.controllers.controller("feedback-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('feedback/find', 'api/feedback/find.json');
        $scope.gridUrl = url;

        var m = new moment();
        m.add('-30', 'days');
        var dateStart = $filter('date')(m.toDate(), 'yyyy-MM-dd HH:MM');
        $scope.date_start = dateStart;
    
        $scope.onComplete = function(config){

            // disabling dates
            var nowTemp = new Date();
            var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
            var checkin = $('.dpd1').datetimepicker()
                .on('changeDate', function(ev) {
                    if (ev.date.valueOf() > checkout.date.valueOf()) {
                        var newDate = new Date(ev.date)
                        newDate.setDate(newDate.getDate() + 1);
                        checkout.setValue(newDate);
                    }
                    checkin.hide();
                    $('.dpd2')[0].focus();
                }).data('datetimepicker');
            var checkout = $('.dpd2').datetimepicker({
                onRender: function(date) {
                    return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
                }
            }).on('changeDate', function(ev) {
                    checkout.hide();
                }).data('datetimepicker');
        }

        $scope.device_Renderer = function(dataItem) {
            var result = '';
            if(dataItem.os_platform)result += 'os_platform:'+ dataItem.os_platform +'<br>'         //手机系统平台 
            if(dataItem.os_version)result += 'os_version:'+ dataItem.os_version  +'<br>'          //设备操作系统版本
            if(dataItem.device_model)result += 'device_model:'+ dataItem.device_model +'<br>'        //手机型号
            if(dataItem.app_version)result += 'app_version:'+ dataItem.app_version +'<br>'         //App 版本号
            if(dataItem.network)result += 'network:'+ dataItem.network +'<br>'                  //网络类型
            if(dataItem.sp)result += 'sp:'+ dataItem.sp +'<br>'                            //运营商  
            return result;
        }
        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="feedback_detail.html?id='+ dataItem._id +'">View</a>';
            return result;
        }
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.feedback_grid);
                if (_data) {
                    location.href = 'feedback_detail.html?id=' + _data._id;
                }
            });
        }
}])