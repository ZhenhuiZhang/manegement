var CONFIG = require('../config');
var models = require('../app/models');
var Role = models.PermissionRole;
var Moduels = models.PermissionModules;
var admin = models.Admin;

var roleUpdate = [
    {
        "name": "super admin",
        "intro": "super admin",
        "privilege_ids": [
            "577b7403961353a60ef71805"
        ]
    },
    {
        "name": "admin",
        "intro": "admin",
        "privilege_ids": []
    },
    {
        "name": "host manager",
        "intro": "host manager",
        "privilege_ids": []
    }
]

var ModuelsUpdate =
    {
        "_id": "577b7403961353a60ef71805",
        "name": "SUPER_ADMIN",
        "__v": 0
    }

var adminUpdate = {
    "adminname": "owen.lin",
    "role": "super admin"
}

Moduels.create(ModuelsUpdate, function (err, rd) {
    console.log(err,rd)
})

roleUpdate.forEach(function (params) {
    Role.create(params, function (err, rd) {
        console.log(err, rd)
    })
})

admin.findOneAndUpdate({ adminname: adminUpdate.adminname }, { $set: adminUpdate }, { upsert: true, new: true }, function (err, rd) {
    console.log(err, rd)
})
