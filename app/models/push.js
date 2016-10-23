/** 
 * 新注册用户的push
 * 
*/
var mongoose = require('mongoose');
var BaseModle = require("./base_model");
var Schema = mongoose.Schema;

var ModuleSchema = new Schema({
    name : { type: String},  //推送的名字
    contents: Schema.Types.Mixed,
    // [{
    //     title: String, 
    //     content: String,  //内容、可以是主播的id，也可以是一个url,@废弃，使用数组取代
    //      /*
    //     推送类型，目前有：
    //     1.'anchor':主播
    //     2.'page':H5页面  
    //     */
    //     content_type: {type: String},
    // }],                         //内容，数组，
    history_contents: Schema.Types.Mixed,
    // [{
    //     title: String, 
    //     content: String,  //内容、可以是主播的id，也可以是一个url,@废弃，使用数组取代
    //      /*
    //     推送类型，目前有：
    //     1.'anchor':主播
    //     2.'page':H5页面  
    //     */
    //     content_type: {type: String},
    // }],                         //历史内容，数组，
    target:{type: Number},                             //推送用户标识 1：Today New User，2：All User
    user_range:{                                      //推送用户范围
        date_start: Date,                              //当date_start 为空时表示推送全部用户
        date_end: Date,
    },
    push_attr:{
        expect_nums: {type: Number, default: 1},         //期待用户收到多少条
        oper_times: {type: Number, default: 1},         //运营同学将分开多少次操作，其实就是指对用户群体划分。例如对当天新用户，分3批用户推送，每批用户期待收到1条。oper_times >= expect_nums 
        cur_oper_time: {type: Number, defaut: 1},       //当前运营同学是第几次操作
    },
    is_push_now: {type: Number},                  //是否是立即推送 0:否,1:是
    shcedule_push_time: Date,                                //定时推送时间
    push_status : {type: Number,defaut: 0},                             //是否已经推送了成功。"0":"No push","20": "Pushing","200" :"Success","400": "Failed"};
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    locations: { type: [String]},
    platforms: { type: [String]},       
})

ModuleSchema.plugin(BaseModle)
mongoose.model('Push', ModuleSchema)