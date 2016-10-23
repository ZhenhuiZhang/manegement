framework.angular.controllers.controller("admin-change-pass", ['$scope', 'commonRES',
function($scope, service) {
    

    $scope.save = function(){
        if (!confirm('Are you sure to submit？')) {
            return false;
        }

        var params = $('form[name=submit_form]').serializeObject()
        params._id = JSON.parse($.cookie('admin')).adminid
        service.save({
            api:'admin',
            method:'changePass'
        }, params, function (result) {
            console.log(result)
            if(!result.body.message){
                alert('Submit OK!');
                location.href='admin.html';
            }else{
                alert(result.body.message);
            }
        })
    }        
}])