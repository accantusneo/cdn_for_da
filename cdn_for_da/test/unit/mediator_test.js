module('Mediator Testing');
test('on calling subscribe channels should get registered', function() {
	var sample = TimeSeries.mediator.subscribe('sampleEvent',function() {return true;});
	ok(sample,'subscription successful.');
	ok(TimeSeries.mediator.channels['sampleEvent'],'Event Registered.');
	ok(TimeSeries.mediator.channels['sampleEvent'].callback(),'method executed');
});

test('on calling publish method the registered function should get executed', function() {
	ok(TimeSeries.mediator.publish('sampleEvent'),"the event 'sampleEvent' has property executed.");
});

test('on calling unsubscribe method the registered function should get deleted', function() {
	TimeSeries.mediator.unsubscribe('sampleEvent');
	equal(TimeSeries.mediator.publish('sampleEvent'), false, "on publish 'false' is returned as the method has already been unsubscribed");
});

