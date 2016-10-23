var mongoose  = require('mongoose');
var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;

var ModelSchema = new Schema({  
  converge: { type: [String]},
  zone: { type: String},
  date:{ type: Date , default: Date.now},
  year:{type: Number},
  month:{type: Number},
  day:{type: Number},
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('report_form_day', ModelSchema)