framework.angular.controllers.controller("top-detail", ['$scope', 'commonRES','$filter',
function($scope, service, $filter) {
    $scope.country_list = COUNTRY_LIST
    $scope.model={};
    $scope.week_time = [];
    $scope.week=[];
    $scope.repeatRecommend=false;
    var weeks = ['Sunday', 'Monday', 'Tuesday',  'Wednesday','Thursday', 'Friday', 'Staurday'];
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

    Array.prototype.remove = function(val) { 
        var index = this.indexOf(val); 
        if (index > -1) { this.splice(index, 1); } 
    };

    $scope.model.locations = []
    
    $scope.handleCheck = function($event){
        if($scope.model.locations.indexOf($($event.target).val()) > -1){
            $scope.model.locations.splice($scope.model.locations.indexOf($($event.target).val()),1)
        }else{
            $scope.model.locations.push($($event.target).val())
        }
    }

    //初始化时间插件
    window.prettyPrint && prettyPrint();

    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
   //日期区间
    var checkin = $('.dpd1').datepicker({
        onRender: function(date) {
            return date.valueOf() < now.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function(ev) {
            if(!$scope.model.by_week_date){
                $scope.model.by_week_date={}
            }
            if (ev.date.valueOf() > checkout.date.valueOf()) {
                var newDate = new Date(ev.date)
                newDate.setDate(newDate.getDate() + 1);
                checkout.setValue(newDate);
            }
            var newDate = new Date(ev.date)
            $scope.model.by_week_date.start = moment(newDate.setDate(newDate.getDate())).format("MM/DD/YYYY");
            if($(".dpd1").val() == $(".dpd2").val()){
                $scope.$apply(function() {
                    $scope.week.splice(0,$scope.week.length);
                     $scope.week[parseInt(new Date($(".dpd1").val()).getDay())]=parseInt(new Date($(".dpd1").val()).getDay())
                });
            }
            checkin.hide();
            $('.dpd2')[0].focus();
        }).data('datepicker');

    var checkout = $('.dpd2').datepicker({
        onRender: function(date) {
            return date.valueOf() <= checkin.date.valueOf() ? 'disabled' : '';
        }
    }).on('changeDate', function(ev) {
            if(!$scope.model.by_week_date){
                $scope.model.by_week_date={}
            }
            var newDate = new Date(ev.date)
            $scope.model.by_week_date.end = moment(newDate.setDate(newDate.getDate() + 1)).format("MM/DD/YYYY");
            if($(".dpd1").val() == $(".dpd2").val()){
                $scope.$apply(function() {
                    $scope.week.splice(0,$scope.week.length);
                    $scope.week[parseInt(new Date($(".dpd1").val()).getDay())]=parseInt(new Date($(".dpd1").val()).getDay())
                });
            }
            checkout.hide();
        }).data('datepicker');

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


    //兼容jquery1.9之前的版本
    jQuery.browser={};(function(){jQuery.browser.msie=false; jQuery.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)./)){ jQuery.browser.msie=true;jQuery.browser.version=RegExp.$1;}})();
    
    // 点击日历图标调用日历插件
    $(".date-btn").click(function(){
        $(this).prev().datetimepicker('show')
    });
    
    //当日历有值时，星期没值
    $scope.date_change = function(){
        $(".date_time").each(function(index) {
            if($(this).val())
            {   
                $scope.week.splice(0,$scope.week.length);
                $scope.week_time.splice(0,$scope.week_time.length);
                $scope.model.by_week_date.end = "";
                $scope.model.by_week_date.start = "";
                $(".dpd1").val("");
                $(".dpd2").val("");
            }
        })
    }

////是否周期重复选项
    $scope.changeRecommen = function(){
        $scope.repeatRecommend = false;
    }

    $scope.changeReRecommen =function(){
        $scope.repeatRecommend = true;
    }

    //当星期有值时，日历没值
    $scope.week_change = function () {
        if($scope.week.length!=0 || $scope.week || $scope.model.by_date || ($(".dpd1").val() || $(".dpd2").val()))
        {   
            $scope.model.by_date.start_time = "";
            $scope.model.by_date.end_time = "";
        }
    }



    //添加时间输入行
    $scope.addEditorItem=function(target){
        if ($scope.start_time && $scope.end_time) {
            var startHour=parseInt($scope.start_time.split(":")[0]);
            var endhour=parseInt($scope.end_time.split(":")[0]);
            var startMinute=parseInt($scope.start_time.split(":")[1].split(" ")[0]);
            var endMinute=parseInt($scope.end_time.split(":")[1].split(" ")[0]);
            if (startHour <= endhour || (startHour == endhour && startMinute <= endMinute)){
                $scope.week_time.push({ start_time: $scope.start_time, end_time: $scope.end_time })
            }else{
                alert("(Time Interval)Start time should be above end time!")
            }            
        } else {
            alert("(Time Interval)Time should not be empty!")
        } 
    }

    //删除时间输入行
    $scope.minusEditorItem=function(idx){
        $scope.week_time.splice(idx,1);
    }
       
    //上传文件有值时，隐藏clean按钮
    $("#anchorImgFile").change(function(event){
        if($(this).val())
        {
            $(".clean").css("display","none");
        }

        //限制文件大小
        var maxSize = 300*1024; //后续只要修改该值
        console.log($(this)[0].files[0].size);
        if($(this)[0].files[0].size>maxSize){
            alert('File size exceeds the limit!');
            $('.remove').trigger('click');
        }
    })
    
    //点击clean按钮时清除recommend_pic
    $(".clean").click(function(event){
        if ($scope.model) {
            $scope.model.pic = "";
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
    
    //发送请求获取主播信息,并将信息存储进model中
    if(location.search){
        service.get({
            api:'banner',
            method:'findOne',
            _id:location.search.split('=')[1]
        }, function (data) {
            $scope.model = data.body;        
            $scope.platforms = {}
            var platform_att = typeof($scope.model.platform)=='object'?$scope.model.platform:[$scope.model.platform]        //兼容旧类型  
            platform_att.forEach(function(item) {
                $scope.platforms[item] = item    
            })

            //初始化一个week，专门用于保存by_week的信息
            if($scope.model.by_week_date){
                $scope.repeatRecommend = true;
                $scope.model.by_week_date.start=moment($scope.model.by_week_date.start_date).format("MM/DD/YYYY")
                $scope.model.by_week_date.end=moment($scope.model.by_week_date.end_date).subtract(1, 'days').format("MM/DD/YYYY")
            }
    
            for(var i = 0 ; i < $scope.model.by_week.length ; i++)
            {   $scope.week_time[i]={}
                $scope.week[parseInt(($scope.model.by_week[i].start_time) / 10000)] = parseInt(($scope.model.by_week[i].start_time) / 10000);
                $scope.week_time[i].start_time =parseInt((($scope.model.by_week[i].start_time) % 10000) /60) + ":" + ((($scope.model.by_week[i].start_time) % 10000) %60);
                $scope.week_time[i].end_time =parseInt((($scope.model.by_week[i].end_time) % 10000) /60) + ":" + ((($scope.model.by_week[i].end_time) % 10000) %60);
            }
            $scope.week_time=_.sortBy(_.uniqWith($scope.week_time, _.isEqual), ['start_time','end_time'], ['desc', 'desc']);
             //将获取回来的by_week进行解析，输出成 sunday 00:00~10:00这种格式
            if($scope.model.by_week && $scope.model.by_week.length > 0)
            {
                var temp = [];
                for (var i = 0; i < $scope.model.by_week.length; i++)
                {
                    var recommend_week = {};
                    recommend_week.day = parseInt(($scope.model.by_week[i].start_time) / 10000);
                    recommend_week.day = weeks[recommend_week.day];
                    recommend_week.start_time = parseInt((($scope.model.by_week[i].start_time) % 10000) /60) + ":" + ((($scope.model.by_week[i].start_time) % 10000) %60);
                    recommend_week.end_time = parseInt((($scope.model.by_week[i].end_time) % 10000) /60) + ":" + ((($scope.model.by_week[i].end_time) % 10000) %60);
                    temp[i] = recommend_week.day + " " + recommend_week.start_time + "~" + recommend_week.end_time;
                    $scope.model.by_week[i] = temp[i];
                }
                //$scope.model.by_week = temp
            }

        });
    }

    $scope.save = function(){ 
        // if (!confirm('Sure to submit?')) {
        //     return false;
        // }
        //var params = $.extend({}, $scope.model);
        if($scope.week){
            $scope.week = $scope.week.filter(function (value, index, ar) {
                if (value != "null") return true;
                else return false;
            });
        }
        
        //限制by_date,仅当start_time以及end_time都有值或空值时才可提交
        if($scope.model.by_date)
        {
            if($scope.model.by_date.start_time == null)
                {$scope.model.by_date.start_time = "";}
            if($scope.model.by_date.end_time == null)
                {$scope.model.by_date.end_time = "";}
        }
        else
        {
            $scope.model.by_date = {};
            $scope.model.by_date.start_time = "";
            $scope.model.by_date.end_time = "";
        }

        if(!$scope.model.by_week_date){
            $scope.model.by_week_date = {};
        }
        
        

        //by_date或by_week必须二选一填写
        if( ($scope.model.by_date.start_time =="" && $scope.model.by_date.end_time =="" ) &&  $scope.week.length==0)
        {
            alert("please complete the form");
            return false;
        }
              
        //by_week与by_date的相互限制
        if($scope.model.by_date.start_time !="" && $scope.model.by_date.end_time == "")
        {
            alert("please complete the form")
            return false;
        }
        else if($scope.model.by_date.start_time =="" && $scope.model.by_date.end_time != "")
        {
            alert("please complete the form")
            return false;
        }
        else if($scope.week && $scope.week.length!=0)
        {   
            if( ($scope.week.length==0 || $scope.week_time.length==0) && ($(".dpd1").val() =="" && $(".dpd1").val() ==""))
            { 
                alert("please complete the form")
                return false;
            }
            if($scope.week.length!=0 && $scope.week_time.length==0){
                alert("please press the 'add' button to add Time Interval!")
                return false;
            }
        }
        //获取日期，并判断日期的合法性
        if($(".dpd1").val() !="" && $(".dpd2").val() !=""){
            $scope.model.by_week_date.start_date = new Date($(".dpd1").val());
            $scope.model.by_week_date.end_date = new Date(new Date($(".dpd2").val()).getTime() + 24*60*60*1000);
            if ($scope.model.by_week_date.start_date > $scope.model.by_week_date.end_date.getTime() - 24 * 60 * 60 * 1000) {
                    alert("(Date Interval)Start date should not above end date!")
                    return false;
            }
        }else{
            $scope.model.by_week_date.start_date = "";
            $scope.model.by_week_date.end_date = "";
        }
        
        
        //add主播时，要初始化_id并且传递一个空值
        if(!$scope.model._id) $scope.model._id = "";
        if(!$scope.model.by_week) $scope.model.by_week = [];
        if($scope.model.by_date.start_time!="") $scope.model.by_week_date={}
        //如果没有填platform_version则，给个空字符串;
        if(!$scope.model.platform_version)$scope.model.platform_version = ''; 

        var platforms = [];
        
        Object.getOwnPropertyNames($scope.platforms).forEach(function(item) {
            if($scope.platforms[item]){
                platforms.push($scope.platforms[item])
            }
        })
        $scope.model.platform = platforms.join(',');

        var params = {"_id":$scope.model._id,"platform":$scope.model.platform,"platform_version":$scope.model.platform_version,"by_date":$scope.model.by_date,"enable":$scope.model.enable,
                        "by_week_date":$scope.model.by_week_date,"by_week":$scope.model.by_week,"weight":$scope.model.weight,"pic":$scope.model.pic,"content":$scope.model.content,
                        "banner_type":"top","title":$scope.model.title, content_type:$scope.model.content_type
                    };
        
        //week_temp为临时对象，专门用于week的时间转化（单个|暂时）
        params.by_week = [];
        if($scope.week_time &&$scope.week_time.length!=0 && $scope.week )
        {
            for(var i=0;i<$scope.week_time.length;i++){
                var week_temp = {};
                week_temp.start_time_hour = $scope.week_time[i].start_time.split(":")[0];
                week_temp.start_time_minute = $scope.week_time[i].start_time.split(":")[1].split(" ")[0];
                
                week_temp.end_time_hour = $scope.week_time[i].end_time.split(":")[0];
                week_temp.end_time_minute = $scope.week_time[i].end_time.split(":")[1].split(" ")[0];
                $scope.week.forEach(function (item) {
                    if (item!="null") {
                        week_temp.start_time = parseInt(item) * 10000 +  parseInt(week_temp.start_time_hour) * 60 + parseInt(week_temp.start_time_minute);
                        week_temp.end_time = parseInt(item) * 10000 +  parseInt(week_temp.end_time_hour) * 60 + parseInt(week_temp.end_time_minute);
                        params.by_week.push({"start_time":week_temp.start_time,"end_time":week_temp.end_time}); 
                    }
                })
            }
        }
        else
        {
            params.by_week = [];
        }
        //数组去重
        console.log(params)
        params.by_week = _.uniqWith(params.by_week, _.isEqual)
        //将platform转化为数组
        // if(params.platform) {
        //     console.log(params.platform);
        //     for (var platform in params.latform) {
        //         if (params.platform[platform] == true)
        //         {
        //             params.platform[platform] = 1
        //         }
        //         else
        //         {
        //             params.platform[platform] = 0;
        //         }
        //     }
        //     console.log(params.platform);
        // }
       
        
        // if(params.is_recommend == "Yes")
        // {
        //     params.is_recommend = 1;
        // }
        // else
        // {
        //     params.is_recommend = 0;
        // }

        var $imgFile = $('#anchorImgFile');
        var file = $imgFile && $imgFile[0] && $imgFile[0].files[0] ? $imgFile[0].files[0] : undefined;
        var callback = function (uploadResult) {
            console.log('upload result:', uploadResult);
            if (uploadResult && uploadResult.ret) {
                params.pic = uploadResult.info.md5;
            }
            if($scope.model.locations){
                params.locations = $scope.model.locations
            }
            service.save({
                api: 'banner',
                method: 'createOrUpdate'
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok.');
                    location.href = 'top.html';
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