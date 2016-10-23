var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var config = require('../../../config')

var PayItemMonthReportSchema = new Schema({
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
  day_account: {type:[Number]},
  sum_account: {type: Number, default: 0},
  currency: {type: String},
  key:{type: String},
  location: {type: String}
})
PayItemMonthReportSchema.index({key:-1})
PayItemMonthReportSchema.index({date:-1})
PayItemMonthReportSchema.index({date:-1,user_id:-1})
PayItemMonthReportSchema.index({date:-1,platform:-1})
PayItemMonthReportSchema.index({date:-1,gold:-1})
// PayItemMonthReportSchema.index({gold:-1,platform:-1,user_id:-1,year:-1,month:-1,status:-1})

mongoose.model('Pay_Item_Month_Report',PayItemMonthReportSchema)