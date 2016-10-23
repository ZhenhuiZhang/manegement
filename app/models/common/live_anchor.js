var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;
var _ = require('lodash');
var locations = require('../../../configs/app/location');

//在线主播表
var LiveAnchor = new Schema({
  user_id: { type: Number },       //主键    
  loginname: { type: String},       //不允许修改
  update_at: { type: Date, default: Date.now },         //用户最后活动时间 ，事件：开播、下播、登录（暂未实现）等
  status: { type: Number, default: 0 },        //用户状态，0未激活，10正常、20禁用（封号、禁止登录），30删除 【规划】
  avatar:{type:String},
  intro: { type: String },          //用户个人简介
  sex: {type:Number},         //0女，1男
  anchor_group:{ type:[String]},                          //用户类型，['official']
  
  //主播相关字段
  my_id:{type: Number},                 //主播靓号
  anchor_intro: { type: String },      //直播间描述
  anchor_live: { type: Number },                      //直接状态，11开播中，12连线，0/13下播
  anchor_status: { type: Number },         //主播状态：null正常，1沉底，2隐藏、3禁播      【特别注意：不要有值为0的状态】
  
  pic: { type: String },          //封面图
  style: {type: String},          //主播风格  
  
  live_platform: {type: String},        //开播平台，ios、android、空或web[默认]
  //统计相关
  viewers: { type: Number, default: 0 },        //当前观众人数
  max_viewers: {type: Number},                  //最高pcu
  admin_remark: {type: String},                 //管理员备注
  level: {type: Number, default: 1},            //等级

  /**
   * "Malaysia": {
   *   android_rank: {type: Number, default: 0},               //android排序
   *   ios_rank: {type: Number, default: 0},                   //ios 排序，由大到小
   *   web_rank: {type: Number, default: 0},                   // web排序
   *   explore_rank: {type:Number, default: 0},                // explore功能的最终排序，
   *   android_recommend_pic: {type:String}                            //android推荐图
   *   ios_recommend_pic: {type:String}                            //ios推荐图
   *  }
   */
  rank: {type: Schema.Types.Mixed},             //排序相关，因为多个国家，所以使用混合对象，动态计算出来
  android_rank: {type: Number, default: 0},               //android排序
  ios_rank: {type: Number, default: 0},                   //ios 排序，由大到小
  web_rank: {type: Number, default: 0},                   // web排序
  explore_rank: {type:Number, default: 0},      // explore的基本排序
  weight: {type: Number},                     //根据排序因子计算出来的权重
  
  live_start: {type: Date},                     //当前开播的开始时间
  log_id: {type: String},                       //当前开播记录id
  location: {type: String}                      //国家，位置
})

LiveAnchor.plugin(BaseModel);
LiveAnchor.index({user_id: 1}, {unique: true});
locations.supportLocations().forEach(function(location){
  ["android_rank", "ios_rank", "web_rank", "explore_rank"].forEach(function(item){
    var index = {}, locationSortIndex = {};
    index[location + "." + item] = -1;
    locationSortIndex[location + "." + item] = -1;
    locationSortIndex.location = -1;
    LiveAnchor.index(index);
    LiveAnchor.index(locationSortIndex);

  });
});

mongoose.model('Live_Anchor', LiveAnchor)
