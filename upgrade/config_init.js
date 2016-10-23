var mongoose = require('mongoose')
var db_main = require('../app/models/index_main')
var ConfigVersion = db_main.ConfigVersion
var logger = require('../app/common/logger').logger('config_init');

var config = {
    /** 配置版本号 */
    "version": 19 ,
    /** 礼物数据版本号 */
    "gift_version": 16,
    /** 配置项 */
    "datas":{
        "base":{
            "pc_homepage":"http://www.nonolive.com",
            "pc_room":"http://www.nonolive.com/liveroom/${user.id}"
        },
        "charge_IDR": {
            "phonenum":{
                "100" :   10000,
                "200" :   20000,
                "500" :   50000,
                "1000" :  100000,
                "5000" :  500000
            },
            "mimopay":{
                "500" :   50000,
                "1000" :  100000,
                "3000" :  300000,
                "5000" :  500000,
                "10000":  1000000,
                "50000":  5000000,
                "100000": 10000000
            },
            "unipin":{
                "100" :   10000,
                "200" :   20000,
                "500" :   50000,
                "1000" :  100000,
                "3000" :  300000,
                "5000" :  500000,
                "10000" :  1000000,
                "50000" :  5000000
            },
            "google_pay": [
                150,
                450,
                990,
                2990,
                4990,
                9990,
                49990
            ]
        },
        /**主播开播分享 */
        "live_start_share":{
            "twitter":"Breaking News> I am streaming a secret about... on #Nonolive! Check?${share_url}",
            "facebook":"Breaking News> I am streaming a secret about... on #Nonolive! Check?${share_url}"
        },
        /**观看直播分享 */
        "live_watch_share":{
            "twitter": "You got a mention in ${user.loginname} streaming on #Nonolive, check? ${share_url}",
            "facebook": "You got a mention in ${user.loginname} streaming on #Nonolive, check? ${share_url}"
        },
        /** 初始配置 */
        // "live_watch_share":{
        //     "twitter":"I am watching ${user.loginname} streaming in #Nonolive now, join with me=)  ${share_url}",
        //     "facebook":"I am watching ${user.loginname} streaming in #Nonolive now, join with me :D ${share_url}"
        // },
        /**个人中心分享 */
        "me_share" : "I am a streamer on #Nonolive now, nickname  ${share_url}, Follow me! ${share_url}",
        // "me_share" : "#Nonolive ${user.loginname} ${user.intro} ${share_url}",
        "stars_to_cheer":{
            //值：0表示关闭，1表示打开
            //数据下标: [0]当用户在直播间成功发言后弹窗引导用户评分
            //[1]用户正常下播，并返回到上一级页面时
            //[2]用户启动 App 时，如此时用户累计观看超过30分钟（不包含后台运行）
            //[3]用户在直播间送礼次数超过3次，返回上一级页面时
            //[4]用户累计N次成功启动App触发弹窗
            "switch": [0,0,1,0,0],
            "lang": {
                "title":"Like Nonolive so far?",
                "star":"Yes, not bad",
                "suggestion":"Don't like it",
                "later": "Try more"
            },
             // 允许弹窗的小时列表
            "enable_hour": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            "time_span": 168,            // 两次弹窗的时间间隔，小时
            "total_view_time": 18,      // 累积观看视频的时间，分钟
            "total_live_time": 1000,       // 累积开播的时间，分钟
            "send_chat_limit": 1000,       // 成功发言次数
            "send_gift_limit": 1000,       // 成功送礼次数
            "app_start_limit": 5            // 成功启动APP次数（首页加载成功定义为成功启动APP）

        },
        //统计上报时可以配置拼装的统计条数和循环上报的时间间隔
        "lgs": {
            "collect_count": 20,     // 拼装条数
            "collect_time": 180      // 时间间隔，单位s
        },
        //直播网络异常
        "net_exception":{
            //值：0表示关闭，1表示打开
            //数据下标: [0]主播端网络异常提醒开关
            // [1]观众端网络异常提醒开关
            "switch": [0,0],
            //主播慢网络持续时长，下播控制
            "slow_duration": 30    
        },
        //iOS升级Patch
        "ios": {
            "patch": {
                "url": "http://52.77.95.9:5301/static/ios/patch/${version}.js"
            }
        }
    }
}

var data = {
    config: config,
    platform : ["common"],
    sort: 1,
    status: 10,
    location : [
		'all'
	]
}

ConfigVersion.create(data,function(err,rd) {
    logger.info(err,'Config init success!')
})