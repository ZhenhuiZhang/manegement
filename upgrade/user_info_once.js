var db_readonly = require('../app/models/index_readonly')
var logger = require('../app/common/logger').logger('user_info_once');
var json2csv = require('json2csv');
var fs = require('fs')
var path = require('path')

var User = db_readonly.User

function main() {
    User.find({level:{$gte:35}},function(err,rd){
        rd.forEach(function(ele){
            ele.loginname = ele.loginname.replace(',','')
        })
        var fields = ['user_id','loginname','level','mobile','create_at','update_at','account','anchor_group']
        var csv = json2csv({ data: rd, fields: fields});

        var dataBuffer = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);

        fs.writeFile(path.join(__dirname,'../dashboard/other/user_info(35)_once.csv'), dataBuffer, function(err) {
            if (err) throw err;
            console.log('user_info_once.csv saved');
        });
    })
}

main()