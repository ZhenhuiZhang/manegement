framework.angular.controllers.controller("borrow-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('borrow/find','',false);
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.status_Renderer = function(dataItem){
            if(dataItem.status == 10) return '<span class="label label-success">已归还</span>'
            else if(dataItem.status == 0 && new Date(dataItem.return_at) < new Date()) return '<span class="label label-danger">过期未归还</span>' 
            return  '<span class="label label-info">未归还</span>' 
        }

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="borrow_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">操作</a>';
            return result;
        }
    }
]);