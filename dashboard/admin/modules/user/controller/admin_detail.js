framework.angular.controllers.controller("user-detail", ['$scope', 'commonRES',
function($scope, service) {
    if(location.search){
        service.get({
            api:'admin',
            method:'findOne',
            _id:location.search.split('=')[1]
        }, function (datas) {
            $scope.model = datas.body;
            $scope.model.pass = '';
            console.log($scope.model)
        })
    }

    service.get({
        api:'permissionRole',
        method:'find',
    }, function (datas) {
        $scope.role = datas.body.models;
    })

    $scope.save = function(){
        if (!confirm('Are you sure to submit？')) {
            return false;
        }
        service.save({
            api:'admin',
            method:'upsert'
        }, $('form[name=submit_form]').serializeObject(), function (result) {
            if(result.code==0){
                alert('Submit OK!');
                location.href='admin.html';
            }else{
                alert(result.message);
            }
        })
    }        
}])