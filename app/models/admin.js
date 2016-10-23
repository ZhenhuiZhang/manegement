var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;

var ModelSchema = new Schema({  
  adminname: { type: String},
  pass: { type: String},
  group:{ type: String },
  role:{ type: String },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('Admin', ModelSchema)