Date.prototype.getWeek = function() {
var onejan = new Date(this.getFullYear(),0,1);
return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
};
/**
@author Pykih developers
@module dimensionAnalysis
@namespace TimeSeries
*/
TimeSeries.dimensionalAnalysis = (function(){
    var granular_data = {},
        selected_metric,
        window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        filtered_data,
        granularities = [
            {
                "granularity": "year"
            },
            {
                "granularity": "quarter",
                "length": 4
            },
            {
                "granularity": "month",
                length: 12
            },
            {
                "granularity": "week",
                "length": 53
            },
            {
                "granularity": "day",
                 length: 31
            },
            {
                "granularity": "weekday",
                "length": 7
            },
            {
                "granularity": "hour",
                "hour": 24
            }
        ],
        granularity_order = ["year", "quarter", "month", "week", "day", "weekday", "hour"],
        panel_count = 4,
        clone_data = {},
        no_of_horizontal_charts = 1,
        previous_click_granularity,
        clicked_object = [undefined],
        retain_click,
        da_chart_color = '#42A5F5',
        da_hover_color = '#F44336';

    var createGranularity = function (options, data){
        var dateColumnName = options.dateColumnName,
            column_name = 'country';

        TimeSeries.Query.setQuery(options.selector,"dimensionFilterDatesQuery",{"dimension":[{'dates':function(d){
            return d[dateColumnName];
        }}]});
    };

    var conditionFunction = function(config) {
        var expression,
            value;
        for(var prop in config) {
            if(config[prop] !== null) {
                value = config[prop][0];
                switch(prop) {
                    case'year':
                        expression = function(d) {
                            return new Date(d).getFullYear() == value;
                        };
                    break;
                    case'month':
                        expression = function(d) {
                            // return d3.time.format('%m')(new Date(d)) == value;
                            return new Date(d).getMonth() == value;
                        };
                    break;
                    case'day':
                        expression = function(d) {
                            // return d3.time.format('%d')(new Date(d)) == value;
                            return new Date(d).getDate() == value;
                        };
                    break;
                    case'week':
                        expression = function(d) {
                            // return d3.time.format('%U')(new Date(d)) == value;
                            return new Date(d).getWeek() == value;
                        };
                    break;
                    case'hour':
                        expression = function(d) {
                            // return d3.time.format('%H')(new Date(d)) == value;
                            return new Date(d).getHours() == value;

                        };
                    break;
                    case'weekday':
                        expression = function(d) {
                            // return d3.time.format('%w')(new Date(d)) == value;
                            return new Date(d).getDay() == value;
                        };
                    break;
                    case'quarter':
                        expression = function(d) {
                            // return parseInt((+d3.time.format('%m')(new Date(d))-1)/3)+1 == value;
                            return parseInt((new Date(d).getMonth())/3)+1 == value;
                        };
                    break;
                    default:
                }
            }
        }
        return expression;
    };

    var createFilterFunction = function(config) {
        /*jslint evil: true */
        return conditionFunction(config);
    };

    var filterDataq = function (filter_config, options) {
        TimeSeries.Query.addFilter(options.selector,"dimensionFilterDatesQuery",[{"column":"dates","condition":"Eval","values":createFilterFunction(filter_config)}]);
    };

    var removeGranularityFilterq = function(options) {
        TimeSeries.Query.removeFilter(options.selector,"dimensionFilterDatesQuery",[{"column":"dates"}]);
    };

    // config example {year:null,month:null,day:null,hour:06,minute:06,second:null}
    var createConfigFilterq =  function (config){
        var keys = Object.keys(config),
            len = keys.length,
            value;
        for (i = 0; i < len; i++) {
            if (config[keys[i]] == -1) config[keys[i]] = null;
            if (config[keys[i]]) {
                value = [];
                value.push(config[keys[i]]);
                value.push(config[keys[i]]);
                config[keys[i]] = value;
            }
        }
        return config;
    };

    var initConfig = function(options, callbacks, feature) {

        var i,
            length,
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
            TimeSeries.mediator.publish("parseData", options.data, "dimensionalAnalysisConfigCallback", parameters, callbacks, feature);//[{function_name:"initializeLiveData",attribute:[parameters]}]);
        } else {
            TimeSeries.chart_status[options.selector].status = "inprogress";
            TimeSeries.mediator.publish("dimensionalAnalysisConfigCallback", {"options": options}, JSON.parse(JSON.stringify(options.globalData)), callbacks, feature);
            TimeSeries.chart_options[options.selector].globalData = null;
            options.globalData = null;
        }
    }

    var dimensionalAnalysisConfigCallback = function (parameters, data, callbacks, feature) {
        var selector = parameters.options.selector,
            table_name = selector + "_cfr",
            options = parameters.options,
            date_field_name,
            chart_configs = TimeSeries.chart_configs[selector],
            load_status = TimeSeries.chart_status[selector].status,
            dimension_metrics_validation,
            raw_data,
            data_array;

        data = data || TimeSeries.Query.getData(table_name,"query_cfr");
        dimension_metrics_validation = validateDimensionMetrics(options, data[0]);
        if(!dimension_metrics_validation) {
            return;
        }

        console.time(options.selector+"dimensionalAnalysisConfigCallback");

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
        }

        console.timeEnd(options.selector+"dimensionalAnalysisConfigCallback");

        chart_configs.all_data_length = data.length;
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

    // var init = function(options,metricsColumnName,aggregation_fun) {
    var init = function(options, target_selector) {

        var chart_selector = options.selector,
            chart_options = TimeSeries.chart_options[chart_selector],
            chart_configs = TimeSeries.chart_configs[chart_selector],
            modal_div = document.createElement("div"),
            series_div = document.createElement("div"),
            chart_holder = document.createElement("div"),
            radio_button,
            label,
            chart_colors = chart_options.chartColor,
            span,
            radio_button_holder,
            metrics = chart_options.metricsColumnName,
            metrics_length = metrics.length,
            i,
            data = TimeSeries.Query.getData(chart_options.selector + "_cfr","query_cfr",{filter:{"column":"isRawData","condition":"Equal","values":true}}),
            window_height,
            new_metrics = chart_options.newMetricsColumn,
            list_holder,
            tooltip_options;

        tooltip_options = {
            tooltipBgBodyOpacity: 100,
            tooltipBgBodyColor: "white"
        };

        TimeSeries.mediator.publish("createTooltip", tooltip_options, "dimensional_analysis_chart_tooltip");

        daOnDrop(target_selector, chart_selector);

        reset_all_button = createResetAllButton();
        document.getElementById("DA_highlight_view").appendChild(reset_all_button);
        document.getElementById("dimensional_analysis_chart_tooltip").style["z-index"] = 10200;
    };


    //Creating in general select boxes.
    var createChartSelectBox = function (chart_id, series_id, chart_selector, count, mode) {
        var dashboards_list = document.createElement('div'),
            chart_list = document.createElement("div"),
            series_list = document.createElement("div"),
            list_holder = document.createElement("div"),
            allCharts = TimeSeries.allCharts,
            i;

        var heading_container = document.createElement("div"),
            heading = document.createElement("div"),
            chart_name_label = document.createElement("div"),
            series_name_label = document.createElement("h3"),
            remove_panel = document.createElement("div"),
            clearfix = document.createElement("div");

        heading_container.id = "panel_header_container";
        heading_container.className = "comcharts-TS-da-header-container";

        heading.id = "chart_header";
        remove_panel.innerHTML = "x";
        remove_panel.id = "remove_panel";

        remove_panel.addEventListener("click", function () {
            main_DA_container = document.getElementById("dimensionalAnalysis");
            panel = document.createElement("div");

            panel.id = "DA_panel_"+count;
            panel.className = "col-sm-4 comcharts-TS-da-tab";
            main_DA_container.insertBefore(panel, document.getElementById("comchart_TS_clearfix"));

            document.getElementById(panel.id).innerHTML = "";
            renderDA(panel.id, false, chart_id);
        });

        clearfix.className = "comcharts-TS-clearfix";

        dashboards_list.id = "panel_DA_dashboard_"+ count + "_select_box";
        dashboards_list.className = "comcharts-TS-da-dashboard-box";
        dashboards_list.innerHTML = (TimeSeries.chart_options[chart_id].caption || "Filter by time");

        list_holder = document.createElement("div");
        list_holder.appendChild(dashboards_list);
        heading.appendChild(list_holder);
        var new_metrics = TimeSeries.chart_options[chart_id].newMetricsColumn,
            display_metrics = TimeSeries.chart_options[chart_id].displayMetricsColumn;

        series_list.id = "panel_DA_series_" + count + "_select_box";
        series_list.className = "comcharts-TS-da-series-box";
        series_list.style["max-width"] = "100%";
        series_list.setAttribute("panel-id", count);
        series_list.innerHTML = display_metrics[new_metrics.indexOf(series_id)];
        series_list.addEventListener("click", function () {
            console.log(chart_selector, "heloooooooooooooo");
            panel_body = modalElements(chart_selector);
            TimeSeries.mediator.publish("initModal",{
                content: panel_body,
                modal_title: 'Select a series to "Roll-up by time"',
                close_text: "x",
                close_id: "DA_close_select_series",
                modal_type: "custom",
                selected_tab: "DA_panel_"+count,
                maxHeight: "65%",
                top:"20%"
            });
        });

        list_holder.appendChild(series_list);
        heading.appendChild(list_holder);
        heading_container.appendChild(heading);
        heading_container.appendChild(remove_panel);
        heading_container.appendChild(clearfix);

        return heading_container;
    };

    var createDimensionCharts = function (chart_id, series_id, chart_selector, count, series_attributes) {
        var div_id = "DA_panel_" + count;
        seeDimensionalAnalysis(chart_id, series_id, chart_selector, div_id, count, series_attributes);
    };

    var seeDimensionalAnalysis = function (chart_id, series_id, chart_selector, div_id, panel_no, series_attributes) {
        var user_div = document.getElementById(div_id),
            chart_options = TimeSeries.chart_options[chart_selector],
            chart_holder,
            len,
            data = TimeSeries.Query.getData(chart_selector + "_cfr","query_cfr",{filter:{"column":"isRawData","condition":"Equal","values":true}}),
            highlight_view,
            panel_2,
            panel_3,
            main_DA_container,
            reset_all_button;

        console.log(chart_selector, "chart_selector");
        if(user_div && !document.getElementById(div_id + "_dimensional_analysis_holder")) {
            chart_holder = document.createElement("div");
            chart_holder.id = div_id + "_" + chart_selector + "_dimensional_analysis_holder";
            if(panel_no == 1 && !document.getElementById("DA_panel_2")) {
                main_DA_container = document.getElementById("dimensionalAnalysis");
                panel_2 = document.createElement("div");
                panel_2.id = "DA_panel_2";
                panel_2.className = "col-sm-4 comcharts-TS-da-tab";
                main_DA_container.insertBefore(panel_2, document.getElementById("comchart_TS_clearfix"));
                renderDA("DA_panel_2",false, chart_selector);
            } else if(panel_no == 2 && !document.getElementById("DA_panel_3")) {
                main_DA_container = document.getElementById("dimensionalAnalysis");
                panel_3 = document.createElement("div");
                panel_3.id = "DA_panel_3";
                panel_3.className = "col-sm-4 comcharts-TS-da-tab";
                main_DA_container.insertBefore(panel_3, document.getElementById("comchart_TS_clearfix"));
                renderDA("DA_panel_3",false, chart_selector);
            }
            chart_holder.id = div_id + "_dimensional_analysis_holder";
            user_div.appendChild(chart_holder);
        }
        updateChart(chart_id, series_id, chart_selector, div_id, data, series_attributes);
        createGranularity({selector: chart_selector+"_DA",dateColumnName: chart_options.dateColumnName },data);
    };

    var updateChart = function (chart_id, series_id, chart_selector, div_id, data, series_attributes) {
        var chart_options = TimeSeries.chart_options[chart_selector];
        data = data || TimeSeries.Query.getData(chart_selector + "_cfr","query_cfr",{filter:{"column":"isRawData","condition":"Equal","values":true}});
        document.getElementById(div_id + "_dimensional_analysis_holder").innerHTML = "";
        createData(chart_options, data, series_id, "sum", series_attributes);
        createCharts(chart_id, series_id, chart_options, div_id, series_attributes);
    };

    var createData = function(options, data, selected_series, aggregation_fun, series_attributes) {
        console.time("metric+dimnsion");
        var series =  {},
            query = TimeSeries.Query,
            table,
            da_year_query,
            da_month_query,
            da_day_query,
            da_hour_query,
            da_weekday_query,
            da_week_query,
            da_quarter_query,
            date_column_name = options.dateColumnName;

        if(series_attributes.metric) {
            series[series_attributes.metric] = aggregation_fun;
        } else {
            var metric = options.metricsColumnName[options.newMetricsColumn.indexOf(selected_series)];
            series[metric] = aggregation_fun;
        }

        query.init(options.selector+"_DA",data);

        table = ActiveQuery.createTable(options.selector+"_DA", "InBrowser", data);
        da_year_query = ActiveQuery.createQuery("da_year_query");
        da_month_query = ActiveQuery.createQuery("da_month_query");
        da_day_query = ActiveQuery.createQuery("da_day_query");
        da_hour_query = ActiveQuery.createQuery("da_hour_query");
        da_weekday_query = ActiveQuery.createQuery("da_weekday_query");
        da_week_query = ActiveQuery.createQuery("da_week_query");
        da_quarter_query = ActiveQuery.createQuery("da_quarter_query");

        da_year_query.Select({'year': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).year}, series).From(options.selector+"_DA").Group();
        da_month_query.Select({'month': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).month}, series).From(options.selector+"_DA").Group();
        da_day_query.Select({'day': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).day}, series).From(options.selector+"_DA").Group();
        da_hour_query.Select({'hour': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).hour}, series).From(options.selector+"_DA").Group();
        da_weekday_query.Select({'weekday': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).weekday}, series).From(options.selector+"_DA").Group();
        da_week_query.Select({'week': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).week}, series).From(options.selector+"_DA").Group();
        da_quarter_query.Select({'quarter': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).quarter}, series).From(options.selector+"_DA").Group();

        var output = {};
        output.year = da_year_query.Exec();
        output.month = da_month_query.Exec();
        output.day = da_day_query.Exec();
        output.hour = da_hour_query.Exec();
        output.weekday = da_weekday_query.Exec();
        output.week = da_week_query.Exec();
        output.quarter = da_quarter_query.Exec();

        // if(typeof selected_series != 'object') {
            query.setQuery(options.selector+"_DA","DA_year",{"dimension":[{'year':function(d){
                // return +d3.time.format('%Y')(new Date(d[date_column_name]));
                 return typeof selected_series == 'object'? new Date(+d[date_column_name]).getFullYear()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getFullYear();
                // return new Date(+d[date_column_name]).getFullYear();
            }}]});


            query.setQuery(options.selector+"_DA","DA_month",{"dimension":[{'month':function(d){
                // return +d3.time.format('%m')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+ d[date_column_name]).getMonth()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getMonth();
                // return new Date(+d[date_column_name]).getMonth();
            }}]});

            query.setQuery(options.selector+"_DA","DA_day",{"dimension":[{'day':function(d){
                // return +d3.time.format('%d')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getDate()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getDate();
                // return new Date(+d[date_column_name]).getDate();
            }}]});

            query.setQuery(options.selector+"_DA","DA_hour",{"dimension":[{'hour':function(d){
                // return +d3.time.format('%H')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getHours()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getHours();
                // return new Date(+d[date_column_name]).getHours();

            }}]});

            query.setQuery(options.selector+"_DA","DA_weekday",{"dimension":[{'weekday':function(d){
                // return +d3.time.format('%w')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getDay()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getDay();
                // return new Date(+d[date_column_name]).getDay();
            }}]});

            query.setQuery(options.selector+"_DA","DA_week",{"dimension":[{'week':function(d){
                // return +d3.time.format('%U')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getWeek()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getWeek();
                // return new Date(+d[date_column_name]).getWeek();
            }}]});

            query.setQuery(options.selector+"_DA","DA_quarter",{"dimension":[{'quarter':function(d){
                // return parseInt((+d3.time.format('%m')(new Date(d[date_column_name]))-1)/3)+1;
                return typeof selected_series == 'object'? parseInt((new Date(+d[date_column_name]).getMonth())/3)+1 +"||"+d[selected_series.seriesColumnName] :parseInt((new Date(+d[date_column_name]).getMonth())/3)+1;
                // return parseInt((new Date(+d[date_column_name]).getMonth())/3)+1;
            }}]});

            console.timeEnd("metric+dimnsion");
            console.time("metric");
             //console.log(series)
            query.createMetric(options.selector+"_DA","DA_year",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_month",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_day",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_hour",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_weekday",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_week",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_quarter",{"metric":[series]});
            console.timeEnd("metric");
            getGroupData(options,"kokok", selected_series, series_attributes);
    };

    var getGroupData = function(options,query_name,series_object,series_id, series_attributes) {
        // query_name is same as metric column name
        // option contain table name and column name
        // metric by default is sum
        var output = {},
                output1 = {},
                dateColumnName = options.dateColumnName,
                config = options.aggregation,
                obj = {},
                metric =[];
        if(typeof series_object == 'string') {
            granular_data.year = TimeSeries.Query.getData(options.selector+"_DA","DA_year");
            granular_data.month = TimeSeries.Query.getData(options.selector+"_DA","DA_month");
            granular_data.day = TimeSeries.Query.getData(options.selector+"_DA","DA_day");
            granular_data.hour = TimeSeries.Query.getData(options.selector+"_DA","DA_hour");
            granular_data.weekday = TimeSeries.Query.getData(options.selector+"_DA","DA_weekday");
            granular_data.week = TimeSeries.Query.getData(options.selector+"_DA","DA_week");
            granular_data.quarter = TimeSeries.Query.getData(options.selector+"_DA","DA_quarter");
        } else if(typeof series_object == 'object') {
            TimeSeries.Query.setQuery(options.selector+"_DA", series_object.seriesColumnName, {
                        "dimension":[series_object.seriesColumnName],
                        // "data_impacted_by": [dataImpactObj]
                });
            granular_data.year = TimeSeries.Query.getData(options.selector+"_DA","DA_year",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.month = TimeSeries.Query.getData(options.selector+"_DA","DA_month",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.day = TimeSeries.Query.getData(options.selector+"_DA","DA_day",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.hour = TimeSeries.Query.getData(options.selector+"_DA","DA_hour",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.weekday = TimeSeries.Query.getData(options.selector+"_DA","DA_weekday",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.week = TimeSeries.Query.getData(options.selector+"_DA","DA_week",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.quarter = TimeSeries.Query.getData(options.selector+"_DA","DA_quarter",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
        } else if(typeof options.series_id == 'object') {
            // if(config === "") { config = 'sum';}
            obj[query_name] = config;
            metric = [obj];
            output.year = TimeSeries.Query.getData(options.selector,"DA_year",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.month = TimeSeries.Query.getData(options.selector,"DA_month",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.day = TimeSeries.Query.getData(options.selector,"DA_day",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.hour = TimeSeries.Query.getData(options.selector,"DA_hour",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.weekday = TimeSeries.Query.getData(options.selector,"DA_weekday",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.week = TimeSeries.Query.getData(options.selector,"DA_week",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.quarter = TimeSeries.Query.getData(options.selector,"DA_quarter",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            return output;
        } else if( typeof options.series_id == 'string' ) {
            // if(config === "") { config = 'sum';}
            obj[query_name] = config;
            metric = [obj];
            output.year = TimeSeries.Query.getData(options.selector,"DA_year");
            output.month = TimeSeries.Query.getData(options.selector,"DA_month");
            output.day = TimeSeries.Query.getData(options.selector,"DA_day");
            output.hour = TimeSeries.Query.getData(options.selector,"DA_hour");
            output.weekday = TimeSeries.Query.getData(options.selector,"DA_weekday");
            output.week = TimeSeries.Query.getData(options.selector,"DA_week");
            output.quarter = TimeSeries.Query.getData(options.selector,"DA_quarter");
            return output;
        }
    };

    var returnFilterValue = function(getvalue,options,parent_id){
        var filtervalue_array = [],
            selector;
        resetChartSelection(parent_id);
        for (var i = 0; i < clone_data[parent_id].length; i++) {
            var key_array =[],
                sort_len;
            switch(getvalue) {
                case 'top':
                    key_array.push(clone_data[parent_id][i][0].key);
                    filtervalue_array.push(key_array);
                break;
                case 'bottom':
                    key_array.push(clone_data[parent_id][i].reverse()[0].key);
                    filtervalue_array.push(key_array);
                    clone_data[parent_id][i].reverse();
                break;
                case 'topfew':
                    sort_len = Math.round(clone_data[parent_id][i].length/4);
                    clone_data[parent_id][i].slice(0,sort_len).map(function(a){
                        key_array.push(a.key);
                        return a;
                    });
                    filtervalue_array.push(key_array);
                break;
                case 'bottomfew':
                    sort_len = Math.round(clone_data[parent_id][i].length/4);
                    clone_data[parent_id][i].reverse().slice(0,sort_len).map(function(a){
                        key_array.push(a.key);
                        return a;
                    });
                    clone_data[parent_id][i].reverse();
                    filtervalue_array.push(key_array);
                break;
                default:
            }
            selector = parent_id + "_dimension_" + granularity_order[i];
                d3.selectAll("#" + selector + "_plot_group .column")
                    .style({
                        fill: function(d,k){
                            if(filtervalue_array[i].indexOf(+this.getAttribute("granularity_value")) > -1) {
                                return "orange";
                            } else {
                                return da_chart_color;

                            }
                        }
                    });
        }
    };

    var createCharts = function(chart_id, series_id, options, parent_id, series_attributes) {
        var parent_container =  document.getElementById(parent_id + "_dimensional_analysis_holder"),
            overlay,
            chart_caption = ["Year", "Quarter", "Month", "Week Number", "Day", "Weekday", "Hour"],
            granularity,
            no_of_charts = 0,
            chart_width,
            window_height,
            tooltip = document.getElementById("dimensional_analysis_chart_tooltip"),
            count = parseInt(parent_id.split("DA_panel_")[1]),
            i,
            len,
            parent_div = document.getElementById(parent_id),
            render_da = false;

        clone_data[parent_id] =[];
        clicked_object.push(undefined);
        for(i = 0,len = granularities.length;i < len; i++) {
            granularity = granularities[i].granularity;
            if(granular_data[granularity].length > 1) {
                no_of_charts += 1;
            }
        }

        d3.selectAll(".dimension_filter")
            .on("click", function(){
                event.stopPropagation();
            })
            .on('change',function(){
                retain_click = clicked_object.slice();
                var i,
                    reset_button ;
                if(this.value !== "none") {
                    for (i = 1; i < panel_count; i++) {
                        if(document.getElementById("DA_panel_" + i + "_dimensional_analysis_holder")) {
                            reset_button = document.getElementById("DA_panel_" + i + "_reset_button");
                            if(reset_button && reset_button.style.visibility === "visible") {
                                reset_button.style.visibility = "hidden";
                            }
                            returnFilterValue(this.value,options, "DA_panel_" + i);
                        }
                    }
                } else {
                    for (i = 1; i < panel_count; i++) {
                        if(document.getElementById("DA_panel_" + i + "_dimensional_analysis_holder")) {
                            reset_button = document.getElementById("DA_panel_" + i + "_reset_button");
                            if(reset_button && reset_button.style.visibility === "visible") {
                                reset_button.style.visibility = "hidden";
                            }
                            resetChartSelection("DA_panel_" + i);
                        }
                    }
                }
        });
        // parent_div.setAttribute("data-dashboard", dashboard_id);
        parent_div.setAttribute("data-chart", chart_id);
        parent_div.setAttribute("data-series", series_id);

        var panel_id = parent_id.split("DA_panel_")[1],
            list_holder = createChartSelectBox(chart_id, series_id, parent_id, panel_id, "charts");
        if (document.querySelector("#" + parent_id + " #suggestions_div")) {
            document.querySelector("#" + parent_id + " #suggestions_div").remove();
        } else if (document.querySelector("#" + parent_id + " #panel_header_container")) {
            document.querySelector("#" + parent_id + " #panel_header_container").remove();
        }
        document.querySelector("#" + parent_id).insertBefore(list_holder,document.getElementById(parent_id + "_dimensional_analysis_holder"));
            for(i=0,len = granularities.length;i<len;i++) {
                granularity = granularities[i].granularity;
                clone_data[parent_id].push(JSON.parse(JSON.stringify(granular_data[granularity])));
                // if(granular_data[granularity].length > 1) {
                    var div = document.createElement("div"),
                        data = JSON.parse(JSON.stringify(granular_data[granularity])),
                        selector = parent_id + "_dimension_" + granularity,
                        granularity_obj,
                        map_function,
                        tickValues = [],
                        missing_data;
                        TimeSeries.chart_configs[selector] = {};
                        TimeSeries.chart_options[selector] = {};
                        granularity_obj = mapFunction(granularity, data);
                        map_function = granularity_obj.func;

                    render_da = true;
                    // console.log(granularity,data);

                    data.sort(function(a,b){
                        return a.key - b.key;
                    });

                    for (var j = 0, length = granularities[i].length || data.length; j < length; j++) {
                        if(!data[j] && granularity !== "year") {
                            data[j] = {
                                key: j + granularity_obj.additionFactor,
                                value: 0
                            };
                        } else if(data[j].key !== (j+granularity_obj.additionFactor) && granularity !== "year") {
                            missing_data = {
                                key: j + granularity_obj.additionFactor,
                                value: 0
                            };
                            data.splice(j,0,missing_data);
                        }
                        data[j].original_key = data[j].key;
                        data[j].granularity = granularity;
                        data[j].key = map_function(data[j].key);
                        if(granularity_obj.xAxisTickInterval && ((j % granularity_obj.xAxisTickInterval === 0) || (j ===  length-1))) {
                            tickValues.push(data[j].key);
                        } else if(!granularity_obj.xAxisTickInterval) {
                            tickValues.push(data[j].key);
                        }
                    }

                    chart_width = parseInt(document.getElementById(parent_id).style.width);
                    div.id = selector;
                    div.style.float = "left";
                    // div.style["margin-bottom"] = "5px";
                    div.style.padding = "3px";

                    parent_container.className = "comcharts-TS-DA-column-charts-container";
                    parent_container.appendChild(div);
                    // console.log(document.getElementById(options.selector).clientWidth * (100/100))

                    var get_computed_style = window.getComputedStyle(document.getElementById(parent_id), null),
                        width = document.getElementById(parent_id).clientWidth - parseFloat(get_computed_style.getPropertyValue("padding-left")) - parseFloat(get_computed_style.getPropertyValue("padding-right"));

                    var config = {
                        width: TimeSeries.isMobile ? 346 : width,
                        height: TimeSeries.isMobile ? 246 : 100,
                        data: data,
                        selector: selector,
                        chartType: "column",
                        marginLeft: 20,
                        marginTop: 30,
                        marginRight: 5,
                        marginBottom: 30,
                        "dateColumnName": "key",
                        "metricsColumnName": ["value"],
                        chartColor: [da_chart_color],
                        xAxisTickValues: tickValues,
                        xAxisTickValuesFormat: granularity_obj.format,
                        xAxisTickInterval: granularity_obj.xAxisTickInterval,
                        xAxisTickIntervalGranularity: granularity_obj.xAxisTickIntervalGranularity,
                        caption: chart_caption[i],
                        showCaption: true,
                        captionFontWeight: "bold",
                        captionFontSize: TimeSeries.isMobile ? 17 : 12,
                        captionAlign: "left",
                        captionMargin: 0,
                        yAxisNoOfTicks: 3,
                        yAxisTickFormat:"s",
                        yAxisLineOpacity: 0,
                        dimensionalAnalysisHighlightColor: options.dimensionalAnalysisHighlightColor,
                        borderThickness: 1,
                        bordercolor: "white",
                        // bgColor: "#f3f3f3"
                    };

                    config = TimeSeries.mediator.publish("validate", config, TimeSeries.default.chart_features);
                    config = TimeSeries.mediator.publish("validate",config,TimeSeries.default.chart_options);
                    TimeSeries.chart_options[config.selector] = config;
                    TimeSeries.mediator.publish("renderColumnChart",config);
                    TimeSeries.mediator.publish("columnChartOrdinal",config,data,"DA");
                    TimeSeries.mediator.publish("createColumnChart", config, data, 0);
                    overlay = document.getElementById(selector + "_overlay");
                    overlay.parentNode.removeChild(overlay);
                    d3.selectAll("#" + selector + "_plot_group .column")
                        .attr("granularity_value",function(d,i){
                            return d.original_key;
                        })
                        .attr("id",function(d,i){
                            return "DA_" + d.original_key;
                        })
                        .style("cursor", "pointer")
                        .on("click", function(d, i) {
                            console.log("nkdsjfsdkfdsnjdsfnjk", d, i);
                            var no_of_resets_active = 0,
                                panel_id = this.parentNode.id.split("_")[2],
                                k,
                                width = d3.select("#" + this.parentNode.parentNode.parentNode.id)[0][0].offsetWidth,
                                reset = document.getElementById("DA_panel_" + count + "_reset_button");
                            if (reset) {
                                reset.parentNode.parentNode.removeChild(reset.parentNode);
                            }
                            d3.select("#" + this.parentNode.parentNode.parentNode.id)
                                .append("foreignObject")
                                .append("xhtml:span")
                                .attr({
                                    id: "DA_panel_" + count + "_reset_button"
                                })
                                .style({
                                    "cursor": "pointer",
                                    "position": "relative",
                                    "margin-right": "5px",
                                    left: width - 35 + "px",
                                    "font-size": "0.8em",
                                    color: "#5388ee",
                                    opacity: 0.8
                                })
                                .text("Reset")
                                .on("click",function () {
                                    d3.selectAll('.x-axis-selected-value').text('');
                                    this.style.visibility = "hidden";
                                    resetChartSelection("DA_panel_" + count);
                                    var no_of_resets_active = 0,
                                        k;
                                    for (k = 1; k < panel_count; k++) {
                                        if (document.getElementById("DA_panel_" + k + "_reset_button") && document.getElementById("DA_panel_" + k + "_reset_button").style.visibility === "visible") {
                                            no_of_resets_active++;
                                        }
                                    }
                                    if (no_of_resets_active > 1) {
                                        document.getElementById("DA_reset_all_button").style.visibility = "visible";
                                    } else {
                                        document.getElementById("DA_reset_all_button").style.visibility = "hidden";
                                    }
                                    this.parentNode.parentNode.removeChild(this.parentNode);
                                });
                            document.getElementById("DA_panel_" + panel_id + "_reset_button").style.visibility = "visible";
                            for (k = 1; k < panel_count; k++) {
                                if (document.getElementById("DA_panel_" + k + "_reset_button") && document.getElementById("DA_panel_" + k + "_reset_button").style.visibility === "visible") {
                                    no_of_resets_active++;
                                }
                            }
                            if ((panel_count - 1) > 1 && no_of_resets_active > 1 && document.getElementById("DA_reset_all_button")) {
                                document.getElementById("DA_reset_all_button").style.visibility = "visible";
                            } else if(document.getElementById("DA_reset_all_button")){
                                document.getElementById("DA_reset_all_button").style.visibility = "hidden";
                            }
                            d3.event.stopPropagation();
                            d3.selectAll("#" + parent_id + "_dimensional_analysis_holder rect.column")
                                .style({
                                    "fill": da_chart_color,
                                    "stroke": "white",
                                    "stroke-dasharray": function(d,i) {
                                        return "0,0";
                                    }
                                });
                            mouseoutFunction(parent_id);
                            d3.select(this).style({
                                fill: da_hover_color
                            });
                            previous_click_granularity = clicked_object[+panel_id];
                            clicked_object[+panel_id] = d;
                            interactions(d.granularity, d, options, parent_id, series_id);
                            updateTooltip(chart_id, series_id, options, clicked_object[+panel_id], d, tooltip, this, granular_data, count);
                            var next_empty_panel,
                                nep;
                            for (nep = 2; nep <= 4; nep++) {
                                if (document.querySelector("#DA_panel_" + nep + " #suggestions_div")) {
                                    next_empty_panel = nep;
                                    break;
                                }
                            }
                            if (next_empty_panel) {
                                var compare_suggestions = document.querySelector("#DA_panel_" + next_empty_panel + " #suggestions_div #compare_suggestion"),
                                    chart_name = TimeSeries.chart_options[document.getElementById("DA_panel_" + panel_id).dataset.chart].caption || "Filter by time",
                                    series_name = document.getElementById("DA_panel_" + panel_id).dataset,
                                    clicked_object_granularity = clicked_object[+panel_id].granularity,
                                    original_key = clicked_object[+panel_id].original_key;                                        series_name = series_name.series;
                                switch (clicked_object_granularity) {
                                    case "month":
                                        original_key = TimeSeries.dataManipulationFunctions.mmmm_array[original_key];
                                        break;
                                    case "hour":
                                        original_key++;
                                        break;
                                    case "weekday":
                                        original_key = TimeSeries.dataManipulationFunctions.week_day_array[original_key];
                                        break;
                                }

                                var selected_chart_title = document.querySelector('#'+this.parentNode.parentNode.parentNode.id+' tspan').innerHTML,
                                    x_selected;
                                if (!document.querySelector('#'+this.parentNode.parentNode.parentNode.id+' tspan.x-axis-selected-value')) {
                                    x_selected = d3.select('#'+this.parentNode.parentNode.parentNode.id+' text').append('tspan');
                                    x_selected.attr('class', 'x-axis-selected-value');
                                } else {
                                    d3.selectAll('.x-axis-selected-value').text('');
                                    x_selected = d3.select('#'+this.parentNode.parentNode.parentNode.id+' tspan.x-axis-selected-value');
                                }
                                if (selected_chart_title == 'Quarter') {
                                    x_selected.text(' [Q' + original_key + ']');
                                } else {
                                    x_selected.text(' [' + original_key + ']');
                                }

                                if (!document.querySelector("#DA_panel_" + next_empty_panel + " #" + chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion")) {
                                    if (previous_click_granularity) {
                                        var previous_span = document.querySelector("#DA_panel_" + next_empty_panel + " #" + chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion");
                                        if (previous_span) {
                                            previous_span.remove();
                                        }
                                    }
                                    var span = document.createElement("span"),
                                        desc_span = document.createElement("span");

                                    desc_span.id = "suggestion_desc";
                                    span.id = series_name.replace(/ /g,"_") + "_suggestion";
                                    span.className = 'suggestion_div';
                                    or_span = document.createElement("span");
                                    or_span.className = 'or_span';
                                    or_span.innerHTML = "<br><br>OR<br><br>";
                                    span.appendChild(or_span);
                                    desc_span.innerHTML = "Do you want to compare how <b>" + series_name + "</b> of <b>" + chart_name + "</b> in <b>" + capitalizeFirstLetter(clicked_object_granularity) + " " + original_key + "</b> performing against another <b>" + capitalizeFirstLetter(clicked_object_granularity) + "</b>?";
                                    desc_span.style.color = "#5388ee";
                                    desc_span.style.cursor = "pointer";

                                    span.addEventListener("click",function() {
                                        var p = this.parentNode,
                                            pnext_empty_panel;
                                        for (nep = +panel_id; nep < panel_count; nep++) {
                                            if (document.querySelector("#DA_panel_" + nep + " #suggestions_div")) {
                                                pnext_empty_panel = nep;
                                                break;
                                            }
                                        }
                                        if (pnext_empty_panel) {
                                            var childrens = p.childNodes;
                                            for (var c = 0; c < childrens.length; c++) {
                                                document.querySelector("#DA_panel_" + pnext_empty_panel + " #suggestions_div #compare_suggestion").appendChild(childrens[c]);
                                            }
                                        }
                                        createDimensionCharts(chart_id, series_id, chart_id, next_empty_panel, series_attributes);
                                        // TimeSeries.mediator.publish("setDashboardHeight");
                                    });
                                    span.appendChild(desc_span);
                                    if(document.getElementById(span.id)){
                                        while (compare_suggestions.firstChild) {
                                            compare_suggestions.removeChild(compare_suggestions.firstChild);
                                        }
                                    }
                                    compare_suggestions.appendChild(span);
                                } else {
                                    document.querySelector("#DA_panel_" + next_empty_panel + " #" + chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion #suggestion_desc").innerHTML = "Do you want to compare how <b>" + series_name + "</b> of <b>" + chart_name + "</b> in <b>" + capitalizeFirstLetter(clicked_object_granularity) + " " + original_key + "</b> performing against another <b>" + capitalizeFirstLetter(clicked_object_granularity) + "</b>?";
                                }
                            }
                        })
                        .on("mousemove",function(d,i){
                            var panel_id = this.parentNode.id.split("_")[2];
                            updateTooltip(chart_id, series_id, options, clicked_object[+panel_id], d, tooltip, this, granular_data, count);
                        })
                        .on("mouseover",function(d,i){
                            var yourSelect = document.querySelector(".dimension_filter"),
                                panel_id;
                            panel_id = this.parentNode.id.split("_")[2];
                            updateTooltip(chart_id, series_id, options, clicked_object[+panel_id], d, tooltip, this, granular_data, count);
                            if(!clicked_object[+panel_id]) {
                                if(yourSelect.options[yourSelect.selectedIndex].value !== "none") {
                                    for (var l = 1; l < panel_count; l++) {
                                        if(!clicked_object[l]) {
                                            resetChartSelection("DA_panel_" + l);
                                            if(retain_click[l]) {
                                                var changeEvent = new Event("click");
                                                document.querySelector("#DA_panel_" + l + "_dimensional_analysis_holder #DA_" + retain_click[l].original_key).dispatchEvent(changeEvent);
                                            }
                                        }
                                    }
                                    yourSelect.value = "none";
                                }
                                if(!clicked_object[+panel_id]) {
                                    d3.event.stopPropagation();
                                    d3.select(this).style({
                                        fill: da_hover_color
                                    });
                                    interactions(granularity,d,options,parent_id,series_id);
                                    yourSelect.value = "none";
                                }
                                retain_click = [undefined];
                            }
                        })
                        .on("mouseout",function(){
                            var panel_id = this.parentNode.id.split("_")[2];
                            tooltip.style.display = "none";
                            if(!clicked_object[+panel_id]) {
                                resetChartSelection(parent_id);
                            }
                        });
            }

            if(!render_da) {
                var span = document.createElement("span");
                span.innerHTML = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";
                document.querySelector("#" + parent_id).appendChild(span);
            }
    };

    var resetChartSelection = function (parent_id) {
        d3.selectAll("#" + parent_id + " rect.column")
            .style({
                "fill": da_chart_color,
                "stroke": "white",
                "stroke-dasharray": function(d,i) {
                    return "0,0";
                }
            });
        d3.selectAll("#" + parent_id + " .comcharts-TS-highlight-column")
            .attr({
                height: 0
            });

        var panel_id = parent_id.split("DA_panel_")[1];

        if (clicked_object[+panel_id]) {
            var chart_name = TimeSeries.chart_options[document.getElementById("DA_panel_" + panel_id).dataset.chart].caption || "Filter by time",
                series_name = document.getElementById("DA_panel_" + panel_id).dataset.series,
                suggestion;

            suggestion = document.getElementById(chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion");
            if (suggestion) {
                suggestion.remove();
            }
        }

        clicked_object[+panel_id] = null;
    };

    var createResetAllButton = function() {
        var reset_all_button = document.createElement("span");
        reset_all_button.id = "DA_reset_all_button";
        reset_all_button.className = "modal-close";
        reset_all_button.innerHTML = "Reset all";
        reset_all_button.addEventListener("click", function () {
            this.style.visibility = "hidden";
            for (var i = 1; i < panel_count; i++) {
                if (document.getElementById("DA_panel_" + i + "_reset_button")) {
                    document.getElementById("DA_panel_" + i + "_reset_button").style.visibility = "hidden";
                }
                resetChartSelection("DA_panel_" + i);
            }
        });

        return reset_all_button;
    };

    var updateTooltip = function(chart_id, series_id, options, clicked_object, hovered_object, tooltip, rect, data, count) {
        var tooltip_text = createTooltipText(chart_id, series_id, options, data, clicked_object, hovered_object, count),
            // dimensions = rect.getBoundingClientRect(),
            mouseX,
            mouseY;

        TimeSeries.mediator.publish("renderTooltipContent","dimensional_analysis_chart_tooltip",tooltip_text);
        tooltip.style.display = "block";

        mouseX = d3.event.pageX + 15;
        mouseY = d3.event.pageY - 15;

        tooltip.style.top = mouseY + "px";
        tooltip.style.left = mouseX  + "px";
    };

    var createTooltipText = function(chart_id, series_id, options, data, clicked_object, hovered_object, count) {
        var hovered_granularity = hovered_object.granularity,
            clicked_granularity,
            granularity_array,
            percentage,
            formatter,
            hovered_key,
            clicked_key,
            color,
            tooltip_text,
            map_object,
            filtered_value,
            total = 0,
            output_number_format = options.outputNumberFormat,
            number_formatter = d3.format(output_number_format),
            granularities = ["year", "quarter", "month", "week", "day", "weekday", "hour"],
            first_value,
            second_value;

        map_object = mapFunction(hovered_granularity, data);
        formatter = createTooltipFormatter(hovered_granularity, data);
        hovered_key = formatter(map_object.func(hovered_object.original_key), hovered_object.original_key);

        if(!clicked_object) {
            granularity_array = data[hovered_granularity];
        } else {
            clicked_granularity = clicked_object.granularity;
            map_object = mapFunction(clicked_granularity, data);
            formatter = createTooltipFormatter(clicked_granularity, data);
            clicked_key = formatter(map_object.func(clicked_object.original_key), clicked_object.original_key);
            if(clicked_object.granularity === hovered_granularity) {
                granularity_array = data[hovered_granularity];
            } else {
                granularity_array = filtered_data[hovered_granularity];
            }
        }

        for (var i = 0, length = granularity_array.length; i < length; i++) {
            total += granularity_array[i].value;
            if(hovered_object.original_key === granularity_array[i].key) {
                filtered_value = granularity_array[i].value;
            }
        }
        percentage = (( filtered_value / total) * 100).toFixed(2);

        if(!clicked_object || clicked_object.granularity === hovered_granularity) {
            color = da_chart_color;
            if(!clicked_object || clicked_object.original_key === hovered_object.original_key) {
                color = da_hover_color;
            }

            tooltip_text = "<table class='hovered_clicked_granularity_eq'><tr class='first_row'><td><span>" +
                            hovered_key + "</span> contributes</td></tr>";
            tooltip_text += "<tr class='second_row'><td style='color:" + color + ";'>" +
                            number_formatter(filtered_value) + " (" + percentage + "%)</td></tr>";
            tooltip_text += "<tr class='third_row'><td>to the total <b>" +
                            series_id + "</b></td></tr>";
            tooltip_text += "<tr class='fourth_row'><td><span class='first_span'>" +
                            number_formatter(total) + "</span> across all the <span class='second_span'>" +
                            hovered_granularity + "s</span></td></tr></table>";
        } else {
            if(granularities.indexOf(clicked_granularity) > granularities.indexOf(hovered_granularity)) {
                first_value = clicked_key;
                second_value = hovered_key;
            } else {
                first_value = hovered_key;
                second_value = clicked_key;
            }

            tooltip_text = "<table class='hovered_clicked_granularity_uneq'><tr class='first_row'><td><span>" +
                            hovered_key + "</span> contributes</td><tr>";
            tooltip_text += "<tr class='second_row'><td>" +
                            number_formatter(filtered_value) + " (" + percentage + "%)</td><tr>";
            tooltip_text += "<tr class='third_row'><td>to the total <b>" +
                            series_id + "</b></td><tr>";
            tooltip_text += "<tr class='fourth_row'><td><span class='first_span'>" +
                            number_formatter(total) + "</span> in <span class='second_span'>" +
                            clicked_key + "</span></td><tr></table>";
        }
        return tooltip_text;
    };

    var createTooltipFormatter = function(granularity, data) {
        switch(granularity) {
            case "month":
                return d3.time.format("%B");
            case "weekday":
                return d3.time.format("%A");
            case "quarter":
                var quarter_name = ["Quarter 1", "Quarter 2", "Quarter 3","Quarter 4"],
                    format = function(date, key) {
                        return quarter_name[key - 1];
                    };
                return format;
            case "week":
                return function(date, key) {
                    return "Week " + key;
                };
            case "hour":
                return function(date, key) {
                    return "Hour " + key;
                };
            case "day":
                return function(date, key) {
                    return "Day " + key;
                };
            default:
                return d3.time.format(mapFunction(granularity, data).format);
        }
    };

    var mapFunction = function(granularity, data) {
        var granularity_obj = {};
        switch(granularity) {
            case "year":
                var interval = 4;
                if (data.length < 4) {
                    interval = data.length;
                }
                granularity_obj = {
                    func: function(date) {
                        return new Date(date,0);
                    },
                    format: '%Y',
                    xAxisTickInterval: interval
                };
                return granularity_obj;
            case "month":
                granularity_obj = {
                    func: function(date) {
                        return new Date(new Date().getFullYear(),date);
                    },
                    format: '%b',
                    xAxisTickInterval: 4,
                    additionFactor: 0
                };
                return granularity_obj;
            case "hour":
                granularity_obj = {
                    func: function(date) {
                        var setHour = new Date(new Date().getFullYear() + "/01/01").setHours(date);
                        return new Date(setHour);
                    },
                    format: '%H',
                    xAxisTickInterval: 4,
                    additionFactor: 0
                };
                return granularity_obj;
            case "weekday":
                granularity_obj = {
                    func: function(date) {
                        var d, daytoset; // given: a Date object and a integer representing the week day
                        d = new Date("1/1/2014");
                        daytoset = date;
                        currentDay = d.getDay();
                        distance = daytoset - currentDay;
                        d.setDate(d.getDate() + distance);
                        return new Date(d);
                    },
                    format: '%a',
                    xAxisTickInterval: 2,
                    additionFactor: 0
                };
                return granularity_obj;
            case "week":
                granularity_obj = {
                    func: function(date) {
                        var year = 2012,
                            week = date,
                            d = new Date(year, 0, 1),
                            offset = d.getTimezoneOffset();
                        // ISO: week 1 is the one with the year's first Thursday
                        // so nearest Thursday: current date + 4 - current day number
                        // Sunday is converted from 0 to 7
                        d.setDate(d.getDate() + 4 - (d.getDay() || 7));

                        // 7 days * (week - overlapping first week)
                        d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000 * (week + (year == d.getFullYear() ? -1 : 0 )));

                        // daylight savings fix
                        d.setTime(d.getTime() + (d.getTimezoneOffset() - offset) * 60 * 1000);

                        // back to Monday (from Thursday)
                        d.setDate(d.getDate() - 3);
                        return d;
                    },
                    format: '%U',
                    xAxisTickInterval: 26,
                    additionFactor: 1
                };
                return granularity_obj;
            case "quarter":
                var quater_name = ["Q1", "Q2", "Q3","Q4"];
                granularity_obj = {
                    func: function(date) {
                        var quater_dates = [new Date("1/1/2000"), new Date("4/1/2000"), new Date("7/1/2000"),new Date("10/1/2000")];
                        return quater_dates[date - 1];
                    },
                    format: function(d,i){
                        return quater_name[i];
                    },
                    xAxisTickInterval: 0,
                    additionFactor: 1
                };
                return granularity_obj;
            case "day":
                granularity_obj = {
                    func: function(date) {
                        return new Date("1/" + date + "/2014");
                    },
                    format: "%d",
                    xAxisTickInterval: 3,
                    additionFactor: 1
                };
                return granularity_obj;
        }
    };

    var interactions = function(granularity,data,options, parent_id,series_id) {
        var config = {
            "year": null,
            "month": null,
            "hour": null,
            "day": null,
            "week":null,
            'weekday':null,
            'quarter':null
        },
        table_name = options.selector + "_DA",
        map_function,
        new_data,
       /* missing_data,*/
        granularity_obj;
        // removeGranularityFilterq({selector: table_name});
        switch(data.granularity) {
            case "year":
                granularity = "%Y";
                break;
            case "month":
                granularity = "%m";
                break;
            case "hour":
                granularity = "%H";
                break;
            case "day":
                granularity = "%d";
                break;
            case "weekday":
                granularity = "%w";
                break;
            case "week":
                granularity = "%U";
                break;
            case "quarter":
                granularity = "%m";
                break;
        }

        config[data.granularity] = [data.original_key, data.original_key];
        console.time("filter time");
        filterDataq(config, {selector: table_name});
        filtered_data = getGroupData({selector: table_name, granularity: granularity, aggregation: "sum",dateColumnName: options.dateColumnName,series_id:series_id}, selected_metric);
        for (var i in filtered_data) {
            if(i !== data.granularity && TimeSeries.chart_options[parent_id + "_dimension_" + i]) {
                filtered_data[i].sort(function(a,b){
                    return a.key - b.key;
                });
                new_data = JSON.parse(JSON.stringify(filtered_data[i]));
                granularity_obj = mapFunction(i, data);
                map_function = granularity_obj.func;
                var missing_data;

                for (var j = 0, length = granularities[granularity_order.indexOf(i)].length || new_data.length; j < length; j++) {
                    if(!new_data[j] && i !== "year") {
                        new_data[j] = {
                            key: j + granularity_obj.additionFactor,
                            value: 0
                        };
                    } else if(new_data[j].key !== (j + granularity_obj.additionFactor)  && i !== "year") {
                        missing_data = {
                            key: j + granularity_obj.additionFactor,
                            value: 0
                        };
                        new_data.splice(j,0,missing_data);
                    }
                    new_data[j].key = map_function(new_data[j].key);
                }

                createColumnChart(TimeSeries.chart_options[parent_id + "_dimension_" + i] ,new_data);

                d3.selectAll("#" + (parent_id + "_dimension_" + i) + "_plot_group rect.column")
                    .style("fill",function(d,i){
                        // if(new_data[i].value !== 0) {
                        return "#ECECEC";
                        // }
                        // return "steelblue";
                    });
            }
        }
    };

    var mouseoutFunction = function(parent_id) {
        d3.selectAll("#" + parent_id + "_dimensional_analysis_holder .comcharts-TS-highlight-column")
            .attr("height",0);
    };

    var createColumnChart =  function(options,data, value) {
        var plot_group = d3.select("#" + options.selector + "_plot_group"),
            column,
            chart_configs = TimeSeries.chart_configs[options.selector],
            fakeOrdinanalScale = chart_configs.fakeOrdinanalScale,
            height = chart_configs.height,
            width = chart_configs.width,
            xAxis = TimeSeries.xAxisFunctions,
            yAxis = TimeSeries.yAxisFunctions,
            xGroup = d3.select("#" + options.selector + "_svg_group #xaxis"),
            yGroup = d3.select("#" + options.selector + "_svg_group #yaxis"),
            yScale = chart_configs.yScale;

        column = plot_group.selectAll(".comcharts-TS-highlight-column")
            .data(data);

        column.enter()
            .append("rect")
            .attr("class", "comcharts-TS-highlight-column")
            .style("pointer-events", "none");

        column.style({
                "fill": options.chartColor[0],
                "stroke-width": options.borderThickness,
                "stroke": options.bordercolor
            })
            .attr({
                x: function(d) { return fakeOrdinanalScale(new Date(d.key)); },
                width: fakeOrdinanalScale.rangeBand(),
                y: function(d) { return !d.value ? 0 : yScale(value === 0 ? 0 : d.value); },
                height: function(d) { return !d.value ? 0 : (height - yScale(value === 0 ? 0 : d.value)); }
            });

        column.exit().remove();
    };

    var renderDA = function (chart_id, render, chart, series) {
// Suggestions:Do you want to compare how Week 54 of <<__>> is performing against another week? OR Select another chart > and series >
            var panel_body,
                suggestions_div = document.createElement("div"),
                count = chart_id.split("DA_panel_")[1],
                span;

            // panel_body.className = "panel-body";

            span = document.createElement("span");
            span.className = "comcharts-TS-DA-analyze-series";
            if (render) {
                span.innerHTML = "Analyze a series";
            } else {
                span.innerHTML = "Analyze another series";
            }

            suggestions_div.id = "suggestions_div";
            suggestions_div.className = 'suggestions_div';
            suggestions_div.appendChild(span);
            // document.getElementById(chart_id).appendChild(panel_body);
            console.log(chart_id, chart, "renderDA");
            panel_body = modalElements(chart_id, chart);

            span.style.cursor = "pointer";
            span.addEventListener("click", function () {
                TimeSeries.mediator.publish("initModal",{
                    content: panel_body,
                    modal_title: 'Select a series to "Roll-up by time"',
                    close_text: "x",
                    close_id: "DA_close_select_series",
                    modal_type: "custom",
                    selected_tab: "DA_panel_"+count,
                    maxHeight: "65%",
                    top:"20%"
                });
            });
            if (count == 1 && render) {
                TimeSeries.mediator.publish("initModal",{
                    content: panel_body,
                    modal_title: 'Select a series to "Roll-up by time"',
                    close_text: "x",
                    close_id: "DA_close_select_series",
                    modal_type: "custom",
                    selected_tab: "DA_panel_1",
                    maxHeight: "65%",
                    top:"20%"
                });
            }
            if (document.querySelector(".scotch-modal")) {
                var calculated_height = (document.querySelector('.scotch-modal').offsetHeight - document.querySelector('.comcharts-TS-modal-chartarea-title').offsetHeight - document.querySelector('.comcharts-TS-help').offsetHeight - 50);
                d3.selectAll(".comcharts-TS-DA-modal-selection-list-box").style("height", calculated_height + "px");
            }

            span = document.createElement("span");
            span.id = "compare_suggestion";
            suggestions_div.appendChild(span);
            document.getElementById(chart_id).appendChild(suggestions_div);
        // }
    };

    var modalElements = function (chart_id, chart_selector) {
        var modal_container = document.createElement('div'),
            chart_option,
            series_list = document.createElement("ul"),
            series_div = document.createElement('div'),
            count = chart_id.split("DA_panel_")[1],
            panel_body = document.createElement("div"),
            dashboard_span = document.createElement("div"),
            chart_span = document.createElement("div"),
            series_span = document.createElement("div"),
            span;

        modal_container.className = 'comcharts-TS-sidebar comcharts-TS-DA-modal-container';
        modal_container.style.width = '100%';
        var helptext_div = document.createElement('div');
        helptext_div.className = 'comcharts-TS-help';
        helptext_div.innerHTML = "Roll-up by time gives you histograms by various units of time e.g. year, quarter, month, week number, day of the week, etc. These pre-built visual histograms allow you to explore interesting insights about each series, visually determine contributions and compare each series against another.";
        modal_container.appendChild(helptext_div);

        var chart_options = TimeSeries.chart_options[chart_selector],
            metric_columns = chart_options.metricsColumnName,
            new_metrics = chart_options.newMetricsColumn,
            display_metrics = chart_options.displayMetricsColumn,
            metric_columns_length = metric_columns.length;

            for (var k = 0; k < metric_columns_length; k++) {
                series_options = document.createElement("li");
                series_options.className = 'comcharts-TS-sub-category-feature-modal';
                series_options.dataset.value = new_metrics[k];
                series_options.innerHTML = display_metrics[k];
                series_options.dataset.chart = chart_selector;
                series_list.appendChild(series_options);
            }

        series_span.className = 'suggestions-div-title';
        span = document.createElement("span");
        span.className = 'comcharts-TS-content-sub-heading comcharts-TS-suggestions-div-select-dashboard';
        span.innerHTML = 'Series';
        series_span.appendChild(span);

        series_list.id = "panel_DA_series_" + count + "_select_box";
        series_list.setAttribute("panel-id",count);
        series_list.className = 'comcharts-TS-sidebar-ul comcharts-TS-card-effect';

        //mimicking the behaviour of a drop down.......
        series_list.onfocus = function () { this.options[0].style.display = "none";};
        series_list.onblur = function () { this.options[0].style.display = "block";};
        series_div.className = "comcharts-TS-DA-modal-selection-list-box thick comcharts-background-lightgray";
        series_div.id = "comcharts_TS_DA_modal_series_selection";
        series_div.style.width = "100%";
        series_div.appendChild(series_span);
        series_div.appendChild(series_list);

        series_list.addEventListener("click",function () {
            var current_highlight = document.querySelector(".dimension_filter"),
                current_highlight_value = current_highlight.options[current_highlight.selectedIndex].value;
            var chart_id = event.srcElement.dataset.chart,
                series_id,// = event.srcElement.dataset,
                series_attributes = event.srcElement.dataset,
                selected_chart = event.srcElement.innerHTML;

            series_id = series_attributes.value;
            d3.selectAll("#panel_DA_series_"+count+"_select_box li").classed('active', false);
            d3.select(event.srcElement).classed('active', true);
            createDimensionCharts(chart_id, series_id, chart_id, count, series_attributes);
            TimeSeries.mediator.publish("closeModal");
            // TimeSeries.mediator.publish("setDashboardHeight");
            if(current_highlight_value !== "none") {
                returnFilterValue(current_highlight_value,options, "DA_panel_" + this.getAttribute("panel-id"));
            }
        });

        modal_container.appendChild(series_div);
        panel_body.appendChild(modal_container);
        return panel_body;
    };

    var daOnDrop = function (target_selector, chart_selector) {
        var main_DA_container = document.createElement("div"),
            panel_1 = document.createElement("div"),
            panel_2 = document.createElement("div"),
            panel_3 = document.createElement("div"),
            panel_4 = document.createElement("div"),
            highlight_view_div,
            description_div = document.createElement("div"),
            clearfix = document.createElement("div");

        main_DA_container.id = "dimensionalAnalysis";
        main_DA_container.innerHTML = '<div class="col-sm-12 comcharts-TS-content-sub-heading" style="padding:0px;"><div id="DA_highlight_view" class="col-sm-12 comcharts-TS-da-tab" style="border:none;"></div></div>';

        panel_1.id = "DA_panel_1";
        panel_1.className = "col-sm-4 comcharts-TS-da-tab";

        clearfix.id = "comchart_TS_clearfix";
        clearfix.className = "comcharts-TS-clearfix";

        main_DA_container.appendChild(panel_1);
        main_DA_container.appendChild(clearfix);

        document.querySelector("#" + target_selector).appendChild(main_DA_container);
        var helptext_div = document.createElement('div');
        helptext_div.className = 'comcharts-TS-help';
        helptext_div.id = "roll_up_help_text";
        helptext_div.innerHTML = "Roll-up by time gives you histograms by various units of time e.g. year, quarter, month, week number, day of the week, etc. These pre-built visual histograms allow you to explore interesting insights about each series, visually determine contributions and compare each series against another.";

        if(!document.getElementById('roll_up_help_text')) {
            document.querySelector("#" + target_selector).appendChild(helptext_div);
        }


        highlight_view_div = document.getElementById("DA_highlight_view");
        highlight_view_div.innerHTML = "<span class='comcharts-TS-da-chart-name comcharts-TS-da-drop-down-title'>Highlight</span>";
        create_selectbox = document.createElement("select");
        create_selectbox.setAttribute('class','dimension_filter');
        option_value = ['none','top','bottom','topfew','bottomfew'];
        option_text = ['None','Top','Bottom','Top Few','Last Few'];
        len = option_value.length;
        create_selectbox.id =/* div_id + */"_DA_agg";
        create_selectbox.setAttribute("parent_id","div");

        for(var i = 0;i<len;i++) {
            option = document.createElement("option");
            option.value = option_value[i];
            option.text = option_text[i];
            create_selectbox.appendChild(option);
        }

        highlight_view_div.appendChild(create_selectbox);
        if (!document.getElementById(/*div_id + */"_DA_agg")) {
            user_div.appendChild(highlight_view_div);
        }

        renderDA("DA_panel_1", true, chart_selector, "Surface Pressure");
    };
    TimeSeries.mediator.subscribe("configureDimensionalAnalysis",initConfig);
    TimeSeries.mediator.subscribe("initDimensionalAnalysis",init);
    TimeSeries.mediator.subscribe("createDimensionData",createData);
    TimeSeries.mediator.subscribe("createDimensionCharts",createCharts);
    TimeSeries.mediator.subscribe("createColumnChart",createColumnChart);
    TimeSeries.mediator.subscribe("seeDimensionalAnalysis",seeDimensionalAnalysis);
    TimeSeries.mediator.subscribe("updateDimensionalAnalysis",updateChart);
    TimeSeries.mediator.subscribe("createOverlay",createOverlay);
    TimeSeries.mediator.subscribe("dimensionalAnalysisConfigCallback",dimensionalAnalysisConfigCallback);
    TimeSeries.mediator.subscribe("createOverlay",createOverlay);
    TimeSeries.mediator.subscribe("queryInitializer",queryInitializer);
    TimeSeries.mediator.subscribe("executeOnComplete",executeOnComplete);

    return {
        init : init,
        createData: createData,
        createCharts: createCharts,
        mapFunction: mapFunction,
        createOverlay: createOverlay
    };
})();