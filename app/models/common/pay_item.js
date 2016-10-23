/**
 * 礼物赠送记录
*/

var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;

var PayItemSchema = new Schema({
  user_id: {type:Number},
  loginname: {type:String},             
  order_id: { type: String },     
  platform:{ type: String },
  remark: { type: String },
  status: { type: Number, default: 0 },        //支付状态，0未支付，10支付成功，20支付失败    
  price: {type: Number, default: 0},		//货币金额
  gold: {type: Number, default: 0},			//虚拟币数量
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date },
  
  currency: {type: String },			//货币类型/国家货币代码,人民币RMB,美元USD，印尼盾IDR
  product_id: { type: String },       //购买商品id。主要是面向Apple支付时
  iap_receipt: { type: String },       //客户端提供的receipt
  app_requery_at: { type: Date },      //客户端提交校验时间
  transaction_id: { type:String},     //苹果交易流水号
})

PayItemSchema.plugin(BaseModel)
PayItemSchema.index({loginname: 1})
PayItemSchema.index({order_id: -1})

mongoose.model('Pay_Item', PayItemSchema);