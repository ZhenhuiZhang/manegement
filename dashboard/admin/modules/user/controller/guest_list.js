framework.angular.controllers.controller("guest-list", ['$scope', 'commonRES',
    function($scope, service) {
        var url = framework.getFinalURL('guest/find', 'api/user.json');
        $scope.gridUrl = url; //这里演示的是从Angular的controller中输入url参数，在HTML中也是可以的     LinWenLong on 20130911
        $scope.COUNTRY_LIST = [{value:"-all-(Location)",text:""}];
        COUNTRY_LIST.forEach(function(ele){
            $scope.COUNTRY_LIST.push({value:ele,text:ele})
        })

        $scope.device_Renderer = function(dataItem) {
            var result = '';
            if(dataItem.platform)result += 'os_platform:'+ dataItem.platform +'<br>'         //手机系统平台 
            if(dataItem.app_version)result += 'app_version:'+ dataItem.app_version +'<br>'         //App 版本号
            return result;
        }

        $scope.else_Renderer = function(dataItem) {
            var result = '';
            if(dataItem.referer)result += 'referer:'+ dataItem.referer +'<br>'         
            if(dataItem.landing_page)result += 'landing_page:'+ dataItem.landing_page +'<br>'  
            if(dataItem.channel)result += 'channel:'+ dataItem.channel +'<br>'  
            if(dataItem.imei_id)result += 'imei_id:'+ dataItem.imei_id +'<br>'  
            if(dataItem.mac)result += 'mac:'+ dataItem.mac +'<br>'  
            if(dataItem.pseduo_id)result += 'pseduo_id:'+ dataItem.pseduo_id +'<br>' 
            if(dataItem.gsf_id)result += 'gsf_id:'+ dataItem.gsf_id +'<br>'   
            if(dataItem.query_key)result += 'query_key:'+ dataItem.query_key +'<br>'    
            return result;
        }
    }
]);