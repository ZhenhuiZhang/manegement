framework.angular.controllers.controller("gift-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        var method = ""

        Array.prototype.remove = function(val) { 
            var index = this.indexOf(val); 
            if (index > -1) { this.splice(index, 1); } 
        };

        $('body').on('change','input[name=location]',function(){
            if($(this).prop('checked')){
                if($scope.model.location){
                    $scope.model.location.remove('all')
                    $scope.model.location.push($(this).val())
                }else{
                    $scope.model.location = ['all']
                    $scope.model.location.push($(this).val())
                }
            }else{
                $scope.model.location.remove($(this).val())
                if($('input[name=location]:checked').length == 0){
                    $scope.model.location = ['all']
                }
            }
        })

        if (location.search) {
            service.get({
                api: 'gift',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
            });

            method = "update"
        }else{
            // $('input').removeAttr('readonly disabled');
            method = 'create'
        }

        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            if(!params.location){
                params.location = ['all']
            }
            service.save({
                api: 'gift',
                method: method, 
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    if(method == "update")
                        location.reload();
                    else
                        location.href = 'gift_list.html';
                } else {
                    console.log(result.message);
                }
                $rootScope.loading = false;
            });
        }

        //限制价格输入的大小 @jinrong 
        var val = [
            {min_val:0,max_val:0},
            {min_val:1,max_val:99},
            {min_val:199,max_val:999},
            {min_val:4999}
        ]
        $(".gift-price").keyup(function(){
            if($(this).val() < val[$scope.model.category].min_val){
                $(this).val(val[$scope.model.category].min_val)
            }else if($(this).val() > val[$scope.model.category].max_val){
                $(this).val(val[$scope.model.category].max_val)
            }
        })
        $(".category").mouseup(function(){
            if($(".gift-price").val() < val[$scope.model.category].min_val){
                $(".gift-price").val(val[$scope.model.category].min_val)
            }else if($(".gift-price").val() > val[$scope.model.category].max_val){
                $(".gift-price").val(val[$scope.model.category].max_val)
            }
        })
    }
]);