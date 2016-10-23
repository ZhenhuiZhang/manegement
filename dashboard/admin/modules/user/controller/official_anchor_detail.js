framework.angular.controllers.controller("anchor-detail", ['$scope', '$rootScope', 'commonRES','$filter',
    function ($scope, $rootScope, service, $filter) {
        $scope.country_list = COUNTRY_LIST
        var anmin_remark_bak = "" //用于检查提交数据时数据是否被更改
        $scope.anchor_group = {}
        //a为原数据，b为提交时的数据
        function checkValue(a,b) { 
            if(a == b) return
            else if(b == ""){
                b = 'null'
                // console.log(b)
                return
            }
        }
        $(function () {
            // 初始化Tags Input插件
            $(".tagsinput").tagsInput();

        });

        if (location.search) {
            service.get({
                api: 'user',
                method: 'officialFindOne',
                _id: location.search.split('=')[1]
            }, function (datas) {
                $scope.model = datas.body;
                $scope.model.anchor_group.forEach(function(item) {
                    $scope.anchor_group[item] = item    
                })
                //初始化tab标签
                if($scope.model.style)$('#tagsinput').importTags($scope.model.style);
                
                anmin_remark_bak = $scope.model.admin_remark

                var anchor_status_msg = '';
                var anchor_status = $scope.model.anchor_status;
                var anchor_status_obj = $scope.model.anchor_status_obj;
                if (!anchor_status || anchor_status == 0) {
                    anchor_status = 0;
                    anchor_status_msg += 'Normal ';
                } else if (anchor_status == 1) {
                    anchor_status_msg += 'Show In Bottom ';
                } else if (anchor_status == 2) {
                    anchor_status_msg += 'Hidden ';
                } else if (anchor_status == 3) {
                    anchor_status_msg += 'Ban ';
                } else {
                    anchor_status_msg += 'Unkown ';
                }
                anchor_status_msg += 'Until ';
                if (!anchor_status_obj || !anchor_status_obj.deadline){
                    anchor_status_msg += 'Forever';
                } else {
                    anchor_status_msg += $filter('date')(new Date(anchor_status_obj.deadline), 'yyyy-MM-dd HH:mm:ss Z');
                }
                if (anchor_status_obj && anchor_status_msg.remark){
                    anchor_status_msg += '(Remark:' + anchor_status_obj.remark + ')'
                }
                $scope.model.anchor_status_msg = anchor_status_msg;

                $scope.Need_Edit_Cover = $scope.model.admin_remark && $scope.model.admin_remark.indexOf('NEEDEDITCOVER')!=-1 ? '1' : '0';
            })
        }

        $scope.NeedEditCover_click=function(obj) {
            $scope.model.admin_remark = $scope.model.admin_remark || ''
            if($scope.Need_Edit_Cover == '1')
                $scope.model.admin_remark += ' NEEDEDITCOVER'
            else
                $scope.model.admin_remark = $scope.model.admin_remark.replace(' NEEDEDITCOVER','')
        }


        $scope.save = function () {
            if (!confirm('are you sure to submit？')) {
                return false;
            }
            // var params = $.extend({}, $scope.model);

            var params = $('form[name=submit_form]').serializeObject();
            // params.anchor_group = $scope.model.anchor_group;
            checkValue(anmin_remark_bak , $scope.model.admin_remark)
            var anchor_group = [];
        
            Object.getOwnPropertyNames($scope.anchor_group).forEach(function(item) {
                if($scope.anchor_group[item]){
                    anchor_group.push($scope.anchor_group[item])
                }
            })
            params.anchor_group = anchor_group;
            console.log(params)
            service.save({
                api: 'user',
                method: 'officialUpdate'
            }, params, function (result) {
                if (result.code == 0) {
                    alert('submit ok');
                    location.href='anchor_list.html'
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            })
        }
        
        function addDays(theDate, days) {
            return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
        }
        
        $scope.anchorStatusChange = function(){
            if (!confirm('Are you sure to change anchor status? Please reload the page manually after success!!')) {
                return false;
            }
            hasDone = false;
            //做一些数据预处理
            var anchorStatusObj = {};
            anchorStatusObj.status = $scope.model.new_anchor_status.status_type;
            var effectTime = $scope.model.new_anchor_status.effect_time;
            if(!isNaN(effectTime) && parseInt(effectTime) >= 0 && anchorStatusObj.status != '0'){
                anchorStatusObj.deadline = $filter('date')(addDays(new Date(), parseInt(effectTime)), 'yyyy-MM-dd HH:mm:ss Z');
            } else {
                delete anchorStatusObj.deadline;
            }
            
            anchorStatusObj.remark = $scope.model.new_anchor_status.remark;
            anchorStatusObj.user_id = $scope.model.user_id;
            anchorStatusObj.admin_id = $rootScope.adminObj.adminname;
            //如果是禁播操作，则操作往聊天服务器发送禁播消息
            if (anchorStatusObj.status == 3) {
                sendBanMessageToChatServer();
            }
            //向后台api服务器发送数据，更新状态
            service.save({
                api: 'userStatusLogs',
                method: 'updateStatus'
            }, anchorStatusObj, function (result) {
                if (result.code == 0) {
                    alert('change anchor status ok');
                    $('#anchor_status_change').trigger('click.dismiss.modal');
                    // location.reload();
                } else {
                    alert(result.message);
                }
                $rootScope.loading = false;
            });
            return false;
        }
        
        //聊天的websocket
        var chatWs;
        var curChartId = 0;
        var _chatServerCallback = {};
        var hasDone = false;
        
        function sendBanMessageToChatServer(){
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
                    initWsSocket(data.server)
                }).fail(function (data) {
                    console.log('send ban message to chat server fail.', data);
                    alert('send ban message to chat server fail');
                });
            }
        }
        
        function initWsSocket(server) {
            chatWs = new WebSocket('ws://' + server + '?roomId=' + $scope.model.user_id);
            chatWs.onopen = function (evt) {
                console.debug('wscoket has open');
                chatServerWsSend({
                    cmd: 'fobiddenLive'
                }, function (data) {
                    if (data.rst == 0) {
                        console.log('chat server: ban room is ok~~~~~~~~~~~~~~~~~~~~~');
                        hasDone = true;
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
            param.adminid =  100;
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
                        alert('unkown error.',data.rst);
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
]);