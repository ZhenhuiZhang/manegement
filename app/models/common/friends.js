var mongoose  = require('mongoose');
var BaseModel = require("../base_model");
var Schema    = mongoose.Schema;

var FriendsSchema = new Schema({
  user_id: { type: Number },
  loginname: { type: String },
  follow_user_id: { type: Number },
  follow_loginname: { type: String },
  status: { type: Number, default: 0 },       //状态，0:follow，1:unfollow用户删除。逻辑删除的记录用于数据分析
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date},
});

FriendsSchema.plugin(BaseModel);
FriendsSchema.index({user_id: 1});
FriendsSchema.index({follow_user_id: 1});
FriendsSchema.index({create_at: -1, status: -1});

mongoose.model('Friends', FriendsSchema);