/**
 * 新增粉丝数排行榜
*/

var mongoose = require('mongoose');
var BaseModel = require("../base_model");
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
  day: { type: Date },
  new_fans: { type: String },
  user_id: {type: Number},
  loginname: { type: String },
  avatar:{type: String}
});

ModelSchema.plugin(BaseModel);

ModelSchema.index({user_id: 1});
ModelSchema.index({ day: -1, user_id: 1});

mongoose.model('New_Fans_Rank', ModelSchema);