framework.angular.controllers.controller("splash-list", ['$scope', 'commonRES', '$filter',
    function($scope, service, $filter) {
        var url = framework.getFinalURL('splash/find', 'api/user.json')
        $scope.gridUrl = url;

        //国家搜索条件
        $scope.COUNTRY_LIST = [{value:"-all-(Country)",text:""}];
        COUNTRY_LIST.forEach(function(ele){
            $scope.COUNTRY_LIST.push({value:ele,text:ele})
        })

        $scope.enable_Renderer = function(dataItem){
            return dataItem.enable == 1? 'enable' : 'disable';
        }

        $scope.duration_Renderer = function(dataItem){
            return dataItem.duration? dataItem.duration+ 's':"";
        }

        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a class="delete-btn icon-pencil btn btn-link" href="splash_detail.html?id='+ dataItem._id +'">Edit</a>'
            return result;
        }
        $scope.time_Renderer = function(dataItem){
            var result = 'Start time:'+dataItem.effect_date.start_time+"</br>End time"+dataItem.effect_date.end_time
            return result;
        }
    }
]);