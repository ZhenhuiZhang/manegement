framework.angular.controllers.controller("push-list", ['$scope', '$rootScope', 'commonRES', '$filter',
    function ($scope, $rootScope, service, $filter) {
        var url = framework.getFinalURL('push/find', '', '');
        $scope.gridUrl = url;
        var status = ["label-default", "label-primary", "label-success", "label-danger"];
        var push_status = {"0":"No push","20": "Pushing","200" :"Success","400": "Failed"};
        $scope.push_status_Renderer = function (dataItem) {
            console.log(dataItem.push_status)
            return '<span class="label ' + status[dataItem.push_status] + '">' + push_status[dataItem.push_status] + '</span>'
        }
        

        $scope.content_Renderer = function (dataItem) {
            var result = '';
            dataItem.contents.forEach(function (e,index) {
                result +=index+1+"."+ e.content_type + ":" + e.content + ",&nbsp Title:" + e.title + "<br/>";
            })

            return result;
        }

        $scope.push_detail_Renderer = function (dataItem) {
            var result = 'Current Operation Times:&nbsp<strong class="muted">' + dataItem.push_attr.cur_oper_time +'</strong>';
            result += '<br />Totle Operation Times:&nbsp<strong class="text-info">' + dataItem.push_attr.oper_times +'</strong>';
            result += '<br />Expect User Receive Numbers:' + dataItem.push_attr.expect_nums;
            // result += '<br />Current Operation Times:' + dataItem.push_attr.cur_oper_time;
            return result;
        }

        $scope.userrange_Renderer = function (dataItem) {
            var result = '';
            if(dataItem.user_range&&dataItem.user_range.date_start&&dataItem.user_range.date_end){
                result = 'Date Start:'
                result += dataItem.user_range ? $filter('date')(new Date(dataItem.user_range.date_start), 'yyyy-MM-dd HH:mm') : "";
                result += '<br/>Date End:';
                result += dataItem.user_range ? $filter('date')(new Date(dataItem.user_range.date_end), 'yyyy-MM-dd HH:mm') : "";
            }else{
                result="All user"
            }
            
            return result;
        }

        $scope.is_push_now_Renderer = function (dataItem) {
            var result = '';
            if(dataItem.is_push_now==1)result="No";
            else result="Yes";
            return result;
        }

        $scope.create_at_Renderer = function (dataItem) {
            return $filter('date')(new Date(dataItem.create_at), 'yyyy-MM-dd HH:mm');
        }

        $scope.operation_Renderer = function (dataItem) {
            var result=""
            result += '<a href="push_edit.html?id='+ dataItem._id +'">Edit</a> ';
            result += '<a class="copy-btn" href="#" data-id=' + dataItem._id +'>Copy</a> ';
            return result;
        }

        $scope.onComplete = function (config) {
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

            $('.copy-btn').on('click',function(){
                var id=$(this).attr("data-id");
                if (confirm('Are you sure to copy?')) {
                    service.save({
                        api: 'push',
                        method: "findOne",
                    },{_id:id}, function(result) {
                        if (result.code == 0) {
                            var model = {
                                contents:result.body.contents,
                                locations : result.body.locations,
                                platforms : result.body.platforms
                            }
                            if( result.body.is_push_now==0){
                                model.now=result.body.is_push_now;
                                model.pushtime =result.body.shcedule_push_time;
                            }
                            console.log(model)
                            localStorage["push_copy_model"]=JSON.stringify(model)
                            location.href = '../push/push_edit.html';
                        } else {
                            alert('copy fail,' + result.message);
                        }
                    });
                }
            })
        }

    }
]);