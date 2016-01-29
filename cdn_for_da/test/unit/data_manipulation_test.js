module ("Data Manipulation", {
});

test("deciding the InitialZoomLevel based on the Granularity of data",function() {

    var data = [
        { date: "1/1/2014", value: 13483 },
        { date: "2/1/2014", value: 12747 },
        { date: "3/1/2014", value: 9454 },
        { date: "4/1/2014", value: 12534 },
        { date: "5/1/2014", value: 15343 },
        { date: "6/1/2014", value: 12432 },
        { date: "7/1/2014", value: 10111 }
    ]
        options = {width:25,dataPointsPerPixel:2,processMissingDataPoint:false};

    var date_format = TimeSeries.dateFormatFunctions.detectDateFormat("dataManipulationTesting",data,"date");
    var x = TimeSeries.dataManipulationFunctions.dataProcessing(data, "date", date_format.format_data, date_format.format, options);
    deepEqual(x.initial_zoom_level, 50, "InitialZoomLevel detected");
});

test("finding missing data points from the dataset",function() {
    var data = [
        { date: "1420050660000", value: 13483 },
        { date: "1420050720000", value: 12747 },
        { date: "1420050900000", value: 9454 },
        { date: "1420050960000", value: 12534 },
        { date: "1420051080000", value: 15343 }
    ],
        expected_output = [
            { date: 1420050780000, value: "NA" , "isRawData": false},
            { date: 1420050840000, value: "NA" , "isRawData": false},
            { date: 1420051020000, value: "NA" , "isRawData": false}
        ],
        date_field = "date",
        minimumTimeStep = 1,
        minimumTimeStepGranularity = "minute",
        actual_milliseconds_array = [1420050660000, 1420050720000, 1420050900000, 1420050960000, 1420051080000],
        unique_time_steps = [],
        unique_time_steps_count = [],
        obj = { date: "NA", value: "NA" };

    var date_format = TimeSeries.dateFormatFunctions.detectDateFormat("dataManipulationTesting",data,"date");

    var x =
    TimeSeries.dataManipulationFunctions.findMissingDataPoint(data, date_field, minimumTimeStep, minimumTimeStepGranularity, actual_milliseconds_array, unique_time_steps, unique_time_steps_count, obj);
    ok(x, "Found missing data points with minimumTimeStep passed as parameter");
    deepEqual(x, expected_output, "in " + data);
});

test("appending missing data points to the dataset",function() {
    var data = [
        { date: "1420050660000", value: 13483 },
        { date: "1420050720000", value: 12747 },
        { date: "1420050900000", value: 9454 },
        { date: "1420050960000", value: 12534 },
        { date: "1420051080000", value: 15343 }
    ],
        expected_output = [
            { date: 1420050660000, value: 13483 ,"isRawData": true},
            { date: 1420050720000, value: 12747 ,"isRawData": true},
            { date: 1420050900000, value: 9454 ,"isRawData": true},
            { date: 1420050960000, value: 12534 ,"isRawData": true},
            { date: 1420051080000, value: 15343 ,"isRawData": true},
            { date: 1420050780000, value: "NA" ,"isRawData": false},
            { date: 1420050840000, value: "NA" ,"isRawData": false},
            { date: 1420051020000, value: "NA" ,"isRawData": false}
        ]
        options = {width:25,dataPointsPerPixel:2,processMissingDataPoint:true,minimumTimeStep:1,minimumTimeStepGranularity:"minute"};

    var date_format = TimeSeries.dateFormatFunctions.detectDateFormat("dataManipulationTesting",data,"date");
    var x = TimeSeries.dataManipulationFunctions.dataProcessing(data, "date", date_format.format_data, date_format.format, options);

    deepEqual(x.initial_zoom_level, 50, "InitialZoomLevel detected");
    var x = TimeSeries.dataManipulationFunctions.dataProcessing(data, "date", date_format.format_data, date_format.format, {processMissingDataPoint:true});
    ok(x, "The missing data points are appended with auto calculation of minimumTimeStep");
    deepEqual(x.data, expected_output, "in " + data);
});

test("heapSort on passing data,date field and date format converts date into timestamp and sorts data",function() {
    var unsorted_data = [
        {date: "2011-11-14T17:07:21Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab"},
        {date: "2011-11-14T16:20:19Z", quantity: 2, total: 190, tip: 100, type: "tab"},
        {date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 200, type: "visa"},
        {date: "2011-11-14T16:30:43Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T17:22:59Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:48:46Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:53:41Z", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:54:06Z", quantity: 1, total: 100, tip: 0, type: "cash"},
        {date: "2011-11-14T16:58:03Z", quantity: 2, total: -21, tip: 0, type: "tab"},
        {date: "2011-11-14T17:25:45Z", quantity: 2, total: 200, tip: 0, type: "cash"},
        {date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 100, type: "visa"}
    ]
        options = {width:25,dataPointsPerPixel:2,processMissingDataPoint:true,minimumTimeStep:1,minimumTimeStepGranularity:"minute"},
        date_format = TimeSeries.dateFormatFunctions.detectDateFormat("dataManipulationTesting",unsorted_data,"date"),
        sorted_data = TimeSeries.dataManipulationFunctions.sort(unsorted_data,"date",date_format.format,false);
    deepEqual(sorted_data[0],{date: 1321287474000, quantity: 2, total: 190, tip: 100, type: "tab", "isRawData": true},"The data is sorted");
    date_format = TimeSeries.dateFormatFunctions.detectDateFormat("dataManipulationTesting",sorted_data,"date");
    var x = TimeSeries.dataManipulationFunctions.dataProcessing(sorted_data, "date", date_format.format_data, date_format.format, options);
    deepEqual(x.initial_zoom_level, 50, "initial_zoom_level detected");
});

test("Dataset simplification", function () {
    var data = [
        { key: 1420050660000, value: 13483 ,"isRawData": true},
        { key: 1420050720000, value: 12747 ,"isRawData": true},
        { key: 1420050780000, value: "NA" ,"isRawData": false},
        { key: 1420050840000, value: "NA" ,"isRawData": false},
        { key: 1420050900000, value: 9454 ,"isRawData": true},
        { key: 1420050960000, value: 12534 ,"isRawData": true},
        { key: 1420051020000, value: "NA" ,"isRawData": false},
        { key: 1420051080000, value: 15343 ,"isRawData": true},
        { key: 1420051140000, value: 3521 ,"isRawData": true},
        { key: 1420051200000, value: 16243 ,"isRawData": true}
    ]

    var simplified_data = TimeSeries.mediator.publish("simplifyDataset", data, 5);

    equal(simplified_data.length, 6, "dataset simplified to size of 6 given 5 as output limit");

});
