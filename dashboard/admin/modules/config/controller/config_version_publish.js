framework.angular.controllers.controller("config-version-publish", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        $scope.model ={};
        $scope.show=true;
        if(location.search){
            service.save({
                api:'configVersion',
                method:'findOne',
            },
            {
                _id:location.search.split('=')[1].split('&')[0],
                operation : 'publish',
                platform : location.search.split('=')[2]
            }, function (datas) {
                $scope.model = datas.body;
                console.log(datas.body)
                if(datas.body.status==10){$scope.show=false}
                // $scope.model.datas=JSON.stringify(datas.body.config.datas);
                // console.log(datas)
            })
        }
      

       $scope.publish = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            service.save({
                api: 'configVersion',
                method: 'update'
            }, 
            {
                status:10,
                AppVersion:$scope.model,
            },
             function (result) {
                if (result.code == 0) {
                    alert('submit ok.');
                    location.href = 'config_version_list.html';
                } else {
                    console.log(result)
                    alert(result.message);
                }
            })
        }

        $(function(){ 
            $("#copy").zclip({  
                path:'../../../bower_components/jquery-zclip/ZeroClipboard.swf',  
                copy:function(){return $("#datasComtent").text();},  
                afterCopy:function(){alert('Copy succeed！');}  
            });
        }); 
    }
]);