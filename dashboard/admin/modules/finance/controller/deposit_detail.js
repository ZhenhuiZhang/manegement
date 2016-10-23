framework.angular.controllers.controller("deposit-detail", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        $scope.model = {};
        $scope.model.operation = [];
        $scope.edit = false;
        if (location.search) {
            service.get({
                api: 'finance',
                method: 'depositFindOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.edit = true;
                $scope.model=datas.body;
                if(['employee','IDemployee'].indexOf($scope.model.type)>-1 && $scope.model.is_checkOff==0)$scope.chargeOff=true;
            })
        }

        $scope.checkUser=function(idx,$event){
           service.get({
                api: 'user',
                method: 'findOne',
                user_id: $scope.model.operation[idx].user_id
            }, function (datas) {
                if(datas.code==0){
                    $($event.target).parent().siblings(".alert").hide();
                }else if(datas.code==1){
                    $($event.target).parent().siblings(".alert").show();
                    $($event.target).parent().siblings(".alert").text('user:'+ $scope.model.operation[idx].user_id +',not found')
                }else{
                    $($event.target).parent().siblings(".alert").show();
                    $($event.target).parent().siblings(".alert").text('find user error:'+ datas.message)
                }
            })
        }

        //添加操作对象输入行
        $scope.addEditorItem=function(target){
            $scope.model.operation.push({ user_id:"", coin: "" })          
        }

        //删除操作对象输入行
        $scope.minusEditorItem=function(idx){
           $scope.model.operation.splice(idx,1);
        }

        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            if($scope.model.operation.length==0||_.findKey($scope.model.operation,{user_id:""})||_.findKey($scope.model.operation,{coin:""}))return alert("User id or coin should not be empty!")
            var params = {
                operation : $scope.model.operation,
                user : $scope.USERNAME,
                type :  $scope.model.type,
                remark : $scope.model.remark
            }
            console.log(params)
            service.save({
                    api: 'finance',
                    method: 'depositCreate'
                }, 
                params,
                function (result) {
                    if (result.code == 0) {
                        alert('submit ok.');
                        handlerResult(result)
                    }else{
                        alert("error:"+result.message);
                    }
                })
        }

        $scope.chargeOffsave = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = {
                user : $scope.USERNAME,
                _id :  $scope.model._id
            }
            console.log(params)
            service.save({
                    api: 'finance',
                    method: 'chargeOff'
                }, 
                params,
                function (result) {
                    if (result.code == 0) {
                        alert('submit ok.');
                        handlerResult(result)
                    }else{
                        alert("error:"+result.message);
                    }
                })
        }

        function handlerResult(result){
            var failedText="";
            if(result.body.failed.length!=0){
                result.body.failed.forEach((item,index)=>{
                    failedText+=(index+1)+".User:"+item.user_id+",result:"+item.result+"</br>"
                })
                $('#modal-title').text("Failed Result")
                $('#modal-body').html(failedText)
                $('#modal-submit').hide();
                $('#main-modal').modal('show');
                $('.modal-footer').find('button').on("click",function(){
                    location.href = 'deposit_list.html';
                })
            }else{
                location.href = 'deposit_list.html';
            }
        }
    }
]);

