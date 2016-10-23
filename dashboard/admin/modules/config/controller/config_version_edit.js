framework.angular.controllers.controller("config-version-edit", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        $scope.COUNTRY_LIST=COUNTRY_LIST
        $scope.model ={};
        $(".form_datetime").datetimepicker({
            format: "yyyy-mm-dd hh:ii:ss Z",
            forceParse: true,
            initialDate: new Date(),
            todayBtn: true,
            clearBtn: true,
            todayHighlight: true,
            autoclose: true,
            timezone: 'JKT'
        });
        // 点击日历图标调用日历插件
        $(".date-btn").click(function(){
            $(this).prev().datetimepicker('show')
        });
        if(location.search){
            $scope.edit=true;
            service.get({
                api:'configVersion',
                method:'findOne',
                _id:location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                if($scope.model.location.indexOf('all')!=-1)$scope.model.location=['Indonesia','Malaysia','Turkey','Russian','Vietnam','Thailand']
                $scope.model.datas=JSON.stringify(datas.body.config.datas);
            })
        }else{
            $scope.edit=true;
            service.get({
                api:'configVersion',
                method:'findOne',
                platform:'common',
                // status:10,
            }, function (datas) {
                $scope.model.config={}
                if(datas.body)$scope.model.config.version=datas.body?parseInt(datas.body.config.version)+1:1;
                else $scope.model.config.version=1;
            })
        }

       $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            try{
                JSON.parse($scope.model.datas)
            }catch(e){
                alert('Unexpected input in json'); 
            }

           var national = [];
            $scope.model.datas=JSON.parse($scope.model.datas);
            var updateConfig={
                    "gift_version":$scope.model.config.gift_version,
                    "version":$scope.model.config.version,
                    "datas":$scope.model.datas
                }
            //判断是否为修改记录
            var method = "";
            var params;
            if(location.search){
                method = 'update'
                $scope.model.location=national;
                params = {
                    config:updateConfig,
                    AppVersion:$scope.model,
                }
            }else{
                method = 'create'
                params = {
                    platform:"common",
                    config:updateConfig,
                    publish_at: $scope.model.publish_time?$scope.model.publish_time:"now",
                    location:national.join(',')
                }
            }
            service.save({
                    api: 'configVersion',
                    method: method
                }, 
                params,
                function (result) {
                    if (result.code == 0) {
                        alert('submit ok.');
                        location.href = 'config_version_list.html';
                    } else if(result.code == 1){
                        alert("error:This version is already exist");
                        location.href = 'config_version_edit.html?_id='+result.message._id;
                    }else{
                        alert("error:"+result.message);
                    }
                })
        }
    }
]);