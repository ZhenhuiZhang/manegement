framework.angular.controllers.controller("shop-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var urlParams="shop/find?number="+getQuery("number")
        var url = framework.getFinalURL(urlParams,'',false);
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="shop_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign btn btn-info btn-xs" style="padding:3px;margin:0 3px;">&nbsp编辑</a>';
                result += '<button type="button" class="btn btn-danger btn-xs hidden-btn icon-ban-circle">&nbsp删除</button><br />';
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

        $scope.onComplete = function (config) {
            var modal = framework.prompt({
                name: 'weight',
                title: '提示框',
                bodys: '<div class="form-group"><label for="weight">Weight</label><input type="number" id="handle_weight" name="weight" class="form-control" placeholder="weight"></div>',
                buttons: '<button type="button" id="Submit" class="btn btn-primary" data-dismiss="modal"><span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>Submit</button>' +
                '<button type="button" class="btn btn-default" data-dismiss="modal"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span>Cancel</button>',
            })

            //hidden操作
            $('.hidden-btn').on('click', function (e) {
                var data = getSelectedData($scope.shop_detail_grid);
                e.preventDefault()
                handle(data, "hidden",config)
            })
        }

        function handle(data, type,config) {
                if (!confirm('确定提交?')) {
                    return false;
                }
                console.log({_id:data._id})
                service.save({
                    api: 'shop',
                    method: "deleted",
                }, {_id:data._id}, function (result) {
                    alert("删除成功!")
                    config.reload()
                });
        }
        
    }
]);