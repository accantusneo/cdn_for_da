var data = [
    {date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"},
    {date: "2011-11-14T16:20:19", quantity: 2, total: 190, tip: 100, type: "tab"},
    {date: "2011-11-14T16:28:54", quantity: 1, total: 300, tip: 200, type: "visa"},
    {date: "2011-11-14T16:30:43", quantity: 2, total: 90, tip: 0, type: "tab"},
    {date: "2011-11-14T16:48:46", quantity: 2, total: 90, tip: 0, type: "tab"},
    {date: "2011-11-14T16:53:41", quantity: 2, total: 90, tip: 0, type: "tab"},
    {date: "2011-11-14T16:54:06", quantity: 1, total: 100, tip: 0, type: "cash"},
    {date: "2011-11-14T16:58:03", quantity: 2, total: -21, tip: 0, type: "tab"},
    {date: "2011-11-14T17:07:21", quantity: 2, total: 90, tip: 0, type: "tab"},
    {date: "2011-11-14T17:22:59", quantity: 2, total: 90, tip: 0, type: "tab"},
    {date: "2011-11-14T17:25:45", quantity: 2, total: 200, tip: 0, type: "cash"},
    {date: "2011-11-14T17:29:52", quantity: 1, total: 200, tip: 100, type: "visa"}
];

module('Smoothing');

test('Removing noise from the dataset', function() {
    var output = TimeSeries.mediator.publish("removeNoise", data, 0.2, "Moving average")
    equal(output.length, data.length, "with smoothing index as 0.2 and method as Moving average");
});
