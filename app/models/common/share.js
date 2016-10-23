var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;

var ModelSchema = new Schema({
    share_id: {type: String},           //分享文案/活动期号
    user_id: {type: Number},            //做分享操作的用户id
    share_user_id: {type: Number},      //被分享的主播id
    create_at: {type: Date,default: Date.now},            //分享时间
    channel: {type: String},            //分享渠道
    /*冗余字段*/
    loginname: {type: String},          //做分享操作的用户昵称
    share_loginname: {type: String},    //被分享的主播昵称
    source: {type: Number}              //分享数据来源，0为日志文件，1为app上报
})

ModelSchema.plugin(BaseModel)
ModelSchema.index({share_id: 1})
ModelSchema.index({user_id: -1})
ModelSchema.index({share_user_id: -1})
ModelSchema.index({channel: -1})
ModelSchema.index({share_id: 1, user_id: -1})
ModelSchema.index({share_id: 1, share_user_id: -1})
ModelSchema.index({share_id: 1,user_id: -1, share_user_id: -1})

mongoose.model('Share', ModelSchema)