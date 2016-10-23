/**
 * 礼物赠送记录
*/

var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ModelSchema = new Schema({
  gift_item_id:{ type:Number},      //流水号
  gift_id:{type:Number},             
  create_at: { type: Date, default: Date.now },
  sender: { type: String },     //发送者用户名
  receive: { type: String },    //接收者用户名
  sender_user_id: { type: Number },
  receive_user_id: { type: Number },
  quantity: { type:Number, default: 0 },
  account: {type: Number, default: 0},
});

ModelSchema.plugin(BaseModel);
ModelSchema.index({gift_item_id: 1} , {unique: true});

ModelSchema.index({create_at: -1, sender_user_id: 1});
ModelSchema.index({create_at: -1, receive_user_id: 1});

mongoose.model('Gift_Item', ModelSchema);