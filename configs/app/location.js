var CONFIG = require('../../config')
/**
 * 国家相关配置
 * */
module.exports ={
    locations : {
        Indonesia: {
            name:'Indonesia', cluster:'SGP', timezone: 'Asia/Jakarta', userid_section:   [ 10000,       20000000], giftid_section:   [ 1000, 99999],
        },
        Malaysia: {
            name:'Malaysia', cluster:'SGP', timezone: 'Asia/Shanghai', userid_section:  [ 20000001,    25000000], giftid_section:   [ 1000, 99999],
        },
        Turkey: {
            name:'Turkey', cluster:'FRA', timezone: 'Europe/Istanbul', userid_section:    [ 25000001,    32000000], giftid_section: [ 100000, 199999],
        },
        Russian: {
            name:'Russian', cluster:'FRA', timezone: 'Europe/Moscow', userid_section:  [ 32000001,    47000000], giftid_section: [ 100000, 199999],
        },
        Vietnam: {
            name:'Vietnam', cluster:'SGP', timezone: 'Asia/Saigon', userid_section:     [ 47000001,    54000000], giftid_section:   [ 1000, 99999],
        },
        Thailand: {
            name:'Thailand', cluster:'SGP', timezone: 'Asia/Bangkok', userid_section:   [ 54000001,    59000000], giftid_section:   [ 1000, 99999],
        }
    },
    /**
     * 返回支持国家英文名字数组
     */
    supportLocations: function(cluster){
        var that = this, countries = [];
        if (!cluster) {
            cluster = CONFIG.cur_cluster;
        }
        Object.getOwnPropertyNames(that.locations).forEach(function(item){
            if (that.locations[item].cluster == cluster){
                countries.push(that.locations[item].name);
            }
        });
        return countries;
    },
    /**
     * 返回支持国家对象
     */
    supportLocationsObj: function(cluster){
        var that = this, countries = [];
        if (!cluster) {
            cluster = CONFIG.cur_cluster;
        }
        Object.getOwnPropertyNames(that.locations).forEach(function(item){
            if (that.locations[item].cluster == cluster){
                countries.push(that.locations[item]);
            }
        });
        return countries;
    }
}