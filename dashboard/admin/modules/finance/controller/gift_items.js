framework.angular.controllers.controller("gift_items-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        try{
            var gift_cache = localStorage['gift_models'];
            gift_cache = JSON.parse(gift_cache);
        }catch(e){
            console.error(e)
        }

        $('body').on('click','.checkbox',function(){
            console.log($(this))
        })

        $scope.gift_name_Renderer = function(dataItem){
            var gift_id = dataItem.gift_id;
            var gift_name;
            if(gift_cache.length){
                gift_name = Enumerable.From(gift_cache)
                            .Where(function (x) { return x.gift_id==gift_id })
                            .Select(function (x) { return x.name })
                            .ToArray();
            }
            var result = gift_name[0];
            return result;
        }

        var url = framework.getFinalURL('giftItem/find', 'api/giftItem.json');
        var user_id = $.query.get('user_id');
        var start_times = $.query.get('date_start');
        var end_times = $.query.get('date_end');
        if(user_id&&start_times&&end_times){
            $scope.gridUrl = url + '?date_start=' + start_times+'&date_end='+end_times+'&receive_user_id='+user_id;
            $scope.date_start = start_times;
        }
        else{
            $scope.gridUrl = url;
        }

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

            //若url上有传参，则把参数写入搜索框内
            if(user_id&&start_times&&end_times){
                $('input[name="receive_user_id"]').val(user_id);
                $('input[name="date_end"]').val(end_times);
            }

            var urlParamObject = { date_start: $scope.date_start };
            urlParamObject.limit = 1;
            var searchObject = angular.element(".J_toolbar :input","#gift_items_grid").serializeObject();
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
    }
]);