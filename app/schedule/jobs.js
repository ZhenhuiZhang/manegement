var schedule = require('node-schedule');
var config = require('../../config');
// require('./app/jobs/calc_anchor_middle_weight')();
// require('./app/jobs/calc_banner_middle_weight')();

module.exports = function() {
    var j = schedule.scheduleJob(config.anchor_middle_object_cron, function(){
        console.log('ready to execute ./app/jobs/calc_anchor_middle_weight');
        require('../jobs/calc_anchor_middle_weight')();
        console.log('ready to execute ./app/jobs/calc_banner_middle_weight');
        require('../jobs/calc_banner_middle_weight')();
    })
}