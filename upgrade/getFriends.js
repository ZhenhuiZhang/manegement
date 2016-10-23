var db_main = require('../app/models/index_main.js')
var moment = require('moment')

var from = new moment('2016-09-15T16:00:00Z')
var to = new moment('2016-09-16T16:00:00Z')

function main(data_from,data_to,cb){
    db_main.Friends.count({follow_user_id: 1460394,create_at: {$gte: data_from.toDate(),$lt:data_to.toDate()}},function(err,count){
        console.log(count+ ',')
        var date_end= new moment('2016-09-21T16:00:00Z')
        if(data_to.format('l') == date_end.format('l')){
            return
        }else{
            cb(data_from.add(1,'day'),data_to.add(1,'day'),cb)
        }
    })
}

main(from,to,main)