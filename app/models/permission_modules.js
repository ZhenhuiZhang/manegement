var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;


var ModelSchema = new Schema({  
  parentname: { type: String},
  name: { type: String},
  intro: { type: String},
  api: { type: [String]},
  element: { type: String},
  CRUD: { type: String},
  create_at: { type: Date, default: Date.now }
  // roles: [{ type: Schema.ObjectId, ref: 'permission_role'}],
})

// var PermissionPodules = require("./permission_modules_privilege");
// var ModelSchema = new Schema({  
//   name: { type: String},
//   intro: { type: String},
//   parent: { type: String},
//   api: { type: String},
//   create_at: { type: Date, default: Date.now },
//   privilege: [PermissionPodules.PermissionPodulesSchema],     //内嵌子文档
// })

ModelSchema.plugin(BaseModel)
mongoose.model('permission_modules', ModelSchema)