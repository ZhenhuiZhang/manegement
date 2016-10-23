framework.angular.controllers.controller("anchor-list", ['$scope', 'commonRES',
    function($scope, service) {
        $scope.COUNTRY_LIST = [{value:"-all-(Location)",text:""}];
        COUNTRY_LIST.forEach(function(ele){
            $scope.COUNTRY_LIST.push({value:ele,text:ele})
        })
        var url = framework.getFinalURL('user/find?group=anchor', 'api/user.json', false);
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911

        $scope.onComplete = function (config) {
            console.log(config)
            var searchObject = angular.element(".J_toolbar :input", "#anchor_list_grid").serializeObject();
            var _url = url;
            if (Object.getOwnPropertyNames(searchObject).length > 0) {
                _url += '?';
                for (key in searchObject) {
                    if($('[name='+key+']').data('type') == 'date'){
                        searchObject[key] = searchObject[key]? moment.tz(searchObject[key],config.timezone).utc().format(): searchObject[key]
                    }
                    _url += key + '=' + searchObject[key] + '&';
                }
            }
            $.ajax({
                url: _url,
                type: 'GET'
            }).done(function (data) {
                console.log(data);
            })
        }

        //使用fieldname+Renderer命名规则，可以对field输出的HTML进行定制
        $scope.loginname_Renderer = function(dataItem){
            // delete dataItem.anchor_group._events;
            // console.log(dataItem.anchor_group);
            var loginname = dataItem.loginname + (dataItem.anchor_group&&dataItem.anchor_group.length ? ' - <span style="color:red">'+ dataItem.anchor_group.join(',')+'</span>' : '') 
            loginname += '<br><a href="'+ dataItem.pic +'" target="_blank" style="margin-top:5px;"><img src="'+ dataItem.pic +'" style="height:90px;" /></a>';
            return loginname
        }
        $scope.anchor_live_Renderer = function(dataItem){
            return UsersModel('anchor_live', dataItem.anchor_live)
        }
        // $scope.pic_Renderer = function(dataItem){
        //     var result = '<a href="'+ dataItem.pic +'" target="_blank"><img src="'+ dataItem.pic +'" style="height:90px;" /></a>';
        //     return result;
        // }
        $scope.anchor_status_Renderer = function(dataItem){
            if(dataItem.anchor_status)
                return UsersModel('anchor_status', dataItem.anchor_status)
            else
                return ''
        }
        $scope.handlebar_Renderer = function(dataItem){
            var result = '<a href="anchor_detail.html?id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>';
            result += '&nbsp;&nbsp;<a href="official_anchor_detail.html?id='+ dataItem._id +'" class="icon-edit-sign">Official</a>';            
            result += '&nbsp;&nbsp;<a href="anchor_punish.html?id='+ dataItem._id +'" class="icon-eye-close">Punish</a>';
            return result;
        }

        //Grid双击修改
        $scope.onInitialized = function(grid) {
            //grid：是回传的当前的grid对象
            grid.dbclick(function(event) {
                var _data = getSelectedData($scope.anchor_list_grid);
                if (_data) {
                    location.href = 'anchor_detail.html?id=' + _data._id;
                }
            })
        }
    }
])