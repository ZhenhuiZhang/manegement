//自动运行脚本，生成前一天日报表
var config = require('../config')

var moment = require('moment');
var getTimezone = require('moment-timezone');
var mongoose = require('mongoose');
var db_readonly = require('../app/models/index_readonly')
var logger = require('../app/common/logger').logger('gift_item_day_report');

var GiftItem = db_readonly.GiftItem

//获取日期范围
var from = getTimezone(new moment('2016-08-15T17:00:00.000Z')).tz("Asia/Jakarta")
var to = getTimezone(new moment('2016-08-21T17:00:00.000Z')).tz("Asia/Jakarta")
var tzOffset = 7  //雅加达时差

var where = {
    receive_user_id: 326411,
    gift_id: 1009,
    create_at : {
        $gte: from.toDate(), $lt: to.toDate() 
    }
}

GiftItem.aggregate([
    {
        $match: where
    },
    {
        $group: {
            _id:{
                sender_user_id: '$sender_user_id'
            },
            sum_count: {$sum: 1},
            sum_account: { $sum: "$account" },
            receive: {$first:"$receive"},
            sender: {$first:"$sender"}
        }
    },
    {
        $sort: {sum_count: -1}
    },
    {
        $limit: 3
    }
]).allowDiskUse(true).exec(function(err,rd){
    console.log(rd)
})