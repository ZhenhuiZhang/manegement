framework.angular.controllers.controller("account-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('finance/account', 'finance/account.json');
        $scope.gridUrl = url;

        var m = new moment();
        m.add('-30', 'days');
        var dateStart = $filter('date')(m.toDate(), 'yyyy-MM-dd HH:MM');
        $scope.date_start = dateStart;
        
        $scope.type_Renderer = function(dataItem){
            if (dataItem.type == '0') {
                return 'Expend';
            } else if (dataItem.type == '1') {
                return 'Income'
            } else {
                return dataItem.type;
            }
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
        }
    }
]);