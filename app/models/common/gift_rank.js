/**
 * 礼物排行榜
*/

var mongoose = require('mongoose');
var BaseModel = require("../base_model");
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
  day: { type: Date },
  gift_id: { type: String },
  account: {type: Number},
  user_id: { type: String },
  loginname: { type: String },
  count: { type: Number },
  avatar:{type: String}
});

ModelSchema.plugin(BaseModel);

ModelSchema.index({user_id: 1, gift_id: 1 });
ModelSchema.index({ day: -1, user_id: 1, gift_id: 1 });
ModelSchema.index({ day: -1, count: -1, gift_id: 1 });

mongoose.model('Gift_Rank', ModelSchema);