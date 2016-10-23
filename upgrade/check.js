//自动运行脚本，生成前一天日报表
var config = require('../config')

var moment = require('moment');
var mongoose = require('mongoose');
var cms_report_db = require('../app/models/index_report')
var db_readonly = require('../app/models/index_readonly')
var logger = require('../app/common/logger').logger('live_logs_day_report');
var json2xls = require('json2xls');
var fs = require('fs')
var PayItemDayReport = cms_report_db.PayItemDayReport
var GiftItemDayReport = cms_report_db.GiftItemDayReport
var LiveLogsDayReport = cms_report_db.LiveLogsDayReport
var PayItemMonthReport = cms_report_db.PayItemMonthReport
var GiftItemMonthReport = cms_report_db.GiftItemMonthReport
var LiveLogsMonthReport = cms_report_db.LiveLogsMonthReport

var PayItem = db_readonly.PayItem
var GiftItem = db_readonly.GiftItem
var LiveLogs = db_readonly.LiveLogs

var user_id = [ 407523,
                246934,
                80531,
                373420,
                401605,
                349106,
                412786,
                190420,
                400579,
                384261,
                398218,
                173995,
                291361,
                390807,
                379921,
                261735,
                184640,
                407286,
                407279,
                390150,
                401736,
                408611,
                391161,
                398853,
                386806,
                407010,
                313288,
                406892,
                378114,
                396230,
                322485,
                382874,
                409592,
                400917,
                407188,
                406828,
                381173,
                185719,
                403199,
                408969,
                406599,
                180886,
                388752,
                407106,
                406813,
                397692,
                344642,
                379320,
                373106]

