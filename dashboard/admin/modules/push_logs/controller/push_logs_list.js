framework.angular.controllers.controller("push-logs-list", ['$scope', 'commonRES','$filter', '$rootScope',
function($scope, service, $filter, $rootScope) {
    var url = framework.getFinalURL('pushLogs/find');
    $scope.gridUrl = url;

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
            var searchObject = angular.element(".J_toolbar :input","#push_logs_grid").serializeObject();
            for(key in urlParamObject) {
                if(!searchObject[key] && urlParamObject[key]){
                    searchObject[key] = urlParamObject[key];
                }
            }
            
            var _url = url;
            if (Object.getOwnPropertyNames(searchObject).length > 0) {
                _url += '?';
                for (key in searchObject) {
                    if($('[name='+key+']').data('type') == 'date'){
                        searchObject[key] = searchObject[key]? moment.tz(searchObject[key],config.timezone).utc().format(): searchObject[key]
                    }
                    _url += key + '=' + searchObject[key] + '&';
                }
            }
            _url += (_url.indexOf('?')==-1 ? '?' : '&') + '__lt=total' 
            console.log(_url)
            $.ajax({
                url: _url,
                type: 'GET'
            }).done(function (data) {
                $('#totalSuccess_count').html(data.body.totalSuccess);
                $('#totalFailure_count').html(data.body.totalFailure);
            })
        }
    
    //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
    $scope.results_Renderer = function(dataItem) {
        var result = '<a href="push_logs_result.html?_id='+ dataItem._id +'" class="icon-edit-sign">View Result</a>';
        return result;
    }

    // //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
    // $scope.create_at_Renderer = function(dataItem) {
    //     return $filter('date')(new Date(dataItem.create_at),'yyyy-MM-dd HH:mm Z');
    // }
    

    //Grid双击修改
    $scope.onInitialized = function(grid) {
        //grid：是回传的当前的grid对象
        grid.dbclick(function(event) {
            var _data = getSelectedData($scope.push_logs_grid);
            if (_data) {
                location.href = 'push_logs_result.html?_id=' + _data._id;
            }
        });
    }
}])