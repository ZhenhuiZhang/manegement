framework.angular.controllers.controller("deposit-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('finance/depositFind', '');
        $scope.gridUrl = url;

        $scope.detail_Renderer = function(dataItem){
            var result="";
            if(dataItem.type=="checking"){
                dataItem.operation.forEach(item=>{
                    result+="order_id:"+item.order_ids+".</br>"
                })
            }else{
                dataItem.operation.forEach(item=>{
                    result+="user_id:"+item.user_id+",coin:"+item.coin+".</br>"
                })
            }
            return result;
        }
        
        $scope.checkOff_at_Renderer = function(dataItem){
            if(dataItem.is_checkOff==1)return $filter('date')(new Date(dataItem.checkOff_at),'yyyy-MM-dd HH:mm:ss')
            else return "";
        }
        
        $scope.state_Renderer = function(dataItem){
            var result="";
            dataItem.statement.forEach(item=>{
                if(item.result){
                    if(item.user_id)result+="user id:"+item.user_id+',result:'+ item.result+".</br>"
                    else result+="order id:"+item.order_id+',result:'+ item.result+".</br>"
                }else{
                    result+="user id:"+item.user_id+',before account'+ item.before_account+',last account:'+item.last_account+".</br>"
                }
            })
            return result;
        }


        $scope.handlebar_Renderer = function(dataItem){
            var result=""
            if(['employee','IDemployee'].indexOf(dataItem.type)>-1 && dataItem.is_checkOff==0){
                result = '<a href="deposit_detail.html?id='+ dataItem._id +'">recover</a> ';
            }else{
                result = '<a href="deposit_detail.html?id='+ dataItem._id +'">View</a> ';
            }
            return result;
        }
        
        $scope.onComplete = function (config) {
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
        }
    }
]);