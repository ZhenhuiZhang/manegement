var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
    name: { type: String },              //书名
    user_id: { type: String },          //学号
    department: { type: String },          //部门
    pass :　{ type: String },              //密码
    status : { type: Number },          //状态 0:无,1:禁止结束
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('User', ModelSchema)