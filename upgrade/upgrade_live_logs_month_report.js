//自动运行脚本，生成前一天月报表

var moment = require('moment');
var cms_report_db = require('../app/models/report')
var logger = require('../app/common/logger').logger('live_logs_month_report');
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var LiveLogsMonthReport =cms_report_db.LiveLogsMonthReport

//获取日期范围
var from = new moment('2016-06-01T00:00:00.000').startOf('day')
var to = new moment('2016-06-01T23:59:59.999').startOf('day')
to.hours(23);
to.minutes(59);
to.seconds(59);
to.milliseconds(999);

function init(cb,date_from,date_to){
    var start = new Date()

    // //获取日期范围
    // var from = new moment().add(-1,'day').startOf('day')
    // var to = new moment().add(-1,'day').startOf('day')
    // to.hours(23);
    // to.minutes(59);
    // to.seconds(59);
    // to.milliseconds(999);

    var where = {
        date : {
            $gte: date_from.toDate(), $lte: date_to.toDate() 
        }
    }

    LiveLogsDayReport.aggregate([
        {
            $match:where
        },
        {
            $group:{
                _id:{
                    user_id: '$user_id',
                    platform: "$platform",
                    // host_manager: "$host_manager",
                    // manager_name: "$manager_name",
                    // anchor_group: "$anchor_group",
                    date:{$dateToString: { format: "%Y-%m", date: "$date"}},
                    anchor_group: '$anchor_group'
                },
                loginname: {$first:"$loginname"},
                sum_count: {$sum: "$sum_count"},
                sum_live_times: { $sum: "$sum_live_times" },
                sum_revence: { $sum: "$sum_revence" },
                sum_UV: { $sum: "$sum_UV" },
                sum_DAU: { $sum: "$sum_DAU" },
                sum_follow_count: { $sum: "$sum_follow_count" },
                sum_gift_count: { $sum: "$sum_gift_count" },
            }
        },
        {
            $project: {
                sum_count: 1,
                sum_live_times: 1,
                sum_revence: 1,
                sum_UV: 1,
                sum_DAU: 1,
                sum_follow_count: 1,
                sum_gift_count: 1,
                loginname: 1,
            }
        }])
        .allowDiskUse(true).exec(function(err,rd){

            // console.log(err,rd)
            rd.forEach(function(element,index) {
                element.user_id = element._id.user_id
                element.platform = element._id.platform
                // element.anchor_group = element._id.anchor_group
                element.date = new Date(element._id.date)
                element.year = element.date.getFullYear()
                element.month = element.date.getMonth()+1
                element.anchor_group = element._id.anchor_group


                delete element._id
                delete element.user

                LiveLogsMonthReport.findOne({
                    user_id:element.user_id,
                    platform: element.platform,
                    host_manager: element.host_manager,
                    year:element.year,
                    month:element.month
                },function(err,datas){
                    if(datas){
                        var where = {};where._id = datas._id
                        
                        delete datas._id
                        var update = datas
                        update.sum_count += element.sum_count
                        update.sum_live_times += element.sum_live_times
                        update.sum_revence += element.sum_revence
                        update.sum_UV += element.sum_UV
                        update.sum_DAU += element.sum_DAU
                        update.sum_follow_count += element.sum_follow_count
                        update.sum_gift_count += element.sum_gift_count

                        update['day_live_times_'+date_from.date()] = element.sum_live_times
                        update['day_revence_'+date_from.date()] = element.sum_revence
                        update['day_UV_'+date_from.date()] = element.sum_UV
                        update['day_DAU_'+date_from.date()] = element.sum_DAU
                        update['day_follow_count_'+date_from.date()] = element.sum_follow_count
                        update['day_gift_count_'+date_from.date()] = element.sum_gift_count

                        LiveLogsMonthReport.update(where,{$set:update},{new:true,upsert:true},function(err){
                            if(err) console.log(err,'update')

                            if(rd.length == (index+1)){
                                logger.info(date_from.format(),date_to.format(),'live_logs_month_report init success!')
                                
                                var now = new moment()
                                date_from.add(1,'days')
                                date_to.add(1,'days')
                                if(date_from.format('L') == now.format('L')){
                                    return
                                }else{
                                    cb(cb,date_from,date_to) 
                                }
                            }
                        })
                    }else{
                        var create = element 
                        create['day_live_times_'+date_from.date()] = element.sum_live_times
                        create['day_revence_'+date_from.date()] = element.sum_revence
                        create['day_UV_'+date_from.date()] = element.sum_UV
                        create['day_DAU_'+date_from.date()] = element.sum_DAU
                        create['day_follow_count_'+date_from.date()] = element.sum_follow_count
                        create['day_gift_count_'+date_from.date()] = element.sum_gift_count

                        LiveLogsMonthReport.create(create,function(err){
                            if(err) console.log(err,'create')

                            if(rd.length == (index+1)){
                                logger.info(date_from.format(),date_to.format(),'live_logs_month_report init success!')
                                
                                var now = new moment()
                                date_from.add(1,'days')
                                date_to.add(1,'days')
                                if(date_from.format('L') == now.format('L')){
                                    return
                                }else{
                                    cb(cb,date_from,date_to) 
                                }
                            }
                        })
                    } 
                })
            }, this);

            // logger.info('live_logs_month_report init success!')

            // console.log(err,rd)
    })
}

init(init,from,to)



