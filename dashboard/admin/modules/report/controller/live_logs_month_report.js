framework.angular.controllers.controller("live-logs-month-report-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('liveLogsMonthReport/find', 'api/liveLogsMonthReport.json');
        $scope.gridUrl = url;

        var dimension = []

        $scope.date_Renderer = function(dataItem){
            var date = new moment(dataItem.date)
            return $filter('date')(date.toDate(), 'yyyy-MM')
        }

        //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
        $scope.sum_live_times_Renderer = function(dataItem) {
            var times = dataItem.sum_live_times;
            if (times == undefined) {
                return '';
            }
            if (isNaN(times)){
                return times;
            }
            return Math.floor(times / 60 / 60) + ':' + (Math.floor(times / 60) % 60 ) + ':' + times % 60 ;
        }

        $('body').on('change','input[name=dimension]',function(){
                dimension = []
                $('input[name=dimension]:checked').each(function() {
                    dimension.push($(this).val())
                }, this);
                $scope.search()
        })

        $scope.details_Renderer = function(dataItem) {
            var start_times = new Date(dataItem.date).Format("yyyy-MM");
            var user_id = dataItem.user_id == undefined? '' : dataItem.user_id
            var anchor_group = dataItem.anchor_group == undefined? '' : dataItem.anchor_group
            var platform = dataItem.platform == undefined? '' : dataItem.platform

            var result = '<a href="live_logs_day_report.html?date_start='+start_times
                        +'&dimension='+dimension.toString()
                        +'&user_id='+user_id
                        +'&anchor_group='+anchor_group
                        +'&platform='+platform
                        +'">details</a>';
            return result;
        }
        
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
                
            $('.k-pager-info').hide()
        }

        $('body').on('click','#download_btn',function(){
            var url_export = framework.getFinalURL('liveLogsMonthReport/export')
                            +'?date_start=' + ($('input[name=date_start]').val() || '')
                            +'&date_end='+($('input[name=date_end]').val() || '')
                            +'&anchor_group='+ ($('select[name=anchor_group]').val())
                            +'&location='+ $('select[name=location]').val();

            window.open(url_export)
        })

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
    }
]);