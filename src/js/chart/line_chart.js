/**
@author Pykih developers
@module lineChartFunctions
@namespace TimeSeries
*/

TimeSeries.lineChartFunctions = (function() {
    /**
    *   @function: updateFeatureToChartMapping
    *   @param {Object} options - Object which contains all the chart configuration parameters passed by the user.
    *   @description: Update the JSON object to maintain feature to chart mapping
    */
    var  updateFeatureToChartMapping = function (options) {
        var chart_selector = options.selector;
        TimeSeries.chartToFeatureMapping[chart_selector] = [];
    };
    /**
    *   @function: updateFeatureToChartMapping
    *   @param {Object} options - Object which contains all the chart configuration parameters passed by the user.
    *   @description: Update the JSON object to maintain feature to chart mapping
    */
    var applyFeature = function (data, feature, column, current_feature, options, line_chart_callbacks) {
        switch (current_feature) {
            case "smoothing" :
                var chart_configs = TimeSeries.chart_configs[options.selector];
                if (feature && feature.name === "smoothing") {
                    data = TimeSeries.mediator.publish("removeNoise", data, feature.index, feature.method);
                } else if (options.enableSmoothing) {
                    data = TimeSeries.mediator.publish("removeNoise", data, chart_configs.smoothingIndex !== undefined ? chart_configs.smoothingIndex : chart_configs.smoothingSliderIndex !== undefined ? chart_configs.smoothingSliderIndex : options.smoothingIndex, options.smoothingMethod);
                }
            break;
            case "anomalyDetection" :
                d3.selectAll("#" + options.selector + "_svg .anomaly").remove();
                line_chart_callbacks.push({function_name:"applyAnomalyDetection",attribute:[options.selector, [column],"nelsonRules"]});
            break;
        }
        return data;
    };
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

        console.log(chart_to_dataset, "chart_to_dataset");
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
            chart_div,
            cogwheel,
            impact_switch;

        callbacks = callbacks || [];

        TimeSeries.chart_configs[options.selector] = TimeSeries.chart_configs[options.selector] || {};
        TimeSeries.chart_configs[options.selector].feature_status = {};

        chart_configs = TimeSeries.chart_configs[options.selector];
        chart_configs.isWidthInPercent = TimeSeries.mediator.publish("checkIfDimensionInPecentage", options, "width");
        chart_configs.isHeightInPercent = TimeSeries.mediator.publish("checkIfDimensionInPecentage", options, "height");

        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.mandatory_configs);
        if(!options) {
            return;
        }
        d3.select("#" + options.selector)[0][0].className += " chart-div";
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.chart_features);
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.chart_options);

        options.width = chart_configs.isWidthInPercent ? TimeSeries.mediator.publish("calculateSVGDimensions",options,"width") : options.width;
        options.height = chart_configs.isHeightInPercent ? TimeSeries.mediator.publish("calculateSVGDimensions",options,"height") : options.height;

        if(!options.height) {
            return;
        }

        options.chartColor = validateArrayOfColor(options, "chartColor");
        updateFeatureToChartMapping(options);

        if (TimeSeries.chartToFeatureMapping[options.selector].length !== 0/* && TimeSeries.chart_options.menu*/) {
            TimeSeries.mediator.publish("addChartMenuIcon",options);
        }

        TimeSeries.mediator.publish("addChartOverlay",options.selector);
        TimeSeries.chart_options[options.selector] = {};
        TimeSeries.chart_options[options.selector] = options;
        TimeSeries.chart_configs[options.selector].refresh_process_initiated = false;
        TimeSeries.chart_status[options.selector] = TimeSeries.chart_status[options.selector] || {status:false, onComplete:[] };

        //Done for managing features applied on a series.
        featuresApplied = TimeSeries.chart_configs[options.selector].featuresApplied = {};

        //darpan code
        options.metricsColumnName = createMetricForChart(options.metricsColumnName,options.globalData);
        if (options.chartColor.length < options.metricsColumnName.length) {
            for (i = options.chartColor.length; i < options.metricsColumnName.length; i++) {
                options.chartColor.push(getRandomColor());
            }
        }
        series = options.metricsColumnName;
        series_length = series.length;
        TimeSeries.chart_configs[options.selector].smoothingCheckboxState = [];
        TimeSeries.chart_configs[options.selector].anomalyCheckboxState = [];
        for (i = 0; i < series_length ;i++) {
            if (typeof series[i] === "object") {
                featuresApplied[series[i].metric.replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,"") + "_" + series[i].seriesName.replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,"")] = [];
            } else {
                featuresApplied[series[i].replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,"")] = [];
            }
            if (options.applySmoothingOnLoad) {
                featuresApplied[series[i]].unshift("smoothing");
                TimeSeries.mediator.publish("updateFeaturesAppliedObject",options.selector,series,"smoothing");
                TimeSeries.mediator.publish("addFeatureApplied",options.selector,"smoothing");
                TimeSeries.chart_configs[options.selector].smoothingCheckboxState.push(true);
            }
        }

        parameters.options = options;
        // console.log();
        // renderLineChart(options,options.globalData);
        if (options.enableLiveData) {
            TimeSeries.mediator.publish("initLiveData", options.selector+"_cfr", options);
        }

        chart_div = document.getElementById(options.selector);
        chart_div.style.outline = "none";

        if (options.showChartBorder) {
            // console.log(options.showChartBorder, " >>>>");
            cogwheel = chart_div.querySelector(".cogwheelContainer");
            chart_div.addEventListener("mouseover", function () {
                // impact_switch = chart_div.querySelector(".impactSwitchContainer");
                // chart_div.style.border = "1px solid #f3f3f3";
                chart_div.style["box-shadow"] = "0px 0px 7px lightgray";
                chart_div.style["border-radius"] = "3px";
                if(cogwheel) {
                    cogwheel.style.opacity = 1;
                    cogwheel.style.zIndex = 9;
                }
            });
            chart_div.addEventListener("mouseout", function () {
                chart_div.style["box-shadow"] = "none";
            });
        }

        if (!options.isGlobalData) {
            TimeSeries.mediator.publish("parseData", options.data, "lineChartCallBack", parameters, callbacks, feature);//[{function_name:"initializeLiveData",attribute:[parameters]}]);
            // TimeSeries.getData.parseData(options.data, "initializeLiveData", parameters);
        } else {
            TimeSeries.chart_status[options.selector].status = "inprogress";
            //TimeSeries.getData.parseData(options.data, "initializeLiveData", {"options": options});//, parameters);
            TimeSeries.mediator.publish("lineChartCallBack", {"options": options}, JSON.parse(JSON.stringify(options.globalData)), callbacks, feature);
            TimeSeries.chart_options[options.selector].globalData = null;
            options.globalData = null;
            // TimeSeries.mediator.publish("initLiveData", options.selector+"_cfr", options);
        }
    };
    /**
    *   @function: renderLineChart
    *   @param {Object} options - Object which contains all the chart configuration parameters passed by the user.
    *   @description: It creates the svg and the group within that svg to place the chart. It also creates the group to place the axis and translates it based on the position of the axis
    */
    // var renderLineChart = function (options) {
    //     var xAxis = TimeSeries.xAxisFunctions,
    //         yAxis = TimeSeries.yAxisFunctions,
    //         svg,
    //         group,
    //         xGroup,
    //         yGroup,
    //         plot_group,
    //         x_translate = [],
    //         y_translate = [],
    //         chart_configs = TimeSeries.chart_configs[options.selector],
    //         legends_group,
    //         xCaption;

    //     y_translate[1] =  0;// translate y for y-axis
    //     chart_configs.extra_width = 0;
    //     chart_configs.extra_height = 0;
    //     chart_configs.width = options.width - options.marginLeft - options.marginRight;
    //     chart_configs.height = options.height - options.marginTop - options.marginBottom;
    //     chart_configs.previousGroupsHeight = 0;

    //     svg = TimeSeries.mediator.publish("createSVG",options);
    //     svg.append("svg:image")
    //         .attr({
    //             'x': options.width - 29,
    //             'y': 10,
    //             'width': 18,
    //             'height': 18,
    //             "xlink:href": "../../src/img/cogwheel.png",
    //             "id": options.selector + "_settings"
    //         })
    //         .style({
    //             cursor: "pointer"
    //         });

    //     document.querySelector("#" + options.selector + "_settings").addEventListener("click", function() {
    //         TimeSeries.mediator.publish("pauseLiveData",options.selector + "_cfr");
    //         TimeSeries.mediator.publish("initEditModal",options.selector,"edit");
    //     });

    //     TimeSeries.mediator.publish("addCaption",options,svg);
    //     TimeSeries.mediator.publish("addSubCaption",options,svg);
    //     TimeSeries.mediator.publish("createGrowthViewsGroup",options,svg);

    //     group = TimeSeries.mediator.publish("createGroup",options,svg,options.marginLeft,chart_configs.previousGroupsHeight + options.marginTop,(options.selector + "_svg_group")); //Group to place the chart
    //     if(options.showLegends) {
    //         legends_group = TimeSeries.mediator.publish("createGroup",options,svg,0,chart_configs.previousGroupsHeight + options.marginTop,(options.selector + "_legends"));
    //         TimeSeries.mediator.publish("renderLegends",options,legends_group);
    //     }
    //     // console.log("first");
    //     chart_configs.height -= chart_configs.extra_height;
    //     chart_configs.width -= chart_configs.extra_width;
    //     y_translate[0] = (options.yAxisPosition === "right") ? chart_configs.width : 0; // translate x for y-axis

    //     if(options.showXAxis) {
    //         x_translate[0] = 0; // translate x for x-axis
    //         x_translate[1] = (options.xAxisPosition === "bottom") ? (chart_configs.height) : 0; // translate y for x-axis
    //         xGroup = xAxis.createAxisGroup(options,group,x_translate[0],x_translate[1]); // group to place x-axis
    //     }

    //     if(options.xAxisGrid) {
    //         x_grid_group = TimeSeries.xAxisFunctions.createGridGroup(group,x_translate[0],x_translate[1]);
    //     }

    //     if(options.showYAxis) {
    //         yGroup = yAxis.createAxisGroup(options,group,y_translate[0],y_translate[1]);
    //     }

    //     if(options.yAxisGrid) {
    //         y_grid_group = TimeSeries.yAxisFunctions.createGridGroup(group,y_translate[0],y_translate[1]);
    //     }

    //     plot_group = TimeSeries.mediator.publish("createGroup",options,group,y_translate[0],y_translate[1],options.selector + "_plot_group");

    //     // console.log(options.selector, "renderLineChart");
    // };


    var createMetricForChart = function(series,dataset) {
        var return_series = [],
            series_length = series.length,
            dataset_length = dataset.length,
            j,
            i,
            column_name,
            obj,
            unique_series_to_be_created;
        for(j = 0; j < series_length; j++) {
            if(typeof series[j] == 'object' && !series[j].seriesName) {
                column_name = series[j].seriesColumnName;
                unique_series_to_be_created = [];
                for(i = 0; i < dataset_length; i++) {
                    if(unique_series_to_be_created.indexOf(dataset[i][column_name]) == -1 && series[j].exclude.indexOf(dataset[i][column_name]) === -1) {
                        unique_series_to_be_created.push(dataset[i][column_name]);
                        obj = {};
                        obj.metric = series[j].metric;
                        obj.seriesColumnName = column_name;
                        obj.seriesName = dataset[i][column_name];
                        return_series.push(obj);
                    }
                }
            } else {
                return_series.push(series[j]);
            }
        }
        // console.log(return_series,typeof return_series[return_series.length - 1]);
        return return_series;
        // console.log(unique_series_to_be_created,return_series);
    };


    var lineChartCallBack = function (parameters, data, callbacks, feature) {
        var selector = parameters.options.selector,
            table_name = selector + "_cfr",
            options = parameters.options,
            group,
            date_field_name,
            chart_configs = TimeSeries.chart_configs[selector],
            overlay,
            metricObj,
            dataImpactObj,
            features_list = ["dimensionFilter"],
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
        if (feature && feature.name === 'dimensionFilter') {
            for (i = 0; i < len; i++) {
                column_name = metricsColumnName[i];
                dataImpactObj = {};
                dataImpactObj[table_name] = "query_cfr";
                TimeSeries.Query.deleteQuery(selector,column_name);
                TimeSeries.dimensionFilter.getGroupData(options,column_name);
            }
        } else {
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

    var updateStatus = function (of_what, selector) {
        switch(of_what) {
            case "menuBar" :
                TimeSeries.status_for_menu_bar.on_complete_count += 1;
                if (TimeSeries.status_for_menu_bar.on_complete_count === TimeSeries.status_for_menu_bar.on_load_count) {
                    TimeSeries.mediator.publishToAll(TimeSeries.status_for_menu_bar.onComplete);
                }
                break;
        }
    };

    TimeSeries.mediator.subscribe("initializeLineChart",initializeLineChart);
    TimeSeries.mediator.subscribe("lineChartCallBack",lineChartCallBack);
    TimeSeries.mediator.subscribe("createOverlay",createOverlay);
    TimeSeries.mediator.subscribe("queryInitializer",queryInitializer);
    TimeSeries.mediator.subscribe("executeOnComplete",executeOnComplete);
    TimeSeries.mediator.subscribe("updateStatus",updateStatus);

    return {
        initializeLineChart: initializeLineChart,
        lineChartCallBack: lineChartCallBack,
        createOverlay: createOverlay
        /* start-test-block */
        // updateFeatureToChartMapping: updateFeatureToChartMapping
        /* end-test-block */
    };
}());