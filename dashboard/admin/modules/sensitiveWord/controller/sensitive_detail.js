framework.angular.controllers.controller("sensitive-word-detail", ['$scope', 'commonRES','$filter',
function($scope, service, $filter) {

    if (location.search) {
            service.get({
                api: 'words',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.content=datas.body.sensitive_word.join(",")
            })
        }
    
    

    $scope.save = function(){
        

        if (location.search) {
            var params = {
                "sensitive_word":$scope.content,
                "_id":location.search.split('=')[1]
            };
            service.save({
                api: 'words',
                method: 'update'
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok.');
                    location.href = 'sensitive_word.html';
                } else {
                    alert(result.message);
                }
            })
        }else{
            var params = {
            "sensitive_word":$scope.content,
            };
            service.save({
                api: 'words',
                method: 'update'
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok.');
                    location.href = 'sensitive_word.html';
                } else {
                    alert(result.message);
                }
            })
        }
         
    }        
}])