function init(cb,ele,date_from,date_to,month_obj){

    var create_at = {
        $gte: date_from.toDate(), $lte: date_to.toDate() 
    }
    PayItem.find({user_id:ele,create_at:create_at},function(err,datas) {

        // console.log(datas)
        var price = 0
        var gold = 0

        datas.forEach(function(element) {
            price += element.price || 0
            gold += element.gold || 0
        }, this);

        var data = {
            user_id:ele,
            date: date_from.format(),
            gold: gold,
            price:price
        }

        PayItemDayReport.find({user_id:ele,date:create_at},function(err,rd){
            // console.log(datas)
            var price_day = 0
            var gold_day = 0

            rd.forEach(function(element) {
                price_day += element.sum_account || 0
                gold_day += element.gold || 0
            }, this);

            month_obj.pay_item_month_gold += gold_day
            month_obj.pay_item_month_price += price_day

            var data_day = {
                user_id:ele,
                date: date_from.format(),
                gold: gold_day,
                price:price_day
            }
            if(equal(data,data_day)){
                logger.info(date_from.format('L'),date_to.format('L'),'user_id:'+ele,'pay_item same')
            }else{
                logger.error(date_from.format('L'),date_to.format('L'),'user_id:'+ele,'pay_item diff',data,data_day)
            }

            GiftItem.find({receive_user_id:ele,create_at:create_at},function(err,datas) {

                // console.log(datas)
                var account = 0

                datas.forEach(function(element) {
                    account += element.account || 0
                }, this);

                var data = {
                    receive_user_id:ele,
                    date: date_from.format(),
                    account:account
                }

                GiftItemDayReport.find({receive_user_id:ele,date:create_at},function(err,rd){
                    // console.log(datas)
                    var account_day = 0

                    rd.forEach(function(element) {
                        account_day += element.sum_account || 0
                    }, this);

                    month_obj.gift_item_month_account += account_day

                    var data_day = {
                        receive_user_id:ele,
                        date: date_from.format(),
                        account:account_day
                    }
                    if(equal(data,data_day)){
                        logger.info(date_from.format('L'),date_to.format('L'),'user_id:'+ele,'gift_item same')
                    }else{
                        logger.error(date_from.format('L'),date_to.format('L'),'user_id:'+ele,'gift_item diff',data,data_day)
                    }

                    LiveLogs.find({user_id:ele,create_at:create_at},function(err,datas) {

                        // console.log(datas)
                        var live_times = 0
                        var revence = 0
                        var UV = 0
                        var follow_count = 0
                        var gift_count = 0

                        datas.forEach(function(element) {
                            live_times += element.live_times || 0
                            revence += element.revence || 0
                            UV += element.UV || 0
                            follow_count += element.follow_count || 0
                            gift_count += element.gift_count || 0
                        }, this);

                        var data = {
                            user_id:ele,
                            date: date_from.format(),
                            live_times:live_times,
                            revence:revence,
                            UV:UV,
                            follow_count:follow_count,
                            gift_count:gift_count
                        }

                        LiveLogsDayReport.find({user_id:ele,date:create_at},function(err,rd){
                            // console.log(datas)
                            var live_times_day = 0
                            var revence_day = 0
                            var UV_day = 0
                            var follow_count_day = 0
                            var gift_count_day = 0

                            rd.forEach(function(element) {
                                live_times_day += element.sum_live_times || 0
                                revence_day += element.sum_revence || 0
                                UV_day += element.sum_UV || 0
                                follow_count_day += element.sum_follow_count || 0
                                gift_count_day += element.sum_gift_count || 0
                            }, this);

                            month_obj.live_logs_month_live_times += live_times_day
                            month_obj.live_logs_month_recence += revence_day
                            month_obj.live_logs_month_UV += UV_day
                            month_obj.live_logs_month_follow_count += follow_count_day
                            month_obj.live_logs_month_gift_count += gift_count_day

                            var data_day = {
                                user_id:ele,
                                date: date_from.format(),
                                live_times:live_times_day,
                                revence:revence_day,
                                UV:UV_day,
                                follow_count:follow_count_day,
                                gift_count:gift_count_day
                            }
                            if(equal(data,data_day)){
                                logger.info(date_from.format('L'),date_to.format('L'),'user_id:'+ele,'live_logs same')
                            }else{
                                logger.error(date_from.format('L'),date_to.format('L'),'user_id:'+ele,'live_logs diff',data,data_day)
                            }

                            var now = new moment('2016-08-01T23:59:59.999')
                            date_from.add(1,'days')
                            date_to.add(1,'days')
                            if(date_from.format('L') == now.format('L')){
                                // var xls = json2xls(all_data);
                                // fs.writeFileSync(ele+'.xlsx', xls, 'binary');
                                var month_from = new moment('2016-07-01T00:00:00.000').startOf('day')
                                var month_to = new moment('2016-07-31T23:59:59.999').startOf('day')
                                var create_at_month = {
                                    $gte: month_from.toDate(), $lte: month_to.toDate() 
                                }

                                // logger.info('user_id:'+ele,'pay_item_month_gold:'+month_obj.pay_item_month_gold,'pay_item_month_price:'+month_obj.pay_item_month_price,'live_logs_month_live_times:'+month_obj.live_logs_month_live_times,'live_logs_month_recence:'+month_obj.live_logs_month_recence,'live_logs_month_UV:'+month_obj.live_logs_month_UV,'live_logs_month_follow_count:'+month_obj.live_logs_month_follow_count,'live_logs_month_gift_count:'+month_obj.live_logs_month_gift_count)
                                PayItemMonthReport.find({user_id:ele,date:create_at_month},function(err,rd_month){
                                    // console.log(datas)
                                    var price_month = 0
                                    var gold_month = 0

                                    rd_month.forEach(function(element) {
                                        price_month += element.sum_account || 0
                                        gold_month += element.gold || 0
                                    }, this);

                                    if((month_obj.pay_item_month_gold == gold_month) && (month_obj.pay_item_month_price == price_month)){
                                        logger.info('user_id:'+ele,'pay_item_month_report same')
                                    }
                                    else {
                                        logger.info('user_id:'+ele,'pay_item_month_gold_from_day:'+month_obj.pay_item_month_gold,'pay_item_month_gold_from_month:'+gold_month,'pay_item_month_price_from_day:'+month_obj.pay_item_month_price,'pay_item_month_price_from_month:'+price_month)
                                    }
                                })
                                GiftItemMonthReport.find({receive_user_id:ele,date:create_at_month},function(err,rd){
                                    // console.log(datas)
                                    var account_month = 0

                                    rd.forEach(function(element) {
                                        account_month += element.sum_account || 0
                                    }, this);

                                    if((month_obj.pay_item_month_gold == gold_month) && (month_obj.pay_item_month_price == price_month)){
                                        logger.info('user_id:'+ele,'pay_item_month_report same')
                                    }
                                    else{
                                        logger.info('user_id:'+ele,'gift_item_month_account_from_day:'+month_obj.gift_item_month_account,'gift_item_month_account_from_month:'+account_month)
                                    }
                                })
                                LiveLogsMonthReport.find({user_id:ele,date:create_at_month},function(err,rd){
                                    // console.log(datas)
                                    var live_times_month = 0
                                    var revence_month = 0
                                    var UV_month = 0
                                    var follow_count_month = 0
                                    var gift_count_month = 0

                                    rd.forEach(function(element) {
                                        live_times_month += element.sum_live_times || 0
                                        revence_month += element.sum_revence || 0
                                        UV_month += element.sum_UV || 0
                                        follow_count_month += element.sum_follow_count || 0
                                        gift_count_month += element.sum_gift_count || 0
                                    }, this);

                                    if((month_obj.live_logs_month_live_times == live_times_month) && (month_obj.live_logs_month_recence == revence_month) && (month_obj.live_logs_month_UV == UV_month) && (month_obj.live_logs_month_follow_count == follow_count_month) &&(month_obj.live_logs_month_gift_count == gift_count_month)){
                                        logger.info('user_id:'+ele,'live_logs_month_report same')
                                    }
                                    else{
                                        logger.info('user_id:'+ele,'live_logs_month_live_times_from_day:'+month_obj.live_logs_month_live_times,'live_logs_month_live_times_from_month:'+live_times_month,'live_logs_month_recence_from_day:'+month_obj.live_logs_month_recence,'live_logs_month_recence_from_month:'+revence_month,'live_logs_month_UV_from_day:'+month_obj.live_logs_month_UV,'live_logs_month_UV_from_month:'+UV_month,'live_logs_month_follow_count_from_day:'+month_obj.live_logs_month_follow_count,'live_logs_month_follow_count_from_month:'+follow_count_month,'live_logs_month_gift_count_from_day:'+month_obj.live_logs_month_gift_count,'live_logs_month_gift_count_from_month:'+gift_count_month)
                                    }                                
                                })
                            }else{
                                cb(init,ele,date_from,date_to,month_obj)
                            }
                        })
                    })
                })
            })
        })      
    })
}

