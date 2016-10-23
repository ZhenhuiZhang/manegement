/**
 * 版本配置
*/

var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;

var ConfigVersionSchema = new Schema({
  config: { type: Schema.Types.Mixed },                 //版本信息
  platform: { type: [String] },                           //版本平台，ios，android，comment：主配置
  location: {type:[String]},                            //国家['Indonesia','Malaysia','Turkey','Russian','Vietnam','Thailand'],全部则为['All']
  platform_ver: { type: String },                       //平台版本号
  platform_ver_num: { type: Number },                       //平台版本号
  status: { type: Number, default: 0 },                 //状态，0未启用，10启用, 1：暂停发布
  create_at: { type: Date, default: Date.now },         //创建时间
  publish_at: { type: Date, default: Date.now },        //发布时间
  sort: { type: Number, default: 0 },                   //排序ID
});

ConfigVersionSchema.plugin(BaseModel);

mongoose.model('Config_Version', ConfigVersionSchema);