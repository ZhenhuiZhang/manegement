var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var config = require('../../../config')

var LiveLogsDayReportSchema = new Schema({
    user_id:{type:Number},             
    create_at: { type: Date, default: Date.now },
    platform: { type: String },     //平台
    anchor_group: { type: String },    
    host_manager: {type: String},
    loginname: {type: String},
    host_manager_name: {type: String},
    sum_count: {type: Number, default: 0},    //该日记录条数
    zone: {type: String},
    date: {type: Date, default: Date.now},
    year: {type: Number},
    month: {type: Number},
    day: {type: Number},
    sum_live_times: {type: Number, default: 0},
    sum_revence: {type: Number, default: 0},
    sum_UV: {type: Number, default: 0},
    DAU: {type: Number, default: 0},
    sum_follow_count: {type: Number, default: 0},
    sum_gift_count:{type: Number, default: 0},
    avatar:{type: String},
    anchor_intro:{type: String},
    admin_remark: {type:String},
    regist_time: {type:Date},
    remain_second: {type: Number,default: 0},
    location: {type: String},
    gift_revenue_history: { type: Number, default:0},        //历史礼物总收入
    fans: { type: Number, default: 0 },           //粉丝人数
})
LiveLogsDayReportSchema.index({date: -1})
LiveLogsDayReportSchema.index({date: -1,ueser_id: -1})
LiveLogsDayReportSchema.index({date: -1,platform: -1})
LiveLogsDayReportSchema.index({date: -1,anchor_group: -1})
LiveLogsDayReportSchema.index({date: -1,host_manager: -1})

mongoose.model('Live_Logs_Day_Report',LiveLogsDayReportSchema)