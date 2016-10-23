framework.angular.controllers.controller("report-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('report/find', 'api/giftItem.json');
        $scope.gridUrl = url;
        
        var m = new moment();
        m.add('-1', 'days');
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

            var urlParamObject = { date_start: $scope.date_start };
            urlParamObject.limit = 1;
            var searchObject = angular.element(".J_toolbar :input","#report_grid").serializeObject();
            for(key in urlParamObject) {
                if(!searchObject[key] && urlParamObject[key]){
                    searchObject[key] = urlParamObject[key];
                }
            }
            //不允许搜索全部日期
            if ( !searchObject.date_start){
                $scope.date_start = dateStart;
                searchObject.date_start = dateStart;
            }
            var _url = url ;
            if (Object.getOwnPropertyNames(searchObject).length > 0){
                _url += '?';
                for(key in searchObject) {
                    if($('[name='+key+']').data('type') == 'date'){
                        searchObject[key] = searchObject[key]? moment.tz(searchObject[key],config.timezone).utc().format(): searchObject[key]
                    }
                    _url += key + '=' + searchObject[key] + '&';
                }
            }

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

        $scope.liveurl_Renderer = function(dataItem){
            return '<a href="http://www.nonolive.com/liveroom/'+ dataItem.user_id +'" target="_blank">http://www.nonolive.com/liveroom/'+ dataItem.user_id +'</a>' 
        }
    }
])