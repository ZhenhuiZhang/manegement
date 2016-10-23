framework.angular.controllers.controller("splash-screen-detail", ['$scope', 'commonRES','$filter',
function($scope, service, $filter) {
        $scope.country_list = COUNTRY_LIST
        $scope.model={
            effect_date:{
                start_time: moment().format("YYYY-MM-DD HH:mm"),
                end_time: moment().add(1,"months").format("YYYY-MM-DD HH:mm")
            },
            location : [],
            platform : [],
            user_type : [],
            isSkip : 0
        };
        $scope.durationEdit = false;
    
        //日历插件
        $(".date_time").datetimepicker({
            format: "yyyy-mm-dd hh:ii",
            //forceParse: true,
            initialDate: new Date(),
            todayBtn: true,
            clearBtn: true,
            todayHighlight: true,
            autoclose: true
        });
        // 点击日历图标调用日历插件
        $(".date-btn").click(function(){
            $(this).prev().datetimepicker('show')
        });

         if (location.search) {
            service.get({
                api: 'splash',
                method: 'findOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                console.log(datas)
                $scope.model=datas.body
            })
        }

        //上传文件有值时，隐藏clean按钮
        $("#anchorImgFile").change(function(event){
            if($(this).val())
            {
                $(".clean").css("display","none");
            }
        })
    
        //点击clean按钮时清除src
        $(".clean").click(function(event){
            if ($scope.model) {
                $scope.model.src = "";
            }
        })
        
        //remove按钮交互
        $(".remove").click(function(event){
            $(this).parent().parent().removeClass("fileupload-exists").addClass("fileupload-new");
            $(".fileupload-preview").find("*").remove();
            if((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0))
            {    // 此处判断是否是IE
                $('#anchorImgFile').replaceWith($('#anchorImgFile').clone(true));
            }
            else 
            {
                $('#anchorImgFile').val('');
            }
            $(".clean").css("display","inline-block");
        });

        $scope.handleCheckPlat = function($event){
            if($scope.model.platform.indexOf($($event.target).val()) > -1)
                $scope.model.platform.splice($scope.model.platform.indexOf($($event.target).val()),1)
            else
                $scope.model.platform.push($($event.target).val())
        }

        $scope.handleCheckUser = function($event){
            if($scope.model.user_type.indexOf($($event.target).val()) > -1)
                $scope.model.user_type.splice($scope.model.user_type.indexOf($($event.target).val()),1)
            else
                $scope.model.user_type.push($($event.target).val())
        }

        $scope.handleCheck = function($event){
            if($scope.model.location.indexOf($($event.target).val()) > -1)
                $scope.model.location.splice($scope.model.location.indexOf($($event.target).val()),1)
            else
                $scope.model.location.push($($event.target).val())
        }

        $scope.handleSrcChange = function($event){
            $scope.durationEdit = false;
            $scope.model.duration=0;
            $scope.model.src = "";
            $('#anchorImgFile').val('');
            $('.remove').trigger('click');   
        }

        $scope.handleSourseChange = function($event){
            if(['gif','mp4'].indexOf($scope.model.src.split('.').pop().toLowerCase())>-1){
                $scope.durationEdit = false;
                $scope.model.duration = 0
            }else{
                $scope.durationEdit = true
            }
        }


        
        $scope.save = function(){
            if(($scope.model.duration<1 || $scope.model.duration>10)&&$scope.durationEdit) return alert("Value of Duration should Between 1 and 10")
            if(moment($scope.model.effect_date.start_time).valueOf()>moment($scope.model.effect_date.end_time).valueOf()) return alert("Effect date:start time should not greater than end time")
            if($scope.model.src) $scope.model.src=encodeURIComponent($scope.model.src) 
            if($scope.model.href) $scope.model.href=encodeURIComponent($scope.model.href) 
            var $imgFile = $('#anchorImgFile');
            var file = $imgFile && $imgFile[0] && $imgFile[0].files[0] ? $imgFile[0].files[0] : undefined;

            var callback = function (uploadResult) {
                console.log('upload result:', uploadResult);
                if (uploadResult && uploadResult.ret) {
                    $scope.model.src = uploadResult.info.md5;
                }
                var params = {
                    "splash":$scope.model,
                };
                service.save({
                    api: 'splash',
                    method: 'createOrUpdate'
                }, params, function (result) {
                    if (result.code == 0) {
                        alert('submit ok.');
                        location.href = 'splash_list.html';
                    } else {
                        alert(result.message);
                    }
                })
            }

            if ($scope.model.content_type =='img' && file) {
                service.uploadImg(file, 'file', callback);
            } else {
                callback();
            }
        }
         
     
}])