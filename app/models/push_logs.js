/** 
 * 推送记录
 * 
*/
var mongoose = require('mongoose');
var BaseModle = require("./base_model");
var Schema = mongoose.Schema;

var ModuleSchema = new Schema({
    user_id: {type:Number},
    loginname: {type: String},
    create_at: { type: Date, default: Date.now },
    fans_num: {type: String},                           //粉丝数
    data_source: {type: String},                        //推送数据源，cache或db
    platform: {type: String},                           //推送平台
    success: {type:Number},                             //推送成功数量
    failure: {type:Number},                             //推送失败数量
    canonical_ids: {type:Number},                       //需要更新token的数量
    results: {type: Schema.Types.Mixed }                //执行返回结果。每一个失败的token，原因，新token
})

ModuleSchema.plugin(BaseModle)
ModuleSchema.index({user_id: 1})
mongoose.model('Push_Logs', ModuleSchema)