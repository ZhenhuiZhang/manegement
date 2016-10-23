framework.angular.controllers.controller("weekly-gift-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
    /*初始化数据 START*/
        $scope.COUNTRY_LIST = [];
        $scope.GIFT_LIST = [];
        $scope.MEDAL_LIST = [];
        COUNTRY_LIST.forEach(function(ele){
            $scope.COUNTRY_LIST.push({value:ele,text:ele})
        })

        $scope.model = {
            anchors_reward : [],
            users_reward: []
        }

        //获取enable礼物列表
        service.get({
                api: 'gift',
                method: 'find',
                limit: 100,
                status:10
            }, function (datas) {
                datas.body.models.forEach(function(ele){
                     $scope.GIFT_LIST.push({value:ele.gift_id,text:ele.gift_id+"("+ele.name+")"})
                })
            });
            
        //获取enable礼物列表
        service.get({
                api: 'medal',
                method: 'list',
                limit: 100,
                status:10
            }, function (datas) {
                datas.body.models.forEach(function(ele){
                     $scope.MEDAL_LIST.push({value:ele.medal_id,text:ele.medal_id+"("+ele.name+")"})
                })
            });

        //时间选择
        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
        var checkin = $('.dpd1').datepicker({
            onRender: function(date) {
                return true 
            }
        }).on('changeDate', function(ev) {
                var newDate = moment(ev.date)
                $scope.model.cycle = newDate.format("YYYY/MM/DD")
                //提示周期
                $(".Cycle").show()
                $(".Cycle").html("<strong>Cycle：</strong>"+$scope.genWeeklyCycle($scope.location,newDate.format("YYYY-MM-DD HH:mm:ss")))
                checkin.hide();
            }).data('datepicker');

    /*初始化数据 END*/
        
    /*方法定义 START*/
        //添加操作对象输入行
        $scope.addEditorItem=function(name,target){
            $scope.model[name].push({medal_id:""})          
        }

        //删除操作对象输入行
        $scope.minusEditorItem=function(name,target){
           $scope.model[name].pop()     
        }

        /**
         * 计算当前属于哪一个周期,仅内部使用
         */
        $scope.genWeeklyCycle=function(location, instance, relative) {
            let timezone = 'Asia/Jakarta';
            //因为第一期全部都是以印尼国家时间。
            // if (locationConfigs.locations[location]){
            //     timezone = locationConfigs.locations[location].timezone;
            // }

            let tz = moment.tz(instance, timezone);
            if (tz.days() == 0) { //周日，需要往后退6日
                tz.add(-6, 'day');
            } else if (tz.days() > 1){
                tz.add(1 - tz.days(), 'day');
            }
            //计算相对值
            if (!isNaN(relative) && relative != 0){
                tz.add(7 * relative, 'day');
            }
            tz.hours(0);
            tz.minutes(0);
            tz.seconds(0);
            tz.milliseconds(0);
            return "weekly_" + tz.format('YYYYMMDD');
        }

    /*方法定义 END*/
        

        if (location.search) {
            service.get({
                api: 'rank',
                method: 'giftRankConfigFindOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                $scope.model.cycle = moment($scope.model.cycle.substr(3),"YYYYMMDD").format("YYYY/MM/DD")
            });
        }


        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            $scope.model.anchors_reward.forEach(item=>{
                if(item.$$hashKey) delete item.$$hashKey
            })
            $scope.model.users_reward.forEach(item=>{
                if(item.$$hashKey) delete item.$$hashKey
            })
            var params = _.clone($scope.model);
            params.cycle = moment(params.cycle,"YYYY/MM/DD").format("YYYY-MM-DD HH:mm:ss");
            service.save({
                api: 'rank',
                method: 'giftRankConfigCreateOrUpdate', 
            }, {model:params}, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    if( $scope.model._id == "update")
                        location.reload();
                    else
                        location.href = 'weekly_gift_list.html';
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
        }

        
    }
]);