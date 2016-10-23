framework.angular.controllers.controller("weekly-gift-list", ['$scope', 'commonRES','$filter', '$rootScope',
    function($scope, service, $filter, $rootScope) {
        var url = framework.getFinalURL('rank/giftRankConfigFind','',false);
        $scope.gridUrl = url

        $scope.edit_Renderer = function(dataItem){
            var result = '<a href="weekly_gift_detail.html?_id='+ dataItem._id +'" class="icon-edit-sign">Edit</a>&nbsp&nbsp';
            result += '<a href="#" class="trigger-btn icon-bolt" data-cycle=' + dataItem.cycle +' data-location=' + dataItem.location +'>Trigger</a>';
            return result;
        }

        $scope.cycle_done_Renderer = function(dataItem){
            var status = ['Not started',' Finish', ' Getting Ready']
            if(dataItem.cycle_done == 0) return '<span class="label label-success">'+status[dataItem.cycle_done]+'</span>'
            else if(dataItem.cycle_done == 1) return '<span class="label label-default">'+status[dataItem.cycle_done]+'</span>'
            else return  '<span class="label label-danger">'+status[dataItem.cycle_done]+'</span>' 
            
        }
        
        // 周榜接口
        $scope.trigger = function(cycle,country) {
                if (confirm('Are you sure to execute?')) {
                    service.save({
                        api: 'rank',
                        method: "triggerEndWeeklyGiftRank",
                    },
                    {
                        cycle : cycle,
                        location : country
                    }, function(result) {
                        if (result.code == 0) {
                            alert('trigger ok!');
                            location.reload();
                        } else {
                            alert('delete fail,' + result.respDesc);
                        }
                    });
                }
        }


        $scope.onComplete = function (config) {
            $('.trigger-btn').on('click',function(){
                var cycle=$(this).attr("data-cycle");
                var location=$(this).attr("data-location");
                $scope.trigger(cycle,location);
            })
        }

    }
]);