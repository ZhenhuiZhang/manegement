framework.angular.controllers.controller("live-logs-list", ['$scope', 'commonRES','$filter', '$rootScope',
function($scope, service, $filter, $rootScope) {
    var url = framework.getFinalURL('liveLogs/find');
    $scope.gridUrl = url;

    console.log(jstz.determine().name())

    var m = new moment();
    m.add('-30', 'days');
    var dateStart = $filter('date')(m.toDate(), 'yyyy-MM-dd HH:MM');
    $scope.date_start = dateStart;
    
    //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
    $scope.live_times_Renderer = function(dataItem) {
        var times = dataItem.live_times;
        if (times == undefined) {
            return '';
        }
        if (isNaN(times)){
            return times;
        }
        return Math.floor(times / 60 / 60) + ':' + (Math.floor(times / 60) % 60 ) + ':' + times % 60 ;
    }
    $scope.gift_count_Renderer = function(dataItem){
        var start_times = new Date(dataItem.create_at).Format("yyyy-MM-dd hh:mm:ss");
        var end_times = new Date(dataItem.update_at).Format("yyyy-MM-dd hh:mm:ss");
        var result = '<a href="../finance/gift_items.html?user_id='+ dataItem.user_id +'&date_start='+start_times+'&date_end='+end_times+'">'+(dataItem.gift_count||0)+'</a>';
        if(!dataItem.gift_count || dataItem.gift_count=='0')
            result = 0;
        return result;
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
    
    $scope.onComplete = function (config) {
        $("#GT_live_times").change(function(){
            $("#gt_live_times").val($(this).val()*60);
        });

        $("#LT_live_times").change(function(){
            $("#lt_live_times").val($(this).val()*60);
        });

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
        var searchObject = angular.element(".J_toolbar :input", "#live_logs_grid").serializeObject();
        for (key in urlParamObject) {
            if (!searchObject[key] && urlParamObject[key]) {
                searchObject[key] = urlParamObject[key];
            }
        }
        //不允许搜索全部日期
        if (!searchObject.date_start) {
            $scope.date_start = dateStart;
            searchObject.date_start = dateStart;
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
        $.ajax({
            url: _url,
            type: 'GET'
        }).done(function (data) {
            var times = data.body.totalLive_times;
            var totalLive_times = '0:0:0'
            if (!isNaN(times)) {
                totalLive_times = Math.floor(times / 60 / 60) + ':' + (Math.floor(times / 60) % 60 ) + ':' + times % 60
            }
            $('#totalLive_times').html(totalLive_times);
            $('#totalRevence').html(data.body.totalRevence);
            $('#totalUV').html(data.body.totalUV);
            $('#totalDAU').html(data.body.totalDAU);
            $('#totalFollow_count').html(data.body.totalFollow_count);
            $('#totalGift_count').html(data.body.totalGift_count);
        })
    }

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
    // 例子： 
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
    Date.prototype.Format = function (fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }


    $scope.actionChange = function(){
        alert($scope.action)
        $scope[$scope.action]()
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
        var _data = getSelectedData($scope.user_list_grid);
        if (_data) {
            location.href = 'update.html?id=' + _data.id;
        }
    }
}])