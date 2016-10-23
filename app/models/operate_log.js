var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;

var ModelSchema = new Schema({  
  user: { type: String},
  operation: { type: String},
  submit_content: { type: String},
  origin_content: { type: String},
  create_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('operate_log', ModelSchema)