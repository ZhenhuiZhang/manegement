
framework.angular.controllers.controller("clear-fcm", ['$scope', 'commonRES', '$rootScope',
function($scope, service, $rootScope) {
    
    $scope.submit=function(){
        var date=new moment().format();
        var last=new moment(date).add(-$scope.model.days, 'day').format();
        
        service.get({
            api: 'user',
            method: 'updateFCM',
            date_start: last,
        }, function (datas) {
            if(datas.code==0){
                alert("done");
                location.href = 'push_logs_list.html';
            }
        });
    }
}])