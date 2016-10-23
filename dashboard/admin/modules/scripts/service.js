framework.angular.services.factory('commonRES', ['$resource', '$rootScope',
	function($resource, $rootScope) {
        var CONFIG = {
            EnableOperateLog: true,         //是否启用自动日志发送
            EnableSign: false,                 //是否启动sign签名(API对称加密)
            SecretKey: API_SECRET_KEY,
            ImgUploadServer: IMG_UPLOAD_SERVER // 图片上传服务
        }

        //将json转换为form data字符串
        var ToFormData = function(json){
            var form_data = "";
            for ( var key in json ) {
                if(typeof(json[key])=='object' ){
                    form_data += '&'+ key +'='+ JSON.stringify(json[key])
                }else{
                    // console.log('key',key,json[key])
                    form_data += '&'+ key +'='+ json[key] ;
                }
            }
            return form_data.substr(1);
        }

        //根据参数生成签名
        var CreateSign = function(paras){
            var token = '';
            var url_query = '';

            if( typeof(paras) == 'string'){
                var paras_str = paras;
                paras = {};
                var paras_str_arr = paras_str.split('&');
                for(var i in paras_str_arr){
                    var tmp = paras_str_arr[i].split('=');
                    paras[tmp[0]] = tmp[1];
                }
            }


            if(paras){
                var token_arr = [];
                for(var i in paras){
                    if(i=='api' || i=='method'){
                        continue;
                    }
                    url_query += '&'+ i +'='+ paras[i];
                    // token += para_json[i];
                    token_arr.push(i);
                    // console.debug(i,paras[i]);
                }
                token_arr.sort();
                token_arr.forEach(function(item){
                    token += paras[item];
                })
            }
            token = md5(CONFIG.SecretKey + token);      //依赖MD5
            return token;
        }

        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, { type: contentType });
            return blob;
        }
        function uploadImg(file, codetype, cb){
            file = file || this.file;
            codetype = codetype || 'file';
            if (!file) return;

            function onload(xhr) {
                if (xhr.status === 200) {
                    console.log('upload success', xhr.responseText);

                    if (typeof (cb) == 'function') {
                        try {
                            return cb(JSON.parse(xhr.responseText))
                        } catch (e) {
                            return cb()
                        }
                    }
                } else {
                    console.error('upload error', xhr);
                }
            }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', CONFIG.ImgUploadServer);
            //返回数据格式：{"ret":true,"info":{"md5":"a110d7ba63fd54788e963f20f52dc6ef","size":704980}}
            if (codetype == 'base64') {
                var blob = b64toBlob(file, 'image/png');
                xhr.setRequestHeader("Content-Type", "png");
                //上传完成后的回调函数
                xhr.onload = function () {
                    onload(xhr)
                };
                xhr.send(blob);

                //用于测试转码是否成功
                // var blobUrl = URL.createObjectURL(blob);
                // var img = document.createElement('img');
                // img.src = blobUrl;
                // document.body.appendChild(img);
            } else {
                // 检查是否支持FormData
                if (window.FormData) {
                    var formData = new FormData();      //兼容IE10+
                    formData.append('upload', file);
                    xhr.onload = function () {
                        onload(xhr)
                    };
                    xhr.send(formData);
                } else {
                    alert('请使用新版浏览器访问。IE10+ 或 升级新版chrome、firefox');
                }
            }
        }


		//创建base service
		var url = framework.getFinalURL(':api/:method', 'api/:method.json');
		var resource = $resource(url, {});
		var oldObj = null;

		var OperateLog = function (operation, content) {
			this.__log_user = $rootScope.USERNAME;
			this.__log_operation = operation;
			this.__log_submit_content = content;
            this.__log_origin_content = oldObj ? JSON.stringify(oldObj) : '';
		}


		var serviceObj = {
			get: function(params, callback) {
				//监控修改前后的初始值变化
				var successCallback = function(proj) {
					oldObj = angular.copy(proj.body); //此处需要深拷贝,否则是引用oldObj和newObj就是同一个数据了
					callback(proj);
				}
                if(CONFIG.EnableSign){
                    params.sign =  CreateSign(params);
                }
				resource.get(params, successCallback);
			},
			save: function(methodobj, params, callback, errorCallback) {
                var content = params;
                if(CONFIG.EnableOperateLog){
                    var log = new OperateLog(methodobj.api +'/'+ methodobj.method, JSON.stringify(content));
                    params.operate_log = log;
                }
                if(CONFIG.EnableSign){
                    params.sign =  CreateSign(params);
                }
                if(typeof(params)=='object'){
                    params = ToFormData(params);
                }
				resource.save(methodobj, params, callback, errorCallback);
			},
			del: function(methodobj,delIds, callback) {
                if(typeof(delIds)=='function') callback = delIds
				var myParams = {
					ids: delIds.toString()
				}
                if(CONFIG.EnableOperateLog){
				    var log = new OperateLog(methodobj.api +'/'+ methodobj.method, delIds);
                    myParams.operate_log = log;
                }
                if(CONFIG.EnableSign){
                    myParams.sign = CreateSign(myParams)
                }
                if(typeof(myParams)=='object'){
                    myParams = ToFormData(myParams)
                }
				resource.save(methodobj, myParams, callback);
			},
            //保留系统原生方法
			query: function(params, callback) {
                if(CONFIG.EnableSign){
                    params.sign =  CreateSign(params);
                }
				resource.query(params, callback);
			},
            //保留系统原生方法
			delete: function(params, callback) {
                if(CONFIG.EnableOperateLog){
				    var log = new OperateLog( methodobj.api +'/'+ methodobj.method, params);
                    params.operate_log = log;
                }
                if(CONFIG.EnableSign){
                    params.sign =  CreateSign(params);
                }
				resource.delete(params, callback);
			},
            //保留系统原生方法
			remove: function(params, callback) {
                if(CONFIG.EnableOperateLog){
				    var log = new OperateLog( methodobj.api +'/'+ methodobj.method, params);
                    params.operate_log = log;
                }
                if(CONFIG.EnableSign){
                    params.sign =  CreateSign(params);
                }
				resource.remove(params, callback);
			},
            //上传图片服务
            uploadImg: uploadImg
		};
		return serviceObj;
	}
]);

framework.angular.app.filter('nonopic', function () {
    var nonopic = function (picUrl) {
        if (picUrl) {
            if (picUrl.startsWith('http:') || picUrl.startsWith('https:')) {
                return picUrl;
            } else {
                return IMG_SERVER + '/' + picUrl;
            }
        } else {
            return 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&text=no+image';
        }

    }
    return nonopic;
});

framework.angular.app.directive('datetime', function (dateFilter) {
    return {
        require:'ngModel',
        link:function (scope, elm, attrs, ctrl) {

            var dateFormat = attrs['datetime'] || 'yyyy-MM-dd';

            ctrl.$formatters.unshift(function (modelValue) {
                return dateFilter(modelValue, dateFormat);
            });
        }
    };
})

framework.angular.app.filter('showconst', function () {
    var func = function(obj,prot){
        try{
            return UsersModel(prot, obj);
        }catch(e){
            return obj
        }
    }
    return func;
})