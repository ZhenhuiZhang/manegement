framework.angular.controllers.controller("banner-detail", ['$scope', 'commonRES',
function($scope, service) {
    
    $(".form_datetime").datetimepicker({
        format: "yyyy-mm-dd hh:ii:ss Z",
        forceParse: true,
        initialDate: new Date(),
        todayBtn: true,
        clearBtn: true,
        todayHighlight: true,
        autoclose: true,
        timezone: 'CST'
    });
    $(".icon-calendar").click(function(){
        $(this).parent().parent().prev().datetimepicker('show');
    });
    if(location.search){
        service.get({
            api:'banner',
            method:'findOne',
            _id:location.search.split('=')[1]
        }, function (data) {
            $scope.model = data.body;
            if ($scope.model.by_week) {
                var by_week = $scope.model.by_week;
                $scope.model.by_week = {};
                if (by_week.forEach) {
                    by_week.forEach(function(x) {
                        $scope.model.by_week[x] = true;
                    });
                }
            }
            // if ($scope.model.by_date){
            //     if ($scope.model.by_date.start_time) {
            //         var start = new Date($scope.model.by_date.start_time);
            //         console.log(start)
            //         $('#effect_date_start').datetimepicker('setStartDate', start)
            //     }
            //     if ($scope.model.by_date.end_time) {
            //         $('#effect_date_end').datetimepicker('setStartDate', new Date($scope.model.by_date.end_time))
            //     }
            // }

        })
    }

    $scope.save = function(){
        if (!confirm('Sure to submit?')) {
            return false;
        }
        var params = $.extend({}, $scope.model);
        if(params.by_week) {
            var by_week = [];
            for (var day in params.by_week) {
                var i = parseInt(day);
                if (!isNaN(i) && params.by_week[day]){
                    by_week.push(i);
                }
            }
            params.by_week = by_week;
        }

        var $imgFile = $('#bannerImgFile');
        
        var file = $imgFile && $imgFile[0] && $imgFile[0].files[0] ? $imgFile[0].files[0] : undefined;

        var callback = function (uploadResult) {
            console.log('upload result:', uploadResult);
            if (uploadResult && uploadResult.ret) {
                params.pic = uploadResult.info.md5;
            }
            service.save({
                api: 'banner',
                method: 'createOrUpdate'
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok.');
                    location.href = 'banner.html';
                } else {
                    alert(result.message);
                }
            })
            ;
        }
        if (file) {
            service.uploadImg(file, 'file', callback);
        } else {
            callback();
        }
    }        
}])