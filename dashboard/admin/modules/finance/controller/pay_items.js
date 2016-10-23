framework.angular.controllers.controller("pay_items_list", ['$scope', 'commonRES','$filter', '$rootScope',
function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('payItem/find', 'api/payItem.json');
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

            var urlParamObject = { date_start: $scope.date_start };
            urlParamObject.limit = 1;
            var searchObject = angular.element(".J_toolbar :input","#pay_items_grid").serializeObject();
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
            $.ajax({
                url: _url,
                type: 'GET'
            }).done(function(data){
                $('#totalCost').html(data.body.totalCost);
            })
        }

        $scope.status_Renderer = function(dataItem) {
            if (dataItem.status == undefined) {
                return '';
            } else if ( dataItem.status == 0) {
                return 'wait for pay';
            } else if ( dataItem.status == 10) {
                return 'pay successful';
            } else if ( dataItem.status == 20) {
                return 'pay faild';
            } else {
                return dataItem.status;
            }
        }
        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="pay_items_detail.html?id='+ dataItem._id +'">View</a>';
            return result;
        }
        
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.pay_items_grid);
                if (_data) {
                    location.href = 'pay_items_detail.html?id=' + _data._id;
                }
            });
        }

        $('body').on('click','#download_btn',function(){
            var url_export = framework.getFinalURL('payItem/export')
                            +'?date_start=' + ($('input[name=date_start]').val() || '')
                            +'&date_end='+($('input[name=date_end]').val() || '')
                            +'&user_id='+($('input[name=user_id]').val() || '')
                            +'&platform='+($('input[name=platform]').val() || '')
                            +'&status='+($('select[name=status]').val() || '')
                            
            window.open(url_export)
        })
    }
])