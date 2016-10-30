var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
    book: { type: String },              //图书编号
    name: { type: String },              //书名
    user_id: { type: String },          //学号
    status : { type: Number },          //状态 0:未还,1:已还
    return_at: { type: Date},           //还书日期
    create_at: { type: Date, default: Date.now },//借书日期
    update_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('Borrow', ModelSchema)