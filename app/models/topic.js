var mongoose = require('mongoose');
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;

var TopicSchema = new Schema({
    title: { type: String },
    content: { type: String },
    // author_id: { type: ObjectId },
    top: { type: Boolean, default: false }, // 置顶帖
    good: {type: Boolean, default: false}, // 精华帖
    lock: {type: Boolean, default: false}, // 被锁定主题
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    collect_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    // last_reply: { type: ObjectId },
    last_reply_at: { type: Date, default: Date.now },
    content_is_html: { type: Boolean },
    deleted: {type: Boolean, default: false},

    tab: [Schema.Types.Mixed],//标签
    address : { type: String },
    phone : { type: String },
    pic : {type: String },
    product : [ { type: Number}],
    score : { type: Number, default: 0 }
})

TopicSchema.plugin(BaseModel);
TopicSchema.index({create_at: -1});
TopicSchema.index({top: -1, last_reply_at: -1});
TopicSchema.index({author_id: 1, create_at: -1});

mongoose.model('Topic', TopicSchema)