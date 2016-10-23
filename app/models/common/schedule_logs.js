/**
 * 定时任务列表
*/

var mongoose = require('mongoose');
var BaseModel = require("../base_model");
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
    name: { type: String },
    last_time: { type: Date, default: Date.now },
    create_at: { type: Date, default: Date.now }
});

ModelSchema.plugin(BaseModel);

ModelSchema.index({ name: -1});
ModelSchema.index({ name: -1,create_at:-1});

mongoose.model('Schedule_Logs', ModelSchema);