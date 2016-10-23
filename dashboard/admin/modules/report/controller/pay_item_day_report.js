framework.angular.controllers.controller("pay-items-day-report-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {

        $scope.sum_account_Renderer = function(dataItem) {
            return Number(dataItem.sum_account).toFixed(2)
        }

        var init = true

        //获取url参数
        var url = framework.getFinalURL('payItemDayReport/find', 'api/payItemDayReport.json');
        var dimension = $.query.get('dimension')==true? '' : $.query.get('dimension');
        var currency = $.query.get('currency')==true? '' : $.query.get('currency');
        var user_id = $.query.get('user_id')==true? '' : $.query.get('user_id');
        var gold = $.query.get('gold')==true? '' : $.query.get('gold');
        var platform = $.query.get('platform')==true? '' : $.query.get('platform');
        var status = $.query.get('status')==true? '' : $.query.get('status');
        var start_times = new moment($.query.get('date_start')).startOf('day');
        var end_times = new moment($.query.get('date_start')).add(1,'months').add(-1,'days');
        end_times.hours(23);
        end_times.minutes(59);
        end_times.seconds(59);
        end_times.milliseconds(999);
        if($.query.get('date_start')){
            localStorage.removeItem('search_pay_item_day_report_grid');
            init = false
            
            if(dimension){
                dimension.split(',').forEach(function(element) {
                    $('.'+element).addClass('active')
                    $('.'+element).find('input').attr('checked','checked')
                }, this);
            }
        }
        $scope.gridUrl = url;

        $('body').on('change','input[name=dimension]',function(){
                $scope.search()
        })

        $scope.date_Renderer = function(dataItem){
            var date = new moment(dataItem.date)
            return $filter('date')(date.toDate(), 'yyyy-MM-dd')
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
        
        $scope.onComplete = function(config){

            //初始化搜索
            if(!init){
                if($.query.get('date_start')){
                    $('input[name=date_start]').val($filter('date')(start_times.toDate(), 'yyyy-MM-dd HH:mm:ss')) 
                    $('input[name=date_end]').val($filter('date')(end_times.toDate(), 'yyyy-MM-dd HH:mm:ss')) 
                }
                $('select[name=platform]').val(platform)
                $('select[name=status]').val(status)
                $('input[name=user_id]').val(user_id)
                $('input[name=gold]').val(gold)
                $('input[name=currency]').val(currency)
                $scope.search()
                init = true
            }

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
            
            var _dimension = []
            $('input[name=dimension]:checked').each(function() {
                _dimension.push($(this).val())
            }, this);
            var url_export = framework.getFinalURL('payItemDayReport/export')
                            +'?date_start=' + ($('input[name=date_start]').val() || '')
                            +'&date_end='+($('input[name=date_end]').val() || '');

            window.open(url_export)
        })
    }
]);