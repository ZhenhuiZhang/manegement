var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var config = require('../../../config')

var GiftItemDayReportSchema = new Schema({
    gift_id:{type:Number},             
    create_at: { type: Date, default: Date.now },
    sender: { type: String },     //发送者用户名
    receive: { type: String },    //接收者用户名
    sender_user_id: { type: Number },
    receive_user_id: { type: Number },
    sum_account: {type: Number, default: 0},
    host_manager: {type: String},
    gift_name: {type: String},
    host_manager_name: {type: String},
    sum_count: {type: Number, default: 0},    //该日记录条数
    zone: {type: String},
    date: {type: Date, default: Date.now},
    year: {type: Number},
    month: {type: Number},
    day: {type: Number},
    location: {type: String}
})
GiftItemDayReportSchema.index({date: -1})
GiftItemDayReportSchema.index({date: -1, gift_id: -1})
GiftItemDayReportSchema.index({date: -1, sender_user_id: -1})
GiftItemDayReportSchema.index({date: -1, receive_user_id: -1})

mongoose.model('Gift_Item_Day_Report',GiftItemDayReportSchema)