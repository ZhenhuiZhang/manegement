var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;
var _ = require('lodash');

var UserSchema = new Schema({
  user_id: { type: Number },       //主键    
  loginname: { type: String},       //不允许修改
  pass: { type: String },
  mobile: {type:String},
  email: { type: String},
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },         //用户最后活动时间 ，事件：开播、下播、登录（暂未实现）、被管理后台修改等
  accessToken: {type: String},
  account: { type: Number, default: 0 },       //资金账户
  status: { type: Number, default: 0 },        //用户状态，0未激活，10正常、20禁用（封号、禁止登录），30删除 【规划】

  facebook_id:{type: String},
  twitter_id:{type:String},
  google_id:{type:String},
  /** 推送ID
   * FCM_id:{
   *    android:'',
   *    ios:''
   * }
   */
  FCM_id: {type: Schema.Types.Mixed},

  avatar:{type:String},
  intro: { type: String },          //用户个人简介
  sex: {type:Number},               //0女，1男
  mobile_region: {type:String},     //手机号国家区号
  location: {type:String},            //国家。英文全称
  
  group:{ type:String},                          //用户类型，user | anchor
  anchor_group:{ type:[String]},                          //用户类型，['official','follow']
  official_intro: { type: String },      //官方描述
  
  //主播相关字段
  my_id:{type: Number},                 //主播靓号
  anchor_intro: { type: String },      //直播间描述
  anchor_live: { type: Number },                      //直接状态，11开播中，12连线，0/13下播
  anchor_status: { type: Number },         //主播状态：null正常，1沉底，2隐藏、3禁播      【特别注意：不要有值为0的状态】
  
  pic: { type: String },          //封面图
  banner:{ type: String },        //推荐位置图  希望被废弃20160524 @liyj
  sort: { type: Number, default: 0 },           //排序ID
  style: {type: String},          //主播风格  
  
  live_platform: {type: String},        //开播平台，ios、android、空或web[默认]
  //统计相关
  gift_revenue_history: { type: Number},        //历史礼物总收入
  following: { type: Number, default: 0 },      //关注人数
  fans: { type: Number, default: 0 },           //粉丝人数
  viewers: { type: Number, default: 0 },        //当前观众人数
  
  admin_remark: {type: String},                 //管理员备注

  /********** 关于定时更新的对象 ,结构如下： **************/
  /**
   * 
    "top|recommend": {
      "web": {
        "weight": 50,
        "pic": "17787d3ac864892fe67bd481570e2610",
        "title": "AngeLydia"
      },
      "ios": {
        "weight": 50,
        "pic": "17787d3ac864892fe67bd481570e2610",
        "title": "AngeLydia"
      }
    }
   */
  middle_object: Schema.Types.Mixed,
  //END

  //主播状态扩展对象，期望结构是{ deadline, remark}   @linwl on 20160604
  /*
  { deadline: { type: Date }, 
    remark: {type: String}
  }
  */
  anchor_status_obj: Schema.Types.Mixed,
})

UserSchema.plugin(BaseModel);

UserSchema.index({user_id: 1}, {unique: true});
UserSchema.index({loginname: 1}, {unique: true});
UserSchema.index({my_id: 1});
UserSchema.index({facebook_id: 1});
UserSchema.index({twitter_id: 1});
UserSchema.index({google_id: 1});
UserSchema.index({email: 1});
UserSchema.index({mobile: 1});
UserSchema.index({group:1, loginname: 1});

//复合索引，有助于查询性能提升10倍
UserSchema.index({group:1, anchor_status:1, anchor_live:1, "middle_object.recommend.ios.weight":-1, viewers:-1,update_at:-1})
UserSchema.index({group:1, anchor_status:1, anchor_live:1, "middle_object.recommend.android.weight":-1, viewers:-1,update_at:-1})

mongoose.model('User', UserSchema)