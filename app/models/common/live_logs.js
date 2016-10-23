/**
 * 开播记录
*/

var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ModelSchema = new Schema({
  user_id: {type: Number},
  loginname: {type: String},
  create_at: { type: Date, default: Date.now },       //开播时间
  update_at: { type: Date },    //下播时间                  
  date: { type: Date },         //开播日期，格式yyyy-MM-dd
  month: { type: Date },        //开播月份，格式yyyy-MM
  live_times: {type: Number},     //本次开播时长，单位为秒
  revence: { type: Number },    //本场收入
  UV: { type: Number },         //本场UV
  DAU: { type: Number },         //当天当前DAU
  follow_count: {type: Number}, //本场新增 follow数量
  gift_count:{type: Number},    //本场收到礼物数量,
  platform: {type: String},     //开播平台，ios、android、web/空

  os_platform: {type:String},         //手机系统平台 
  os_version: {type:String},          //设备操作系统版本
  device_model: {type:String},        //手机型号
  app_version: {type:String},         //App 版本号
  network: {type:String},             //网络类型
  sp: {type:String},                  //运营商  
})

ModelSchema.plugin(BaseModel)
ModelSchema.index({user_id: 1})
ModelSchema.index({create_at: 1})
mongoose.model('Live_Logs', ModelSchema)