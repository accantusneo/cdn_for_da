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
    ],
    data1 = [
        {date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"},
        {date: "2011-11-14T16:20:19", quantity: 2, total: 190, tip: 100, type: "tab"},
        {date: "2011-11-14T16:28:54", quantity: 1, total: 300, tip: 200, type: "visa"},
        {date: "2011-11-14T16:30:43", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:48:46", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:53:41", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:54:06", quantity: 1, total: 100, tip: 0, type: "cash"},
        {date: "2011-11-14T16:58:03", quantity: 2, total: -21, tip: 0, type: "tab"}
    ],
    data2 = [
        {date: "2011-11-14T16:48:46", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:53:41", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:54:06", quantity: 1, total: 100, tip: 0, type: "cash"},
        {date: "2011-11-14T16:58:03", quantity: 2, total: -21, tip: 0, type: "tab"},
        {date: "2011-11-14T17:07:21", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T17:22:59", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T17:25:45", quantity: 2, total: 200, tip: 0, type: "cash"},
        {date: "2011-11-14T17:29:52", quantity: 1, total: 200, tip: 100, type: "visa"}
    ],
    data3 = [
        {date: "2011-11-14T16:48:46", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 100, tip: 0, type: "cash"},
        {date: 'NaN', quantity: null, total: -21, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 200, tip: 0, type: "cash"},
        {date: 'NaN', quantity: null, total: 200, tip: 100, type: "visa"}
    ],
    data4 = [
        {date: "2011-11-14T16:48:46", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: "2011-11-14T16:54:06", quantity: 1, total: 100, tip: 0, type: "cash"},
        {date: "2011-11-14T16:58:03", quantity: 2, total: -21, tip: 0, type: "tab"},
        {date: "2011-11-14T17:07:21", quantity: 2, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 90, tip: 0, type: "tab"},
        {date: 'NaN', quantity: null, total: 200, tip: 0, type: "cash"},
        {date: 'NaN', quantity: null, total: 200, tip: 100, type: "visa"}
    ],
    old_data = [
        {key: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"},
        {key: "2011-11-14T16:20:19", quantity: 2, total: 190, tip: 100, type: "tab"},
        {key: "2011-11-14T16:28:54", quantity: 1, total: 300, tip: 200, type: "visa"}
    ],
    new_data = [
        {key: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"},
        {key: "2011-11-14T16:20:19", quantity: 2, total: 190, tip: 100, type: "tab"},
        {key: "2011-11-14T16:28:54", quantity: 1, total: 300, tip: 200, type: "visa"},
        {key: "2011-11-14T16:48:46", quantity: 2, total: 90, tip: 0, type: "tab"},
    ],
    chart_cfr_data = [
        { date: 1420050660000, value: 13483 ,"isRawData": true},
        { date: 1420050720000, value: 12747 ,"isRawData": true},
        { date: 1420050780000, value: "NA" ,"isRawData": false},
        { date: 1420050840000, value: "NA" ,"isRawData": false},
        { date: 1420050900000, value: 9454 ,"isRawData": true},
        { date: 1420050960000, value: 12534 ,"isRawData": true},
        { date: 1420051020000, value: "NA" ,"isRawData": false},
        { date: 1420051080000, value: 15343 ,"isRawData": true},
        { date: 1420051140000, value: 3521 ,"isRawData": true},
        { date: 1420051200000, value: 16243 ,"isRawData": true}
    ],
    chart_cfr_data1 = [
        { date: 1420051211111, value: 16243 ,"isRawData": true},
        { date: 1420051222222, value: 16243 ,"isRawData": true},
        { date: 1420051233333, value: 16243 ,"isRawData": true},
        { date: 1420051244444, value: 16243 ,"isRawData": true},
        { date: 1420051255555, value: 16243 ,"isRawData": true}
    ];

module('LiveData test');

TimeSeries.Query.init("table_cfr",data);
TimeSeries.Query.setQuery("table_cfr","query",{"dimension":["date"]});

// test('init on passing table name and type of data udates JSON config', function() {
//     TimeSeries.LiveDataFunctions.init("table1",{"inputDataRange":"Only new data", "outputDataRange":"fixed", "bucketOutputLength":10});
//     deepEqual(TimeSeries.live_data.table1.init_config, {"inputDataRange":"Only new data", "outputDataRange":"fixed", "bucketOutputLength":10}, "init updates JSON config for live data");
// });

test('setData on passing table name and data for input type only new data updated addToBuffer with data points to be added to ', function() {
    TimeSeries.Query.init("table1",[{date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"}]);
    TimeSeries.Query.setQuery("table1","query",{"dimension":["date"]});
    console.log(TimeSeries, "$$$$$$$$$$$$$$$$$$$$$$#########");
    TimeSeries.LiveDataFunctions.init("table1",{"inputDataRange":"All data with null for future", "outputDataRange":"fixed", "bucketOutputLength":10, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    // deepEqual(TimeSeries.live_data.table.init_config, {"inputDataRange":"Only new data", "outputDataRange":"fixed", "bucketOutputLength":10}, "init updates JSON config for live data");
    TimeSeries.chart_configs["table1"] = {data_processed:{min_max_granularity:{}}};
    TimeSeries.LiveDataFunctions.setData("table1","query",data3);
    TimeSeries.LiveDataFunctions.setData("table1","query",data4);
    deepEqual(TimeSeries.live_data['table1'].buffer.length, 1106, "addToBuffer appends data to buffer");
});

test('setData on passing table name and data for input type only new data updated addToBuffer with data points to be added to crossfilter', function() {
    TimeSeries.Query.init("table2",[{date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"}]);
    TimeSeries.Query.setQuery("table2","query",{"dimension":["date"]});
    TimeSeries.chart_configs["table2"] = {data_processed:{min_max_granularity:{}}};
    TimeSeries.LiveDataFunctions.init("table2",{"inputDataRange":"All data with null for future", "outputDataRange":"fixed", "bucketOutputLength":2, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    // deepEqual(TimeSeries.live_data.table.initConfig, {"inputDataRange":"Only new data", "outputDataRange":"fixed", "bucketOutputLength":10}, "init updates JSON config for live data");
    TimeSeries.LiveDataFunctions.setData("table2","query",data3);
    TimeSeries.LiveDataFunctions.setData("table2","query",data4);
    deepEqual(TimeSeries.query_data.table2.cf.size(), 4, "addToBuffer appends data to buffer");
});

test('setData on passing table name and data for input type only new data calls addToBuffer with data points to be added to crossfilter', function() {
    TimeSeries.Query.init("table",[{date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"}]);
    TimeSeries.Query.setQuery("table","query",{"dimension":["date"]});
    TimeSeries.chart_configs["table"] = {data_processed:{min_max_granularity:{}}};
    TimeSeries.LiveDataFunctions.init("table",{"inputDataRange":"Only new data", "outputDataRange":"fixed", "bucketOutputLength":10, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    deepEqual(TimeSeries.live_data.table.init_config, {"inputDataRange":"Only new data", "outputDataRange":"fixed", "bucketOutputLength":10, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true}, "init updates JSON config for live data");
    TimeSeries.LiveDataFunctions.setData("table","query",data);
    deepEqual(TimeSeries.live_data['table'].buffer.length, 4309, "addToBuffer appends data to buffer");
});

test('setData on passing table name and data for input type new + old data calls addToBuffer with data points to be added to crossfilter', function() {
    TimeSeries.Query.init("table",[{date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"}]);
    TimeSeries.Query.setQuery("table","query",{"dimension":["date"]});
    TimeSeries.chart_configs["table"] = {data_processed:{min_max_granularity:{}}};
    TimeSeries.LiveDataFunctions.init("table",{"inputDataRange":"New and old data", "outputDataRange":"fixed", "bucketOutputLength":10, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    deepEqual(TimeSeries.live_data.table.init_config, {"inputDataRange":"New and old data", "outputDataRange":"fixed", "bucketOutputLength":10, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true}, "init updates JSON config for live data");
    TimeSeries.LiveDataFunctions.setData("table","query",data);
    deepEqual(TimeSeries.live_data['table'].buffer.length, 0, "addToBuffer appends data to buffer");
});

test('setData on passing table name and data for input type fixed length data calls addToBuffer with data points to be added to crossfilter', function() {
    TimeSeries.Query.init("table",[{date: "2011-11-14T16:17:54", quantity: 2, total: 190, tip: 100, type: "tab"}]);
    TimeSeries.Query.setQuery("table","query",{"dimension":["date"]});
    TimeSeries.chart_configs["table"] = {data_processed:{min_max_granularity:{}}};
    TimeSeries.LiveDataFunctions.init("table",{"inputDataRange":"Fixed length data", "outputDataRange":"", "bucketOutputLength":5, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    TimeSeries.LiveDataFunctions.setData("table","query",data1);
    TimeSeries.LiveDataFunctions.setData("table","query",data2);
    deepEqual(TimeSeries.live_data['table'].buffer.length, 3752, "setData updates old data for live data");
});

test('flushData on passing table name, flushes all data in buffer to crossfilter', function() {
    TimeSeries.LiveDataFunctions.init("table",{"inputDataRange":"Fixed length data", "outputDataRange":"", "bucketOutputLength":5, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    TimeSeries.LiveDataFunctions.setData("table","query",data1);
    TimeSeries.mediator.publish("liveDataPushAllDataToTable","table");
    deepEqual(TimeSeries.live_data['table'].buffer.length, 0, "flushData pushes all data to crossfilter");
});

test('Set bucketOutputLength if the value is not passed by the user and the outputDataRange is "all"', function() {
    var table_name = "chart_cfr",
        query_name = "query_cfr",
        options = {
            dateColumnName: "date",
            outputDataRange: "all",
            liveDataTimeSpan: 3,
            liveDataTimeSpanGranularity: "minutes"
        };
    TimeSeries.mediator.publish("initLiveData", table_name, options);
    TimeSeries.Query.init(table_name,chart_cfr_data);
    TimeSeries.Query.setQuery(table_name, query_name, {
        "dimension":[options.dateColumnName]
    });
    TimeSeries.mediator.publish("setBucketOutputLength", options, table_name, query_name, options.liveDataTimeSpanGranularity);
    equal(options.bucketOutputLength, -1, "bucketOutputLength set to -1");
});

test('Set bucketOutputLength if the value is not passed by the user and the outputDataRange is "limited new points"', function() {
    var table_name = "chart_cfr",
        query_name = "query_cfr",
        options = {
            dateColumnName: "date",
            bucketOutputLength: "smartDefault",
            outputDataRange: "limited new points",
            liveDataTimeSpan: 3,
            liveDataTimeSpanGranularity: "minutes"
        };
    TimeSeries.mediator.publish("initLiveData", table_name, options);
    TimeSeries.Query.init(table_name,chart_cfr_data);
    TimeSeries.Query.setQuery(table_name, query_name, {
        "dimension":[options.dateColumnName]
    });
    TimeSeries.mediator.publish("setBucketOutputLength", options, table_name, query_name, options.liveDataTimeSpanGranularity);
    equal(options.bucketOutputLength, 3, "bucketOutputLength set to 3");
});

test('Set bucketOutputLength if the value is passed by the user which is bigger than the liveDataTimeSpan and the outputDataRange is "limited new points"', function() {
    var table_name = "chart_cfr",
        query_name = "query_cfr",
        options = {
            dateColumnName: "date",
            bucketOutputLength: 5,
            outputDataRange: "limited new points",
            liveDataTimeSpan: 3,
            liveDataTimeSpanGranularity: "minutes"
        };
    TimeSeries.mediator.publish("initLiveData", table_name, options);
    TimeSeries.Query.init(table_name,chart_cfr_data);
    TimeSeries.Query.setQuery(table_name, query_name, {
        "dimension":[options.dateColumnName]
    });
    TimeSeries.mediator.publish("setBucketOutputLength", options, table_name, query_name, options.liveDataTimeSpanGranularity);
    equal(options.bucketOutputLength, 3, "bucketOutputLength set to 3");
});

test('Set bucketOutputLength if the value is passed by the user which is smaller than the liveDataTimeSpan and the outputDataRange is "limited new points"', function() {
    var table_name = "chart_cfr",
        query_name = "query_cfr",
        options = {
            dateColumnName: "date",
            bucketOutputLength: 2,
            outputDataRange: "limited new points",
            liveDataTimeSpan: 3,
            liveDataTimeSpanGranularity: "minutes"
        };
    TimeSeries.mediator.publish("initLiveData", table_name, options);
    TimeSeries.Query.init(table_name,chart_cfr_data);
    TimeSeries.Query.setQuery(table_name, query_name, {
        "dimension":[options.dateColumnName]
    });
    TimeSeries.mediator.publish("setBucketOutputLength", options, table_name, query_name, options.liveDataTimeSpanGranularity);
    equal(options.bucketOutputLength, 2, "bucketOutputLength set to 2");
});

test('In case of outputDataRange as "all",livedata pushes all data to cross filter', function() {
    var table_name = "chart_cfr1",
        query_name = "query_cfr1",
        options = {
            dateColumnName: "date",
            outputDataRange: "all",
            inputDataRange:"New and old data",
            liveDataTimeSpan: 3,
            liveDataTimeSpanGranularity: "minutes",
            inputDateFormat:{format:"YYYY-MM-DDThh:mm:ss"}
        };
    TimeSeries.mediator.publish("initLiveData", table_name, options);
    TimeSeries.Query.init(table_name,chart_cfr_data);
    TimeSeries.Query.setQuery(table_name, query_name, {
        "dimension":[options.dateColumnName]
    });
    TimeSeries.mediator.publish("setBucketOutputLength", options, table_name, query_name, options.liveDataTimeSpanGranularity);
    equal(options.bucketOutputLength, -1, "bucketOutputLength set to -1");
    console.log(chart_cfr_data1)
    TimeSeries.mediator.publish("liveDataSetData", table_name, query_name,chart_cfr_data1);
    equal(TimeSeries.live_data['chart_cfr1'].buffer.length, 0, "all data is pushed to crossfilter");
});

test('pauseLiveData on passing table name sets pauseLiveData config for that table to true', function() {
    TimeSeries.LiveDataFunctions.init("table",{"inputDataRange":"Fixed length data", "outputDataRange":"", "bucketOutputLength":5, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    TimeSeries.LiveDataFunctions.setData("table","query",data1);
    TimeSeries.mediator.publish("pauseLiveData","table");
    deepEqual(TimeSeries.live_data['table'].init_config.pauseLiveData, true, "pauseLiveData set to true");
});

test('resumeLiveData on passing table name sets pauseLiveData config for that table to true', function() {
    TimeSeries.LiveDataFunctions.init("table",{"inputDataRange":"Fixed length data", "outputDataRange":"", "bucketOutputLength":5, "inputDateFormat":{format:"YYYY-MM-DDThh:mm:ss"}, "dateColumnName":"date", "dataPointsOnChart":5, "processMissingDataPoint":true});
    TimeSeries.LiveDataFunctions.setData("table","query",data1);
    TimeSeries.mediator.publish("resumeLiveData","table");
    deepEqual(TimeSeries.live_data['table'].init_config.pauseLiveData, false, "pauseLiveData set to false");
});
