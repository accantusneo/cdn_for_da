/**
@author Pykih developers
@module lineChartFunctions
@namespace TimeSeries
*/

TimeSeries.lineChartFunctions = (function() {
    /**
    *   @function: initializeLineChart
    *   @param {Object} options - Object which contains all the chart configuration parameters passed by the user.
    *   @description: It is a user facing API to create line chart. It validates all the configurations and then calls the line chart core function to render the chart.
    */
    var initializeLineChart = function (options, callbacks, feature) {
        var i,
            length,
            global_data_sets = TimeSeries.global_data_sets,
            chart_to_dataset = TimeSeries.gChart_to_data_set_mapping[options.selector],
            chart_to_dataset_length = chart_to_dataset.length,
            dataset_load_status,
            datasets_array = [],
            temp_object,
            dataset,
            raw_data,
            date_field,
            date_format;

        for (i = 0; i < chart_to_dataset_length; i++) {
            if (TimeSeries.data_load_status[chart_to_dataset[i]].status !== "complete") {
                return;
            }
        }

        length = chart_to_dataset.length;

        var parameters = {},
            series_length,
            series,
            featuresApplied,
            dimension_metrics_validation,
            chart_configs,
            chart_div;

        callbacks = callbacks || [];

        TimeSeries.chart_configs[options.selector] = TimeSeries.chart_configs[options.selector] || {};
        TimeSeries.chart_configs[options.selector].feature_status = {};

        chart_configs = TimeSeries.chart_configs[options.selector];
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.mandatory_configs);
        if(!options) {
            return;
        }
        d3.select("#" + options.selector)[0][0].className += " chart-div";
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.chart_features);
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.chart_options);
        TimeSeries.chart_options[options.selector] = {};
        TimeSeries.chart_options[options.selector] = options;
        TimeSeries.chart_status[options.selector] = TimeSeries.chart_status[options.selector] || {status:false, onComplete:[] };

        //Done for managing features applied on a series.
        featuresApplied = TimeSeries.chart_configs[options.selector].featuresApplied = {};

        //darpan code
        series = options.metricsColumnName;
        series_length = series.length;
        for (i = 0; i < series_length ;i++) {
            featuresApplied[series[i].replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,"")] = [];
        }

        parameters.options = options;
        chart_div = document.getElementById(options.selector);
        chart_div.style.outline = "none";

        if (!options.isGlobalData) {
            TimeSeries.mediator.publish("parseData", options.data, "lineChartCallBack", parameters, callbacks, feature);//[{function_name:"initializeLiveData",attribute:[parameters]}]);
        } else {
            TimeSeries.chart_status[options.selector].status = "inprogress";
            TimeSeries.mediator.publish("lineChartCallBack", {"options": options}, JSON.parse(JSON.stringify(options.globalData)), callbacks, feature);
            TimeSeries.chart_options[options.selector].globalData = null;
            options.globalData = null;
        }
    };

    var lineChartCallBack = function (parameters, data, callbacks, feature) {
        var selector = parameters.options.selector,
            table_name = selector + "_cfr",
            options = parameters.options,
            group,
            date_field_name,
            chart_configs = TimeSeries.chart_configs[selector],
            overlay,
            load_status = TimeSeries.chart_status[selector].status,
            dimension_metrics_validation,
            raw_data,
            data_array;

        group = d3.select("#" + options.selector + "_svg_group");
        data = data || TimeSeries.Query.getData(table_name,"query_cfr");
        dimension_metrics_validation = validateDimensionMetrics(options, data[0]);
        if(!dimension_metrics_validation) {
            return;
        }

        console.time(options.selector+"lineChartCallBack");

        if (!chart_configs.refresh_process_initiated) {
            chart_configs.live_data_length = 0;
            date_field_name = options.dateColumnName;

            var processMissingDataPoint = options.processMissingDataPoint,
                date_format = TimeSeries.mediator.publish("detectDateFormat",selector,data, date_field_name),
                format_data = date_format.format_data,
                format = date_format.format,
                d;

            options.inputDateFormat = date_format;

            chart_configs.data_processed = TimeSeries.mediator.publish("dataProcessing", data, date_field_name, format_data, format, options);
            TimeSeries.Query.init(table_name,chart_configs.data_processed.data);
            TimeSeries.Query.setQuery(table_name,"query_cfr",{"dimension":[date_field_name]});
            TimeSeries.Query.init(selector,chart_configs.data_processed.data);

            queryInitializer(options, feature);
            raw_data = TimeSeries.Query.getData(table_name,"query_cfr");
            if (options.enableLiveData) {
                TimeSeries.mediator.publish("setBucketOutputLength", options, table_name, "query_cfr", chart_configs.data_processed.min_max_granularity[0]+'s');
            }
        }

        console.timeEnd(options.selector+"lineChartCallBack");

        chart_configs.all_data_length = data.length;
        overlay = d3.select("#" + options.selector + "_overlay");

        TimeSeries.mediator.publishToAll(callbacks);

        if(load_status === "inprogress") {
            TimeSeries.chart_status[selector].status = "completed";
            TimeSeries.mediator.publish("executeOnComplete",selector,"chart");
        }
    };


    var createOverlay = function(group, width, height, options) {
        if(!document.querySelector("#" + options.selector + "_overlay")) {
            group.append('rect')
                .attr('id',options.selector + '_overlay')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height);
        }
    };


    /**
    *   @function: queryInitializer
    *   @param {Object} options - The chart options object
    *   @param {Object} feature - The feature configurations object
    *   @description: Create queries based on whether the it is to be set for a feature or not
    */
    var queryInitializer = function (options, feature) {
        var metricObj,
            dataImpactObj,
            selector = options.selector,
            date_field_name = options.dateColumnName,
            table_name = selector + "_cfr",
            metricsColumnName = options.metricsColumnName,
            len = metricsColumnName.length,
            i,
            column_name,
            newMetricsColumn = options.newMetricsColumn;

        for (i = 0; i < len; i++) {
            column_name = metricsColumnName[i];
            if (typeof column_name === "object") {
                TimeSeries.Query.deleteQuery(selector, column_name.seriesColumnName);
            } else {
                TimeSeries.Query.deleteQuery(selector, newMetricsColumn[i]);
            }
        }

        for (i = 0; i < len; i++) {
            column_name = metricsColumnName[i];
            metricObj = {};
            dataImpactObj = {};
            dataImpactObj[table_name] = "query_cfr";
            if (typeof column_name === "object") {
                var temp_column_name = JSON.parse(JSON.stringify(column_name));
                metricObj[temp_column_name.metric] = "sum";
                if (!TimeSeries.query_data[selector][temp_column_name.seriesColumnName]) {
                    TimeSeries.Query.setQuery(selector, temp_column_name.seriesColumnName, {
                    "dimension":[{date_field_name:function(d){
                        return d[date_field_name]+"||"+d[temp_column_name.seriesColumnName]; }}],
                    "metric":[metricObj],
                    "data_impacted_by": [dataImpactObj]
                    });
                }
            } else {
                metricObj[column_name] = "sum";
                TimeSeries.Query.setQuery(selector, newMetricsColumn[i], {
                    "metric":[metricObj],
                    "dimension":[date_field_name],
                    "data_impacted_by": [dataImpactObj]
                });
            }
        }

    };

    var executeOnComplete = function (selector,of_what, data) {
        console.time("onComplete");
        var on_complete_callbacks,
            i;
        switch(of_what) {
            case "chart":
                on_complete_callbacks = TimeSeries.chart_status[selector].onComplete;
                break;
            case "data":
                on_complete_callbacks = TimeSeries.data_load_status[selector].onComplete;
                for (i = 0; i < on_complete_callbacks.length; i++) {
                    on_complete_callbacks[i].attribute[0].globalData = data;
                }
                break;
        }

        TimeSeries.mediator.publishToAll(on_complete_callbacks);
        console.timeEnd("onComplete");
    };

    TimeSeries.mediator.subscribe("initializeLineChart",initializeLineChart);
    TimeSeries.mediator.subscribe("lineChartCallBack",lineChartCallBack);
    TimeSeries.mediator.subscribe("createOverlay",createOverlay);
    TimeSeries.mediator.subscribe("queryInitializer",queryInitializer);
    TimeSeries.mediator.subscribe("executeOnComplete",executeOnComplete);


    return {
        initializeLineChart: initializeLineChart,
        lineChartCallBack: lineChartCallBack,
        createOverlay: createOverlay
        /* start-test-block */
        // updateFeatureToChartMapping: updateFeatureToChartMapping
        /* end-test-block */
    };
}());