var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var ModelSchema = new Schema({  
  name: { type: String},
  intro: { type: String},
  element: { type: String},
  type: { type: String},
  api: { type: String},
  create_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('permission_modules_privilege', ModelSchema)

exports.PermissionPodulesSchema = ModelSchema