var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;

var ModelSchema = new Schema({
    status: { type: Number },   //目标状态，1沉底，2隐藏、3禁播，30封号
    is_effect: { type: Number},   //状态是否还在生效，1是，0否
    admin_id: { type: String},
    user_id: { type: Number },
    deadline: { type: Date},  //截止时间，为空则表示永久禁播
    create_at: { type: Date, default: Date.now },  //操作时间
    remark: { type: String},  //操作备注
})

ModelSchema.plugin(BaseModel);
ModelSchema.index({user_id: 1});
ModelSchema.index({deadline: -1});
mongoose.model('User_Status_Logs', ModelSchema)