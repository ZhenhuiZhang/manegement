framework.angular.controllers.controller("push-new-user", ['$scope', 'commonRES', '$rootScope',
    function ($scope, service, $rootScope) {
        $scope.country_list = COUNTRY_LIST
        $scope.edit =false;
        $scope.model = {
            contents:[],
            platforms:[],
            user_range:{},
            locations:[]
        }
        //copy编辑跳转
        // console.log($scope.model =JSON.parse(localStorage["push_copy_model"]))
        if(localStorage["push_copy_model"]){
            $scope.model = _.merge($scope.model,JSON.parse(localStorage["push_copy_model"]))
            console.log($scope.model)
            localStorage.removeItem("push_copy_model");
        }
        $scope.model.push_attr = {"oper_times":1,"expect_nums":1};
        $scope.currenttime =  1;
        //初始化时间插件
       //日期插件 
        $('.timepickerStart').timepicker({
            autoclose: true,
            minuteStep: 10,
            showSeconds: false,
            showMeridian: false
        });

        $('.timepickerEnd').timepicker({
            autoclose: true,
            minuteStep: 10,
            showSeconds: false,
            showMeridian: false
        });

        //发送请求获取主播信息,并将信息存储进model中
        if(location.search){
            service.get({
                api:'push',
                method:'findOne',
                _id:location.search.split('=')[1]
            }, function (data) {
                $scope.model = data.body;
                // $scope.model.target = 3;
                if($scope.model.push_attr.cur_oper_time == $scope.model.push_attr.oper_times) $scope.notpush = true;
                $scope.isshcedule =moment($scope.model.shcedule_push_time).valueOf()>moment().valueOf()?true:false;
                if($scope.model.shcedule_push_time)$scope.model.pushtime=moment($scope.model.shcedule_push_time).format("YYYY-MM-DD HH:mm");
                $scope.model.now=$scope.model.is_push_now;
                $scope.currenttime = $scope.model.push_attr.cur_oper_time + 1;
            });
        }

        //日历插件
        $(".date_time").datetimepicker({
            format: "yyyy-mm-dd hh:ii",
            //forceParse: true,
            initialDate: new Date(),
            todayBtn: false,
            clearBtn: true,
            todayHighlight: true,
            autoclose: true
        });


        $scope.target_change = function () {
            if (parseInt($scope.model.target) != 3) {
                $scope.model.user_range.date_start=""
                $scope.model.user_range.date_start=""
                $('[name=user_range]').val("")
            }
        }

        Array.prototype.remove = function(val) { 
            var index = this.indexOf(val); 
            if (index > -1) { this.splice(index, 1); } 
        };
        $scope.locatonsHandleCheck = function($event){
            if($scope.model.locations.indexOf($($event.target).val()) > -1){
                $scope.model.locations.remove($($event.target).val())
            }else{
                $scope.model.locations.push($($event.target).val())
            }
        }

        $scope.platforms = ['ios', 'android']
        $scope.platformHandleCheck = function($event){
            if($scope.model.platforms.indexOf($($event.target).val()) > -1){
                $scope.model.platforms.remove($($event.target).val())
            }else{
                $scope.model.platforms.push($($event.target).val())
            }
        }

        $scope.now_change = function () {
            $scope.model.pushtime = "";
        }

        $scope.time_change = function () {
            $scope.model.now = 0;
        }

        $scope.addEditor = function (target) {
            //显示输入框
            $scope.edit=true;
        }
        //添加content输入行
        $scope.addEditorItem = function (target) {
            if ($scope.content && $scope.content_type && $scope.title)
                $scope.model.contents.push({ title: $scope.title, content: $scope.content, content_type: $scope.content_type })
            else return alert("Content Type/Content/Title should not be empty!")
            $scope.edit=false;
            $scope.title="";
            $scope.content="";
            $scope.content_type="";
        }

        //删除content输入行
        $scope.minusEditorItem = function (idx) {
            $scope.model.contents.splice(idx, 1);
        }

        // 点击日历图标调用日历插件
        $(".date-btn").click(function () {
            $(this).prev().datetimepicker('show')
        });

        // 删除记录
        $scope.deletePush = function() {
            if (confirm('Are you sure to delete?')) {
                service.save({
                    api: 'push',
                    method: "delete",
                },{_id:location.search.split('=')[1]}, function(result) {
                    if (result.code == 0) {
                        alert('delete ok,'  );
                        location.href = '../push/push_list.html';
                    } else {
                        alert('delete fail,' + result.respDesc);
                    }
                });
            }
        }

        $scope.submit = function () {
            if($scope.currenttime>$scope.model.push_attr.oper_times){
                alert("error:operation times is above setup times!");
                return false;
            }
            //user_range赋值
            if (Number($scope.model.target) == 1) {
                $scope.model.user_range.date_start = moment().startOf('day').format();
                $scope.model.user_range.date_end = moment().startOf('day').add(1, 'day').format();
            } else if (Number($scope.model.target) == 2) {
                $scope.model.user_range.date_start = "";
                $scope.model.user_range.date_end = "";
            }

            if ($scope.model.now == 1) {
                $scope.model.pushtime = ""
            }

            var method;
            if(location.search){
                method = 'push';
                var params = {
                    "_id":location.search.split('=')[1],"contents": $scope.model.contents,"cur_oper_time": $scope.model.push_attr.cur_oper_time, "is_push_now": $scope.model.now,
                     "shcedule_push_time": $scope.model.pushtime,"history_contents" : $scope.model.history_contents,"locations": $scope.model.locations,"platforms": $scope.model.platforms
                };
            }else{
                method = 'create';
                var params = {
                    "contents": $scope.model.contents, "date_start": $scope.model.user_range.date_start, "date_end": $scope.model.user_range.date_end,"shcedule_push_time": $scope.model.pushtime,
                    "expect_nums": $scope.model.push_attr.expect_nums, "oper_times": $scope.model.push_attr.oper_times, "cur_oper_time": 0,"is_push_now": $scope.model.now,
                    "target": $scope.model.target,"locations": $scope.model.locations,"platforms": $scope.model.platforms,"name": $scope.model.name
                    // , "is_push_now": $scope.model.now,
                    // "shcedule_push_time": $scope.model.pushtime
                };
            }
            
            console.log(params)
            service.save({
                api: 'push',
                method: method
            }, params, function (datas) {
                if (datas.code == 0) {
                    alert("request send!");
                    location.href = '../push/push_list.html';
                } else {
                    alert(result.message);
                }
            });
        }
    }])