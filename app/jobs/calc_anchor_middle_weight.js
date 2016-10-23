'use strict'
var CONFIG  = require('../../config');
var apiclient  = require('../common/api_client');
var tools  = require('../common/tools');
var Models = require('../models');
var md5 = require('md5');
var logger = require('../common/logger').logger('job/calc_recommend_middle_weight');
var eventproxy = require('eventproxy');



function updateMiddleObjectBanner(bannerType){
    var ep = new eventproxy();
    var middle_object = {},  options ={multi: true, upsert: false};
    
    
    //获取总共要被操作的主播（既包含在推荐时段的，也包含不在的）
    apiclient.post('/banner/commonAggregator', {
        where : {
            banner_type: bannerType, content_type: "anchor"
        },
        group: {
            _id: {anchor: "$content"},
            count: { $sum: 1 }
        }
    }, function(err, data){
        if (err || data.code != 0) {
            logger.error('fetch all banner of anchor fail.',bannerType, err, data);
            return;
        }
        if (!data.body) {
            logger.info('there is no banner of anchor', bannerType);
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
        banner_type: bannerType, content_type: 'anchor', enable: 1, is_effect: 1, limit: Number.MAX_SAFE_INTEGER
    }, function(err, data){
        if (err || data.code != 0) {
            logger.error('fetch effect banner of anchor fail.', bannerType, err, data);
            return;
        }
        if (!data.body) {
            logger.info('there is no banner of anchor', bannerType);
            return;
        }

        var effectAnchorsValues = {};
        data.body.models.forEach(function(item){
            if (!effectAnchorsValues[item.content]) {
                effectAnchorsValues[item.content]  = effectAnchorsValues[item.content]  || {};
                let platform_arr = typeof(item.platform)=='object' ? item.platform : [item.platform.replace(',','')];
                platform_arr.forEach(function(platform) {
                    if(!platform)return;
                    var obj = {}
                    if(item.weight && item.weight!='undefined')obj.weight = item.weight  
                    if(item.pic && item.pic!='undefined')obj.pic = item.pic  
                    if(item.title && item.title!='undefined')obj.title = item.title  
                    effectAnchorsValues[item.content][platform] = obj
                })
            }
        })   
        ep.emit('effectAnchorsValues', effectAnchorsValues);
    })

    ep.all('allAnchors', 'effectAnchorsValues', function(allAnchors, effectAnchorsValues){
        //逻辑是这样的，因为推荐是有时效性，那么，现在能获取到当前有效的banner,同时也获取全部banner对应的用户
        //因此，可以通过相减，获取到那些不在有效时间区间的banner，从而撤销其对应的对象.
        Object.getOwnPropertyNames(effectAnchorsValues).forEach(function(id){
            delete allAnchors[id];          //删除有效期内的用户
            
            var data = {
                where: {user_id: id},
                update: {set: {}},
                options: {multi: false, upsert: false}
            };
            data.update.set[bannerType] = effectAnchorsValues[id];
            apiclient.post('/user/cmsMiddleObjectUpdate',data, function(err, data){
                if (err) {
                    logger.error('update effected anchor middle_object fail!',bannerType, err, data);
                }
            });
        }); 
        var notEffectAnchors = [];
        Object.getOwnPropertyNames(allAnchors).forEach(function(id){
            notEffectAnchors.push(id); 
        });
        if (notEffectAnchors.length > 0) {
            var params = {
                where: {user_id: {$in: notEffectAnchors}},
                update: {unset: {}},
                options: {multi: true, upsert: false}
            };
            params.update.unset[bannerType] = '';
            apiclient.post('/user/cmsMiddleObjectUpdate', params, function (err, data) {
                if (err) {
                    logger.error('batch update no effect anchor middle object fail!', err, data);
                }
            });
        }
        logger.info('calc middle object ok.', bannerType);
    })
}

module.exports = function(){
    updateMiddleObjectBanner('recommend');
    updateMiddleObjectBanner('top');
};