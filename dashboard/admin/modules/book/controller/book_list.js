framework.angular.controllers.controller("book-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('book/find','',false);
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="book_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>';
            return result;
        }

        $scope.pic_Renderer = function(dataItem){
            var result = '<img src="'+ dataItem.pic +'" style="width:50px;" />';
            return result;
        }
        
    }
]);