user_id.forEach(function(ele) {
    var month_obj = {
        pay_item_month_price:0,
        pay_item_month_gold:0,
        gift_item_month_account:0,
        live_logs_month_live_times:0,
        live_logs_month_recence:0,
        live_logs_month_UV:0,
        live_logs_month_follow_count:0,
        live_logs_month_gift_count:0
    }

    //获取日期范围
    var from = new moment('2016-07-01T00:00:00.000').startOf('day')
    var to = new moment('2016-07-01T23:59:59.999').startOf('day')
    to.hours(23);
    to.minutes(59);
    to.seconds(59);
    to.milliseconds(999);
    init(init,ele,from,to,month_obj)
}, this)



function equal(objA, objB)

{
    if (typeof arguments[0] != typeof arguments[1])
        return false;

    //数组
    if (arguments[0] instanceof Array)
    {
        if (arguments[0].length != arguments[1].length)
            return false;
        
        var allElementsEqual = true;
        for (var i = 0; i < arguments[0].length; ++i)
        {
            if (typeof arguments[0][i] != typeof arguments[1][i])
                return false;

            if (typeof arguments[0][i] == 'number' && typeof arguments[1][i] == 'number')
                allElementsEqual = (arguments[0][i] == arguments[1][i]);
            else
                allElementsEqual = arguments.callee(arguments[0][i], arguments[1][i]);            //递归判断对象是否相等                
        }
        return allElementsEqual;
    }
    
    //对象
    if (arguments[0] instanceof Object && arguments[1] instanceof Object)
    {
        var result = true;
        var attributeLengthA = 0, attributeLengthB = 0;
        for (var o in arguments[0])
        {
            //判断两个对象的同名属性是否相同（数字或字符串）
            if (typeof arguments[0][o] == 'number' || typeof arguments[0][o] == 'string')
                result = eval("arguments[0]['" + o + "'] == arguments[1]['" + o + "']");
            else {
                //如果对象的属性也是对象，则递归判断两个对象的同名属性
                //if (!arguments.callee(arguments[0][o], arguments[1][o]))
                if (!arguments.callee(eval("arguments[0]['" + o + "']"), eval("arguments[1]['" + o + "']")))
                {
                    result = false;
                    return result;
                }
            }
            ++attributeLengthA;
        }
        
        for (var o in arguments[1]) {
            ++attributeLengthB;
        }
        
        //如果两个对象的属性数目不等，则两个对象也不等
        if (attributeLengthA != attributeLengthB)
            result = false;
        return result;
    }
    return arguments[0] == arguments[1];
}
