framework.angular.controllers.controller("openModalCtrl",
['$scope', '$rootScope',function($scope, $rootScope) {
    $rootScope.loading = false;
    
    $scope.doOpenModal = function() {
        $scope.openModal({
            title: "添加",
            remote: $scope.MODULE_PATH + "welcome/welcome-modal.html",
            width: 680,
            height: 350,
            data: {
                para: 'temp',
            },
            onSubmit: function(modalConfig) {
                console.log(modalConfig.resultData);
                alert(modalConfig.resultData.name);
                //对grid的操作DEMO
//                    var grid = $scope.websiteDomainXpathGrid.selector.data("kendoGrid");
//                    grid.dataSource.insert(modalConfig.resultData.proj);
//
//                    var dataSource = {
//                        data: grid.dataSource.data(),
//                        schema: {
//                            model: {
//                                fields: {
//                                    ancestor: {
//                                        type: 'number'
//                                    }
//                                }
//                            }
//                        },
//                        sort: {
//                            field: "name",
//                            dir: "asc"
//                        }
//                    };
//                    var dataSource2 = new kendo.data.DataSource(dataSource);
//                    grid.setDataSource(dataSource2);

                return true; //返回true，就自动关闭窗口，否则不关闭。可用于手工控制窗口的打开与关闭
            }
        });
    }
}
]);