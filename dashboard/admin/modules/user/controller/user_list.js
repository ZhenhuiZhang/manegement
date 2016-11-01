framework.angular.controllers.controller("user-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var urlParams="user/find?user_id="+getQuery("user_id")
        var url = framework.getFinalURL(urlParams,'',false);
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.status_Renderer = function(dataItem){
            if(dataItem.status == 0) return '<span class="label label-success">正常</span>'
            else return  '<span class="label label-danger">被禁止</span>' 
        }

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="user_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">编辑</a>';
            return result;
        }

        //获取url参数
        function getQuery(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURI(r[2]); return '';
        }
        
    }
]);