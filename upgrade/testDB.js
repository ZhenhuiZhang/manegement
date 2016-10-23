var Mongoose = require('mongoose');
var logger = require('../app/common/logger').logger('test');
var Schema    = Mongoose.Schema;

ModulesReadonly.User.find({user_id:10011},function(err,params) {
    console.log('ModulesReadonly.users.find',err,params)  
})

// Modules.Admin.count({},function(err,params) {
//     console.log('Modules.Admin.count',err,params)  
// })

// ModulesReport.GiftItemDayReport.count({},function(err,params) {
//     console.log('Modules.GiftItemDayReport.count',err,params)  
// })

// ModulesReadonly.PayItem.count({},function(err,params) {
//     console.log('ModulesReadonly.PayItem.count',err,params)  
// })

// ModulesMain.GiftItem.count({},function(err,params) {
//     console.log('ModulesMain.GiftItem.count',err,params)  
// })
