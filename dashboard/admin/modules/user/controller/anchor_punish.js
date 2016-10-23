framework.angular.controllers.controller("anchor-punish", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        if (location.search) {
            var obj = {
                api: 'user',
                method: 'findOne'
            }
            if(isNaN(location.search.split('=')[1]))
                obj._id = location.search.split('=')[1]
            else
                obj.user_id = location.search.split('=')[1]

            service.get(obj, function (datas) {
                $scope.model = datas.body;

                //设置UI初始值
                if(!$scope.model.anchor_status_obj){
                    $scope.model.anchor_status_obj = {};
                    $scope.model.anchor_status_obj.deadline = 0;
                }
                if(!$scope.model.anchor_status_obj.deadline || $scope.model.anchor_status_obj.deadline<=0 ){
                    $scope.model.anchor_status_obj.deadline = 0;
                }else{
                    $scope.model.endTime = moment(new Date($scope.model.anchor_status_obj.deadline)).format("YYYY-MM-DD HH:mm:ss");
                    $scope.model.lastTime = moment(new Date($scope.model.anchor_status_obj.deadline)).valueOf() - moment().valueOf();
                    $scope.day = parseInt($scope.model.lastTime / (1000 * 60 * 60 * 24));
                    $scope.hour = parseInt(($scope.model.lastTime - $scope.day * (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    $scope.minute = parseInt(($scope.model.lastTime - $scope.day * (1000 * 60 * 60 * 24) - $scope.hour * (1000 * 60 * 60)) / (1000 * 60));
                    $scope.day = $scope.day > 0 ? $scope.day : "00";
                    $scope.hour = $scope.hour > 0 ? $scope.hour : "00";
                    $scope.minute = $scope.minute > 0 ? $scope.minute : "00";
                }
                if ($scope.model.anchor_status) {
                    $scope.shoulds = true
                }
            })
        }

        
        function addDays(theDate, days) {
            // return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
            return new Date(theDate.getTime() + days * 60 * 1000);
        }
        
        $scope.save = function(){
            if (!confirm('Are you sure to change anchor status? Please reload the page manually after success!!')) {
                return false;
            }
            hasDone = false;
            //做一些数据预处理
            var anchorStatusObj = {};
            anchorStatusObj.status = $scope.model.anchor_status;
            if($scope.model.anchor_status_obj.deadline){
                var deadline = $scope.model.anchor_status_obj.deadline;
            }else{
                var deadline = $scope.model.anchor_status_obj.minute
            }
            if(!isNaN(deadline) && parseInt(deadline) >= 0 && anchorStatusObj.status != '0'){
                anchorStatusObj.deadline = $filter('date')(addDays(new Date(), parseInt(deadline)), 'yyyy-MM-dd HH:mm:ss Z');
            } else {
                delete anchorStatusObj.deadline;
            }
            
            anchorStatusObj.remark = $scope.model.anchor_status_obj.remark;
            anchorStatusObj.user_id = $scope.model.user_id;
            anchorStatusObj.admin_id = $rootScope.USERNAME;
            anchorStatusObj.is_effect = 1;
            //如果是禁播操作，则操作往聊天服务器发送禁播消息
            if (anchorStatusObj.status == 3) {
                sendBanMessageToChatServer(function(){
                    location.href="anchor_list.html";
                });
            }

            service.save({
                    api: 'userStatusLogs',
                    method: 'updateStatus'
                }, anchorStatusObj, function (result) {
                    console.log(result)
                    if (result.code == 0) {
                        alert('change anchor status ok');
                        
                        if (anchorStatusObj.status != 3) {
                                location.href="anchor_list.html";
                        }
                    } else {
                        alert(result.message);
                    }
                    $rootScope.loading = false;
                })
            
            //向后台api服务器发送数据，更新状态
            return false;
        }
        
        //聊天的websocket
        var chatWs;
        var curChartId = 0;
        var _chatServerCallback = {};
        var hasDone = false;

        function sendBanMessageToChatServer(cb) {
            CHAT_DISP_URLS.forEach(function (url) {
                //聊天的websocket
                var chatWs;
                var curChartId = 0;
                var _chatServerCallback = {};
                if (!hasDone) {
                    if (chatWs) {
                        if (chatWs && chatWs.readyState != chatWs.CLOSING && chatWs.readyState != chatWs.CLOSED) {
                            chatWs.close();
                            return; //因为chatWs的close时间会触发重连接逻辑
                        }
                    }
                    $.ajax({
                        url: CHAT_DISPATCHER_URL,
                        data: {
                            room_id: $scope.model.user_id,
                            type: 'chat',
                            call: 'get_server'
                        },
                        type: 'GET'
                    }).done(function (data, textStauts) {
                        console.log('dispatcher result : ', data, textStauts);
                        initWsSocket(data.server, cb)
                    }).fail(function (data) {
                        console.log('send ban message to chat server fail.', data);
                        // alert('send ban message to chat server fail');
                    });
                }
            })
            function initWsSocket(server, cb) {
                chatWs = new WebSocket('ws://' + server + '?roomId=' + $scope.model.user_id);
                chatWs.onopen = function (evt) {
                    console.debug('wscoket has open');
                    chatServerWsSend({
                        cmd: 'fobiddenLive'
                    }, function (data) {
                        if (data.rst == 0) {
                            console.log('chat server: ban room is ok~~~~~~~~~~~~~~~~~~~~~');
                            hasDone = true;
                            cb();
                            chatWs.close();
                        }
                    });
                }
                chatWs.onclose = function (evt) {
                    console.warn('websocket close, and try to reconnect.', evt);
                    setTimeout(sendBanMessageToChatServer, 4000);
                }
                chatWs.onmessage = function (result) {
                    console.debug('onmessage ', result);
                    if (!result || !result.data) {
                        return;
                    }
                    var data = JSON.parse(result.data);
                    //2为应答
                    if (data.type == 2) {
                        chatServerCallBack(data);
                        return;
                    }
                }
            }


            function chatServerWsSend(param, succCb, errCb) {
                curChartId += 1;
                if (!param) {
                    param = null;
                }
                param.nonopara = $.extend({}, param.nonopara);
                var _tmp = '';
                for (let item2 in param.nonopara) {
                    _tmp += '`' + item2 + '=' + param.nonopara[item2]
                }
                param.nonopara = _tmp;
                param.reqId = curChartId;
                if (!param.userId) {
                    param.userId = 100;
                } else {
                    param.userId = parseInt(param.userId);
                }
                param.adminid = 100;
                param.guestId = 100;
                param.roomId = parseInt($scope.model.user_id);
                param.userName = 'cms';
                param.userImg = '';

                _chatServerCallback[curChartId] = { succCb: succCb, errCb: errCb };
                if (chatWs && chatWs.readyState == chatWs.OPEN) {
                    console.debug('ready to send:', param);
                    chatWs.send(JSON.stringify(param));
                } else if (chatWs && (chatWs.readyState == chatWs.CLOSED || chatWs.readyState == chatWs.CLOSING)) {
                    sendBanMessageToChatServer();
                }
            }
            function chatServerCallBack(data) {
                console.debug('chatServerCallBack:', data);
                // 错误失败处理
                if (!data) {
                    setTimeout(sendBanMessageToChatServer, 1000);
                    return;
                }
                var cb;
                if (data.reqId) {
                    cb = _chatServerCallback[data.reqId];
                    delete _chatServerCallback[data.reqId];
                }

                if (cb == null) {
                    console.debug('not find chat callback for :', data);
                    return;
                }

                if (data.rst != 0) {
                    switch (data.rst) {
                        case 1005:
                            alert('chat server: you has no right to do this.');
                            break;
                        case 1001:
                            alert('chat server: you are a guset!');
                            break;
                        case 1001:
                            alert('chat server: you are not login user');
                            break;
                        default:
                            alert('unkown error.', data.rst);
                            break;
                    }
                    if (cb && cb.errCb && 'function' == typeof (cb.errCb)) {
                        cb.succCb(data);
                    }
                } else {
                    if (cb && cb.succCb && 'function' == typeof (cb.succCb)) {
                        cb.succCb(data);
                    }
                }

            }
        }
    }
]);