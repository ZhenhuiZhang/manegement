framework.angular.controllers.controller("role-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        $scope.country_list = COUNTRY_LIST
        $scope.model={};
        $scope.model.location = []
    
        $scope.handleCheck = function($event){
            if($scope.model.location.indexOf($($event.target).val()) > -1){
                $scope.model.location.splice($scope.model.location.indexOf($($event.target).val()),1)
            }else{
                $scope.model.location.push($($event.target).val())
            }
        }
        var method = ""

        if (location.search) {
            service.get({
                api: 'permissionRole',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                console.log($scope.model)
            });

            method = "update"
        }else{
            $scope.model={} ;
            $scope.model.privilege_ids = [] ;
            method = "create"
        }

        service.get({
                api: 'permissionModules',
                method: 'find'
            },function(datas){
                //构造对象，将权限分级 @jinrong
                var ModuelsObj = Enumerable.From(datas.body.models)
                            .Where(item =>item.parentname == null)
                            .ToArray()
                ModuelsObj.forEach(function(element) {
                    var items = Enumerable.From(datas.body.models)
                            .Where(item =>item.parentname == element.name)
                            .ToArray()
                    var items2;
                    items.forEach(function(element) {
                        var items = Enumerable.From(datas.body.models)
                            .Where(item =>item.parentname == element.name)
                            .ToArray()
                        element.child = items;
                    }, this);
                    element.child = items;
                }, this);

                $scope.moduels= ModuelsObj
            })

        $("body").on("click",".open",function(){
            $("div.layer2").removeAttr("hidden")
            $("div.layer3").removeAttr("hidden")
            $("img").attr("src","../../../template_content/assets/advanced-datatable/examples/examples_support/details_close.png")
        })

        $("body").on("click",".btn-close",function(){
            $("div.layer2").attr("hidden","hidden")
            $("div.layer3").attr("hidden","hidden")
            $("img").attr("src","../../../template_content/assets/advanced-datatable/examples/examples_support/details_open.png")
        })

        $("body").on("click","img",function(){
            var myclass = $(this).attr("class")
            if($("div."+myclass).attr("hidden") != undefined){
                $("div."+myclass).removeAttr("hidden")
                $(this).attr("src","../../../template_content/assets/advanced-datatable/examples/examples_support/details_close.png")
            }
            else{
                $("div."+myclass).attr("hidden","hidden")
                $(this).attr("src","../../../template_content/assets/advanced-datatable/examples/examples_support/details_open.png")
            }
        });

        $("body").on("change","input[name=privilege_ids]",function(){
            if($(this)[0].checked){
                $scope.model.privilege_ids.push($(this).val())
            }else{
                $scope.model.privilege_ids.removeByValue($(this).val())
            }
        })

         $("body").on("change",".input1",function(){
             var element = $(this)
            var input2 = $(this).parent().parent().find(".input2")
            var input3 = $(this).parent().parent().find(".input3")
            input2.each(function(){
                $(this).prop("checked",element.prop("checked"))
                if($(this)[0].checked){
                    $scope.model.privilege_ids.push($(this).val())
                }else{
                    $scope.model.privilege_ids.removeByValue($(this).val())
                }
            })
            input3.each(function(){
                $(this).prop("checked",element.prop("checked"))
                if($(this)[0].checked){
                    $scope.model.privilege_ids.push($(this).val())
                }else{
                    $scope.model.privilege_ids.removeByValue($(this).val())
                }
            })
        });

        $("body").on("change",".input2",function(){
            var element = $(this)
            var input3 = $(this).parent().parent().find(".input3")
            input3.each(function(){
                $(this).prop("checked",element.prop("checked"))
                if($(this)[0].checked){
                    $scope.model.privilege_ids.push($(this).val())
                }else{
                    $scope.model.privilege_ids.removeByValue($(this).val())
                }
            })
        })

        Array.prototype.removeByValue = function(val) {
            for(var i=0; i<this.length; i++) {
                if(this[i] == val) {
                this.splice(i, 1);
                break;
                }
            }
        }

        setTimeout(function(){
            $scope.model.privilege_ids.forEach(function(element){
                $("input[value="+element+"]").attr("checked","checked")
            })
        },1000)
        
        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            var params = $.extend({}, $scope.model);
            console.log(params);
            service.save({
                api: 'permissionRole',
                method: method, 
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    if(method == "update")
                        location.reload();
                    else
                        location.href = 'role.html';
                } else {
                    console.log(result.message);
                }
                $rootScope.loading = false;
            });
        }
    }
]);