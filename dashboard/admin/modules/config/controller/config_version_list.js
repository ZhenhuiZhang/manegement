framework.angular.controllers.controller("config-version-list", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
       var url = framework.getFinalURL('configVersion/find', '')
        $scope.gridUrl = url; 

        $scope.version_Renderer = function(dataItem){
                return dataItem.config.version?dataItem.config.version:"";
        }

        $scope.status_Renderer = function(dataItem){
            if(dataItem.status == 10) return '<span class="label label-success">enable</span>'
            else return  '<span class="label label-danger">disable</span>' 
        }

        $scope.gift_ver_Renderer = function(dataItem){
                return dataItem.config.gift_version?dataItem.config.gift_version:"";
        }

        $scope.national_Renderer = function(dataItem){
            return  dataItem.location.join(',');
        }

        $scope.publish_at_Renderer = function(dataItem){
            if(dataItem.status==10){
                return $filter('date')(new Date(dataItem.publish_at), 'yyyy-MM-dd HH:mm.ss');
            }else{
                return ""
            }
        }
           
        $scope.handlebar_Renderer = function(dataItem){
            var url = dataItem.platform=="common"?"edit":"plat";
            if(dataItem.status==10&&dataItem.platform=="common"){
                var result = '<a href="config_version_publish.html?_id='+ dataItem._id +'" >View</a>';
            }else if(dataItem.status==10){
                var result = '<a href="config_version_publish.html?_id='+ dataItem._id +'" >View</a>';
                result += '&nbsp&nbsp<a href="#" class="offline-btn" data-id=' + dataItem._id +'> Offline </a>';
            }else{
                var result = '<a href="config_version_'+url+'.html?_id='+ dataItem._id +'" >Edit</a>';
                result += '&nbsp&nbsp<a href="config_version_publish.html?_id='+ dataItem._id+'&platform='+dataItem.platform +'" >Publish</a>';
                result += '&nbsp&nbsp<a href="#" class="delete-btn" data-id=' + dataItem._id +'> Delete </a>';
            }
            return result;
        }

        $scope.updateGiftVersion=function(){
            if (confirm('Are you sure to update gift version?')) {
                service.save({
                    api: 'configVersion',
                    method: "updateGiftVersion",
                },{}, function(result) {
                    if (result.code == 0) {
                        alert('update ok!');
                        location.reload();
                    } else {
                        alert('update fail,'+result.message);
                    }
                });
            }
        }
        
        $scope.updateVersion=function(){
            if (confirm('Are you sure to update version?')) {
                service.save({
                    api: 'configVersion',
                    method: "updateVersion",
                },{}, function(result) {
                    if (result.code == 0) {
                        alert('update ok!');
                        location.reload();
                    } else {
                        alert('update fail,'+result.message);
                    }
                });
            }
        }
       
        $scope.delete = function(id) {
            if (confirm('Are you sure to delete?')) {
                service.save({
                    api: 'configVersion',
                    method: "remove",
                },{_id:id}, function(result) {
                    if (result.code == 0) {
                        alert('delete ok!');
                        location.reload();
                    } else {
                        alert('delete fail,'+result.message);
                    }
                });
            }
        }

        $scope.offline = function(id) {
            if (confirm('Are you sure to handle?')) {
                service.save({
                    api: 'configVersion',
                    method: "offline",
                },{_id:id}, function(result) {
                    if (result.code == 0) {
                        console.log(result)
                        alert('ok!');
                        location.reload();
                    } else {
                        alert('fail,'+result.message.error);
                    }
                });
            }
        }


        $scope.onComplete = function (config) {
            $('.delete-btn').on('click',function(){
                var id=$(this).attr("data-id");
                $scope.delete(id);
            })
            $('.offline-btn').on('click',function(){
                var id=$(this).attr("data-id");
                $scope.offline(id);
            })
        }
    }
]);