var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var config = require('../../../config')

var PayItemDayReportSchema = new Schema({
  user_id:{type:Number},              
  create_at: { type: Date, default: Date.now },
  platform: { type: String },     //平台
  status: { type: Number, default: 0 },        //支付状态，0未支付，10支付成功，20支付失败    
  loginname: {type: String},
  gold: {type: Number},
  sum_count: {type: Number, default: 0},    //该日记录条数
  zone: {type: String},
  date: {type: Date, default: Date.now},
  year: {type: Number},
  month: {type: Number},
  day: {type: Number},
  currency: {type: String},
  sum_account: {type: Number, default: 0},
  location: {type: String}
})
PayItemDayReportSchema.index({date:-1})
PayItemDayReportSchema.index({date:-1,user_id:-1})
PayItemDayReportSchema.index({date:-1,platform:-1})
PayItemDayReportSchema.index({date:-1,gold:-1})

mongoose.model('Pay_Item_Day_Report',PayItemDayReportSchema)