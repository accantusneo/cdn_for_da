/*
@author Pykih developers
@module mediator
@namespace TimeSeries
*/
TimeSeries.mediator = (function(){
    var subscribe = function(channel, fn){
        if (!TimeSeries.mediator.channels[channel]) TimeSeries.mediator.channels[channel] = {};
        TimeSeries.mediator.channels[channel] = { context: this, callback: fn };
        return this;
    };

    var publish = function(channel){
        console.log(TimeSeries.mediator.channels[channel], channel);
        if (!TimeSeries.mediator.channels[channel]) {
            return false;
        }

        // console.log(arguments,">>>>>>>>>>>>>>>> MEDIATOR");
        var args = Array.prototype.slice.call(arguments, 1),
            subscription = TimeSeries.mediator.channels[channel];

        console.log(subscription.context, args);

        return subscription.callback.apply(subscription.context, args);
    };

    var publishToAll = function(callbacks) {
        if(callbacks && callbacks.length!==0) {
            var actual_function,
                attribute_array,
                attribute_array_length,
                function_name,
                function_context,
                callbacks_length = callbacks.length,
                i;

            for(i=0;i<callbacks_length;i++) {
                function_name = callbacks[i].function_name;
                actual_function = TimeSeries.mediator.channels[function_name].callback;
                function_context = TimeSeries.mediator.channels[function_name].context;
                attribute_array = callbacks[i].attribute;
                console.log(callbacks[i].callback, callbacks[i], callbacks[i].attribute);
                actual_function.apply(function_context,attribute_array);
                console.log("helooooooooooo");
            }
        }
    };

    var unsubscribe = function(channel) {
        delete TimeSeries.mediator.channels[channel];
    };

    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        unsubscribe:unsubscribe,
        publishToAll:publishToAll
    };

}());
