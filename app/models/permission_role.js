var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ModelSchema = new Schema({
  name: { type: String},
  intro: { type: String},
  create_at: { type: Date, default: Date.now },
  privilege_ids: [{ type: Schema.ObjectId, ref: 'permission_modules'}],
  location: { type: [String]},      //拥有的国家权限
})

ModelSchema.plugin(BaseModel)
mongoose.model('permission_role', ModelSchema)