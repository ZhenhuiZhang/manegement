
'use strict'
var CONFIG  = require('../../config');
var apiclient  = require('../common/api_client');
var tools  = require('../common/tools');
var Models = require('../models');
var md5 = require('md5');
var logger = require('../common/logger').logger('job/calc_recommend_middle_weight');
var eventproxy = require('eventproxy');



function updateMiddleObjectBanner(){
    var ep = new eventproxy();
    var middle_object = {},  options ={multi: true, upsert: false};
    
    ep.all('allAnchors', 'anchorModel', function(allAnchors, anchorModel){
        anchorModel.forEach(function(anchor){
            var params = {
                where: { content_type: 'anchor', content: anchor.user_id + ""},
                update: { set: {} },
                options: { multi: true, upsert: false }
            };
            params.update.set["anchor_live"] = anchor.anchor_live;
            params.update.set["live_platform"] = anchor.live_platform;
            params.update.set["viewers"] = anchor.viewers;
            
            apiclient.post('/banner/cmsMiddleObjectUpdate', params, function (err, data) {
                if (err) {
                    logger.error('update effected middle_object of anchor status fail!', err, data);
                }
            });
        });
        logger.info('calc middle object ok.');
    });
    
    //查找banner对应主播的状态
    ep.all('allAnchors', function(allAnchors){
        var _array = Object.getOwnPropertyNames(allAnchors);
        var params = {
            group: 'anchor',
            user_id: _array.join(','),
            limit: Number.MAX_SAFE_INTEGER,
            page: 1,
        }
        apiclient.post('/user/find', params, function(err, data){
            if (err || data.code != 0) {
                logger.error('fetch anchor status fail.', err, data);
                return;
            }
            ep.emit('anchorModel', data.body.models);
        });
    });

    ep.once('afterUpdate',function(ids){
       // 获取当前有效的推荐banner
        apiclient.get('/banner/find',{
            enable: 1, is_effect: 1, limit: Number.MAX_SAFE_INTEGER
        }, function(err, data){
            if (err || data.code != 0) {
                logger.error('fetch effect banner fail.', err, data);
                return;
            }
            var _idsisWork = [];
            data.body.models.filter(function (item) {
                if (!item.middle_object || (item.middle_object && item.middle_object.realtime_effect !=1)) _idsisWork.push(item._id);
            }); 
            if(_idsisWork.length !=0){
                var total = {
                        user: "cms system",
                        operation: "banner_cmsMiddleObjectUpdate",
                        origin_content: "Update failed:" + _idsisWork.length + ",Failed ID:" + _idsisWork.join(","),
                    }
                Models.OperateLog.create(total, function(err,rd){});
            }
        })
    })

    //获取总共要被操作的主播（既包含在推荐时段的，也包含不在的）
    apiclient.post('/banner/commonAggregator', {
        where : {
            content_type: "anchor"
        },
        group: {
            _id: {anchor: "$content"},
            count: { $sum: 1 }
        }
    }, function(err, data){
        if (err || data.code != 0) {
            logger.error('fetch all banner of anchor fail.', err, data);
            return;
        }
        if (!data.body) {
            logger.info('there is no banner of anchor');
            return;
        } else {
            var allAnchors = {};
            data.body.forEach(function(item){
                allAnchors[item._id.anchor] = item;
            });   
            ep.emit('allAnchors', allAnchors);
        }
    });
    
    // 获取当前有效的推荐banner
    apiclient.get('/banner/find',{
        enable: 1, is_effect: 1, limit: Number.MAX_SAFE_INTEGER
    }, function(err, data){
        if (err || data.code != 0) {
            logger.error('fetch effect banner fail.', err, data);
            return;
        }
        if (!data.body) {
            logger.info('there is no banner of anchor');
            return;
        } else {
            var _ids = [];
            data.body.models.forEach(function (item) {
                _ids.push(item._id);
            }); 

            //更新那些不在有效的的banner
            var params = {
                where: {},
                update: {unset: {}},
                options: {multi: true, upsert: false}
            }
            params.update.unset["realtime_effect"] = "";
            apiclient.post('/banner/cmsMiddleObjectUpdate', params, function(err, data){
                if (err)
                    logger.error('update uneffected middle_object fail!', err, data);
                //更新那些在有效期的的banner的实时的值 
                var params = {
                    where: { _id: { $in: _ids } },
                    update: { set: {} },
                    options: { multi: true, upsert: false }
                };
                params.update.set["realtime_effect"] = 1;
                apiclient.post('/banner/cmsMiddleObjectUpdate', params, function (err, data) {
                    if (err) logger.error('update effected middle_object of realtime_effect fail!', err, data);
                    ep.emit('afterUpdate', "");
                })
            })
        }
    })
}

module.exports = function(){
    updateMiddleObjectBanner('top');
};