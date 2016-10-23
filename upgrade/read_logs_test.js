var readline = require('linebyline')
var moment = require('moment')
var getTimezone = require('moment-timezone');
var db_main = require('../app/models/index_main')
var Share = db_main.Share
var EventProxy   = require('eventproxy');

var from = new moment('2016-09-25T17:00:00Z')
console.log(from.toDate())

function init(date,cb){

    //定义文件夹名称
    var rl = readline('../../data/click_log/'+date.format('YYYYMMDDHH')+'/data.log')
    var datas = []
    rl.on("line", function (line, lineCount, byteCount){
        // do something with the line of converted text
        var read_data = {}
        var exp = line.split('`')
        exp.forEach(function(ele){
            var _ele = ele.split('=')
            read_data[_ele[0]] = _ele[1]
        })

        if(read_data.hasOwnProperty('ft') && read_data.hasOwnProperty('uid') && read_data.hasOwnProperty('aid')){
            var create_at = moment.tz(read_data.stm,'Asia/Shanghai').utc().toDate()
            var data = {
                share_id : 1,
                user_id : read_data.uid,
                share_user_id : read_data.aid,
                channel : read_data.ft,
                loginname: read_data.loginname,
                create_at: create_at,
                source: 0
            }
            datas.push(data)
        }
    }).on("end",function(){
        var ep = new EventProxy();

        var _date = moment.tz(date.toDate(),"Asia/Jakarta").hours(0)
        var _to = moment.tz(date.toDate(),"Asia/Jakarta").hours(0).add(1,'days')
        datas.forEach(function(ele,index){
            setTimeout(function(){
                Share.count({
                    user_id: Number(ele.user_id),
                    share_user_id: Number(ele.share_user_id),
                    create_at: {
                        $gte: _date.toDate(),
                        $lt: _to.toDate()
                    }
                },function(err,count){
                    if(count >= 5){
                        ep.emit('data')
                        console.log(count)
                    }else{
                        Share.create(ele,function(err){
                            if(err) console.log(err)

                            ep.emit('data')
                        })
                    }
                })
            },index*100)
        })

        ep.after('data',datas.length,function(){
            var now = new moment()
            if(date.format('YYYYMMDDHH') != now.format('YYYYMMDDHH')){
                console.log(date.format('YYYYMMDDHH'),':success')
                date.add(1,'hours')
                cb(date,cb)
            }
        })
    });
}

init(from,init)