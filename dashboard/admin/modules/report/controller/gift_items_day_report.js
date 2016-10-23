framework.angular.controllers.controller("gift-items-day-report-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {

        var init = true

        var dimension = $.query.get('dimension')==true? '' : $.query.get('dimension');
        var sender = $.query.get('sender')==true? '' : $.query.get('sender');
        var sender_user_id = $.query.get('sender_user_id')==true? '' : $.query.get('sender_user_id');
        var receive = $.query.get('receive')==true? '' : $.query.get('receive');
        var receive_user_id = $.query.get('receive_user_id')==true? '' : $.query.get('receive_user_id');
        var gift_id = $.query.get('gift_id')==true? '' : $.query.get('gift_id');
        var start_times = new moment($.query.get('date_start')).startOf('day');
        var end_times = new moment($.query.get('date_start')).add(1,'months').add(-1,'days');
        end_times.hours(23);
        end_times.minutes(59);
        end_times.seconds(59);
        end_times.milliseconds(999);

        var url = framework.getFinalURL('giftItemDayReport/find', 'api/giftItemDayReport.json');
        if($.query.get('date_start')){
            localStorage.removeItem('search_gift_items_day_report_grid');
            init = false
            
            if(dimension){
                dimension.split(',').forEach(function(element) {
                    $('.'+element).addClass('active')
                    $('.'+element).find('input').attr('checked','checked')
                }, this);
            }
        }
        $scope.gridUrl = url ;

        $('body').on('change','input[name=dimension]',function(){
                console.log($(this).prop('checked'))
                $scope.search()
        })

        $scope.date_Renderer = function(dataItem){
            var date = new moment(dataItem.date)
            return $filter('date')(date.toDate(), 'yyyy-MM-dd')
        }

        
        $scope.onComplete = function(config){

            if(!init){
                if($.query.get('date_start')){
                    $('input[name=date_start]').val($filter('date')(start_times.toDate(), 'yyyy-MM-dd HH:mm:ss')) 
                    $('input[name=date_end]').val($filter('date')(end_times.toDate(), 'yyyy-MM-dd HH:mm:ss')) 
                }
                $('input[name=sender]').val(sender) 
                $('input[name=sender]').val(sender) 
                $('input[name=sender_user_id]').val(sender_user_id)
                $('input[name=receive]').val(receive)
                $('input[name=receive_user_id]').val(receive_user_id)
                $('input[name=gift_id]').val(gift_id)
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
            var url_export = framework.getFinalURL('giftItemDayReport/export')
                            +'?date_start=' + ($('input[name=date_start]').val() || '')
                            +'&date_end='+($('input[name=date_end]').val() || '');

            window.open(url_export)
        })
    }
]);