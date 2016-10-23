framework.angular.controllers.controller("user-list", ['$scope', '$rootScope', 'commonRES',
    function($scope,$rootScope, service) {
        var url_param = 'user/find';
        if(getQuery('loginname')){
            $scope.loginname = getQuery('loginname');
            var url_param = 'user/find?loginname='+getQuery('loginname'); 
        }
        var url = framework.getFinalURL(url_param, 'api/user.json');
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911
        $scope.COUNTRY_LIST = [{value:"-all-(Location)",text:""}];
        COUNTRY_LIST.forEach(function(ele){
            $scope.COUNTRY_LIST.push({value:ele,text:ele})
        })

        
        //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
        $scope.status_Renderer = function(dataItem){
            return dataItem.status=='1' ? '已确认':'未确认';
        }
        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="user_detail.html?id='+ dataItem._id +'">Edit</a>';
            return result;
        }

        $scope.actionChange = function(){
            alert($scope.action)
            $scope[$scope.action]()
        }
        
        // 删除delete
        $scope.del = function() {
            var _data = getSelectedAllData($scope.grid1);
            if (_data) {
                if (confirm('您确定要删除吗？')) {
                    service.del({
                        api: 'user',
                        method: "del",
                        _id: getSelectedIds(_data)
                    }, function(project) {
                        if (true) {
                            alert('操作成功,'  );
                            location.reload();
                        } else {
                            alert('操作失败,' + project.respDesc);
                        }
                    });
                }
            }
        }

        //修改
        $scope.update = function() {
            var _data = getSelectedData($scope.user_list_grid);
            if (_data) {
                location.href = 'update.html?id=' + _data.id;
            }
        }
        
        //获取url参数
        function getQuery(name){
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return '';
        }
        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.user_list_grid);
                if (_data) {
                    location.href = 'user_detail.html?id=' + _data._id;
                }
            });
        }

    }
]);