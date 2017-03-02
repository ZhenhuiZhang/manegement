'use strict'
var moment = require('moment')
var fs = require('fs')
var lodash = require("lodash");
var EventProxy   = require('eventproxy');
var Topic = require('../app/models').Topic
var ep = new EventProxy();
ep.fail();

fs.readFile('./shoprank.json', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
    if(err) {
     console.error(err);
     return;
    }
    // console.log(JSON.parse(data)[0]);
    var list = JSON.parse(data),total=list.length
    console.log(total);
    handle(list,0)
});


function handle(obj,index){
    if(!obj[index]){
        console.info("finish!",l)
        return process.exit()
    }
    var item ={
        address:obj[index].fullAdress,
        phone:obj[index].phoneNo,
        pic:encodeURI(obj[index].defaultPic),
        title:obj[index].fullName,
    }
    Topic.findOne({title:item.title},function(err,rd){
        if(rd) return console.error(1,"该编号已被使用")
        Topic.create(item,function(err,result){
            if(index%10==0) console.log("insert"+(index+1))
            handle(obj,index+1)
        })
    })
}

// inputs.shop.update_at = moment();
// var update = {}
// update.address=inputs.shop.address 
// update.phone=inputs.shop.phone
// update.pic=inputs.shop.pic
// update.title=inputs.shop.title
// Models.Topic.update({_id:inputs.shop._id},update,cb)
