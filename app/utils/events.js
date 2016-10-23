var events = new (require('events')).EventEmitter();

/**
 * 封装events，主要用于封装用户事件
 */
module.exports = {
    userEmit:function(uid,event,data){
//        console.log('userEmit broadcast_u_'+ uid);
        events.emit('broadcast_u_'+ uid , {event:event , data:data});
    },
    userOn:function(uid,fn){
        events.on('broadcast_u_'+uid , fn);
    },
    broadcastOn:function(fn){
        events.on('broadcast', fn);
    },
    /**
     * 发起一个广播事件。调用socket向所有客户端广播
     * @param event
     * @param data
     */
    broadcastEmit:function(event,data){
//        console.log('events broadcast'+ event + data);
        events.emit('broadcast', {event:event , data:data});
    },
    //对events.on的封装
    on:function(event,fn){
        events.on(event, fn);
    },
    //对events.emit的封装
    emit:function(event,data){
        events.emit(event, data);
    },

    instance:function(){
        return events;
    }
}