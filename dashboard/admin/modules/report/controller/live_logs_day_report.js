framework.angular.controllers.controller("live-logs-day-report-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        
        var init = true

        var url = framework.getFinalURL('liveLogsDayReport/find', 'api/liveLogsDayReport.json');
        var dimension = $.query.get('dimension')==true? '' : $.query.get('dimension');
        var user_id = $.query.get('user_id')==true? '' : $.query.get('user_id');
        var anchor_group = $.query.get('anchor_group')==true? '' : $.query.get('anchor_group');
        var platform = $.query.get('platform')==true? '' : $.query.get('platform');
        var start_times = new moment($.query.get('date_start')).startOf('day');
        var end_times = new moment($.query.get('date_start')).add(1,'months').add(-1,'days');
        end_times.hours(23);
        end_times.minutes(59);
        end_times.seconds(59);
        end_times.milliseconds(999);
        if($.query.get('date_start')){
            localStorage.removeItem('search_live_logs_day_report_grid');
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
        
        $scope.onComplete = function(config){
            
            if(!init){
                if($.query.get('date_start')){
                    $('input[name=date_start]').val($filter('date')(start_times.toDate(), 'yyyy-MM-dd HH:mm:ss')) 
                    $('input[name=date_end]').val($filter('date')(end_times.toDate(), 'yyyy-MM-dd HH:mm:ss')) 
                }
                $('select[name=platform]').val(platform)
                $('select[name=anchor_group]').val(anchor_group)
                $('input[name=user_id]').val(user_id)
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
            console.log(_dimension)
            var url_export = framework.getFinalURL('liveLogsDayReport/export')
                            +'?date_start=' + ($('input[name=date_start]').val() || '')
                            +'&date_end='+($('input[name=date_end]').val() || '')
                            +'&anchor_group='+ ($('select[name=anchor_group]').val())
                            +'&location='+ $('select[name=location]').val();
                            
            window.open(url_export)
        })
    }
]);