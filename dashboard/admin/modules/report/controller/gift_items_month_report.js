framework.angular.controllers.controller("gift-items-month-report-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('giftItemMonthReport/find', 'api/giftItemMonthReport.json');
        $scope.gridUrl = url;
        var dimension = []

        $scope.date_Renderer = function(dataItem){
            var date = new moment(dataItem.date)
            return $filter('date')(date.toDate(), 'yyyy-MM')
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
            var sender = dataItem.sender == undefined? '' : dataItem.sender
            var sender_user_id = dataItem.sender_user_id == undefined? '' : dataItem.sender_user_id
            var receive = dataItem.receive == undefined? '' : dataItem.receive
            var receive_user_id = dataItem.receive_user_id == undefined? '' : dataItem.receive_user_id
            var gift_id = dataItem.gift_id == undefined? '' : dataItem.gift_id

            var result = '<a href="gift_items_day_report.html?date_start='+start_times
                        +'&dimension='+dimension.toString()
                        +'&sender='+sender
                        +'&sender_user_id='+sender_user_id
                        +'&receive='+receive
                        +'&receive_user_id='+receive_user_id
                        +'&gift_id='+gift_id
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
            var url_export = framework.getFinalURL('giftItemMonthReport/export')
                            +'?date_start=' + ($('input[name=date_start]').val() || '')
                            +'&date_end='+($('input[name=date_end]').val() || '');
                            
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