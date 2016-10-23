framework.angular.controllers.controller("config-version-plat", ['$scope', '$rootScope', 'commonRES', '$filter',
    function ($scope, $rootScope, service, $filter) {
        $scope.COUNTRY_LIST = COUNTRY_LIST
        $scope.model = {};
        $scope.checkNational = {}
        $scope.platforms={}
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
        $(".date-btn").click(function () {
            $(this).prev().datetimepicker('show')
        });

        if (location.search) {
            $scope.edit = true;
            service.get({
                api: 'configVersion',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                if ($scope.model.location.indexOf('all') != -1) $scope.model.location = COUNTRY_LIST
                $scope.model.location.forEach(function (item) {
                    $scope.checkNational[item] = item
                })
                $scope.model.datas = $scope.model.config.datas ? JSON.stringify(datas.body.config.datas) : '';
                //转化platform为对象
                $scope.model.platform.forEach(function (item) {
                    $scope.platforms[item] = item
                })
            })
        }

        $scope.handleCheck = function ($event) {
            if ($scope.checkNational[$($event.target).val()]) {
                $scope.checkNational[$($event.target).val()] = ""
            } else {
                $scope.checkNational[$($event.target).val()] = $($event.target).val()
            }
        }


        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            try {
                JSON.parse($scope.model.datas)
            } catch (e) {
                alert("Unexpected input in json");
            }
            //location转化
            var national = [];
            Object.getOwnPropertyNames($scope.checkNational).forEach(function (item) {
                if ($scope.checkNational[item]) {
                    national.push($scope.checkNational[item])
                }
            })
            //如果为全选，则传空数组到后台
            if(national.length==COUNTRY_LIST.length)national=[]
            //platform转化
            var platforms = [];
            Object.getOwnPropertyNames($scope.platforms).forEach(function (item) {
                if ($scope.platforms[item]) {
                    platforms.push($scope.platforms[item])
                }
            })
            $scope.model.platform = platforms.join(',');
            var configDatas = JSON.parse($scope.model.datas);
            var updateConfig = {
                "datas": configDatas
            }
            var params = {};
            var oper;
            if (location.search) {
                oper = "update"
                $scope.model.location = national;
                params = {
                    config: updateConfig,
                    AppVersion: $scope.model,
                }
            } else {
                oper = "create"
                params = {
                    platform: $scope.model.platform,
                    platform_ver: $scope.model.platform_ver,
                    config: updateConfig,
                    publish_at: $scope.model.publish_time ? $scope.model.publish_time : "now",
                    location: national.join(',')
                }
            }

            if ($('input[name="platform_ver"]').val().indexOf('.') == -1) {
                alert('error: platform version is not valid')
                return
            } else {
                service.save({
                    api: 'configVersion',
                    method: oper
                }, params, function (result) {
                    if (result.code == 0) {
                        alert('submit ok.');
                        location.href = 'config_version_list.html';
                    } else if (result.code == 1) {
                        console.log(result)
                        alert(result.message);
                    } else {
                        alert("error:" + result.message);
                    }
                })
            }

        }
    }
]);