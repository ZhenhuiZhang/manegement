var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;

var ModelSchema = new Schema({
    name: { type: String },              //书名
    category: { type: String },          //类别
    pic: { type: String },               //图片
    number: { type: String },            //编号
    author: { type: String },            //作者
    year: { type: String },              //年份
    publishing: { type: String },        //出版社
    book_num: { type: Number },        //图书总数量
    bollow_num: { type: Number },        //已借数量
    last_num: { type: Number },        //剩余数量
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
})

ModelSchema.plugin(BaseModel)
mongoose.model('Book', ModelSchema)