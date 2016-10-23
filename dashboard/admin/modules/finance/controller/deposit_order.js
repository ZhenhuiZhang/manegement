framework.angular.controllers.controller("deposit-order", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        $scope.model = {};
        $scope.model.order_ids = [];
        $scope.edit = false;
        if (location.search) {
            service.get({
                api: 'finance',
                method: 'depositFindOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.edit = true;
                $scope.model=datas.body;
            })
        }

        $scope.checkOrder=function(idx,$event){
           service.get({
                api: 'payItem',
                method: 'findOne',
                order_id: $scope.model.order_ids[idx].order_ids
            }, function (datas) {
                console.log(datas)
                if(datas.body==null){
                    $($event.target).parent().siblings(".alert").show();
                    $($event.target).parent().siblings(".alert").text('order:'+ $scope.model.order_ids[idx].order_ids +',not found')
                }else{
                    $($event.target).parent().siblings(".alert").hide();
                }
            })
        }

        //添加操作对象输入行
        $scope.addEditorItem=function(target){
            $scope.model.order_ids.push({order_ids:""})          
        }

        //删除操作对象输入行
        $scope.minusEditorItem=function(idx){
           $scope.model.order_ids.splice(idx,1);
        }

        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            //id号不能为空
            if($scope.model.order_ids.length==0||_.findKey($scope.model.order_ids,{order_ids:""}))return alert("Order id should not be empty!")
            var params = {
                order_ids : $scope.model.order_ids,
                user : $scope.USERNAME,
                type :  'checking',
                remark : $scope.model.remark
            }
            console.log(params)
            service.save({
                    api: 'finance',
                    method: 'orderCheck'
                }, 
                params,
                function (result) {
                    if (result.code == 0) {
                        alert('submit ok.');
                        console.log(result)
                        var failedText="";
                        console.log()
                        if(result.body.failed.length!=0){
                            result.body.failed.forEach((item,index)=>{
                                if(item.user_id)failedText+=(index+1)+".payItem:"+item.order_id+".User:"+item.user_id+",result:"+item.result+"</br>"
                                else failedText+=(index+1)+".payItem:"+item.order_id+",result:"+item.result+"</br>"
                            })
                            $('#modal-title').text("Failed Result")
                            $('#modal-body').html(failedText)
                            $('#modal-submit').hide();
                            $('#main-modal').modal('show');
                            $('.modal-footer').find('button').on("click",function(){
                                location.href = 'deposit_list.html';
                            })
                        }else{
                            alert("submit ok!")
                            location.href = 'deposit_list.html';
                        }
                        
                    }else{
                        alert("error:"+result.message);
                    }
                })
        }
    }
]);
