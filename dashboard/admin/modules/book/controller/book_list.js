framework.angular.controllers.controller("book-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var urlParams="book/find?number="+getQuery("number")
        var url = framework.getFinalURL(urlParams,'',false);
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="book_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>';
            return result;
        }

        $scope.pic_Renderer = function(dataItem){
            var result = '<img src="'+ dataItem.pic +'" style="width:50px;" />';
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