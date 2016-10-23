var db_readonly = require('../app/models/index_readonly')
var logger = require('../app/common/logger').logger('user_level_once');
var json2csv = require('json2csv');
var fs = require('fs')
var path = require('path')

var User = db_readonly.User

function main() {
    User.aggregate([
        {
            $group:{
                _id: {
                    level: '$level'
                },
                count: {$sum : 1}
            }
        },
        {
            $sort: {
                '_id.level': 1
            }
        }
    ],function(err,rd){
        if(err) logger.error(err)

        rd.forEach(function(ele){
            ele.level = ele._id.level

            delete ele._id
        })

        var fields = ['level','count']
        var fieldNames = ['level','count']
        var csv = json2csv({ data: rd, fields: fields,fieldNames: fieldNames });

        fs.writeFile(path.join(__dirname,'../dashboard/other/user_level_once.csv'), csv, function(err) {
            if (err) throw err;
            console.log('user_level_once.csv saved');
        });
    })
}

main()