/**
@author Pykih developers
@module columnChartFunctions
@namespace TimeSeries
*/
TimeSeries.columnChartOrdinalFunctions = (function() {
    var renderColumnChart = function(options) {
        var xAxis = TimeSeries.xAxisFunctions,
            yAxis = TimeSeries.yAxisFunctions,
            svg,
            group,
            xGroup,
            yGroup,
            plot_group,
            x_translate = [],
            y_translate = [],
            chart_configs = TimeSeries.chart_configs[options.selector];

        y_translate[0] = (options.yAxisPosition === "right") ? (options.width - options.marginLeft - options.marginRight) : 0; // translate x for y-axis
        y_translate[1] =  0;// translate y for y-axis
        chart_configs.previousGroupsHeight = 0;

        svg = TimeSeries.mediator.publish("createSVG", options); //TimeSeries.svgRendererFunctions.createSVG(options);

        TimeSeries.mediator.publish("addCaption",options,svg);
        TimeSeries.mediator.publish("addSubCaption",options,svg);
        group = TimeSeries.mediator.publish("createGroup", options,svg,options.marginLeft,options.marginTop,(options.selector + "_svg_group"));

        plot_group = TimeSeries.mediator.publish("createGroup",options,group,y_translate[0],y_translate[1],options.selector + "_plot_group");
        if(options.showXAxis) {
            x_translate[0] = 0; // translate x for x-axis
            x_translate[1] = (options.xAxisPosition === "bottom") ? (options.height - options.marginTop - options.marginBottom) : 0; // translate y for x-axis
            xGroup = xAxis.createAxisGroup(options,group,x_translate[0],x_translate[1]); // group to place x-axis
        }

        if(options.showYAxis) {
            yGroup = yAxis.createAxisGroup(options,group,y_translate[0],y_translate[1]);
        }
    };

    var columnChartOrdinal = function(options,data, feature) {
        var x_axis,
            y_axis,
            svg,
            group,
            xAxis = TimeSeries.xAxisFunctions,
            yAxis = TimeSeries.yAxisFunctions,
            height = (options.height - options.marginTop - options.marginBottom),
            width = (options.width - options.marginLeft - options.marginRight),
            x_domain = [],
            y_domain = [],
            xGroup,
            yGroup,
            plot_group,
            overlay,
            column_name = options.metricsColumnName,
            selector = options.selector,
            chart_configs = TimeSeries.chart_configs[options.selector],
            date_column_name = options.dateColumnName,
            metrics_column_name = options.metricsColumnName[0],
            column,
            query_object = {'sort':{'asc':'dataquerykey'}},
            interaction = options.interaction,
            tickFormat = TimeSeries.dateFormatFunctions.dateFormatter,
            no_of_ticks_on_xaxis,
            tick_values = [];

        if (!feature) {
            if (typeof column_name === "object") {
                // TimeSeries.Query.addFilter(selector, column_name.seriesColumnName, [{
                //     "column":column_name.seriesColumnName,
                //     "condition":"Equal",
                //     "values":column_name.seriesName
                // }]);
                query_object.filter = {"column":column_name.seriesColumnName, "condition":"Equal", "values":column_name.seriesName};
                data = TimeSeries.Query.getData(selector, column_name.seriesColumnName, query_object);
                // TimeSeries.Query.removeFilter(options.selector, column_name.metric+"_"+column_name.seriesName, [{"column":column_name.seriesColumnName}]);
            } else {
                data = TimeSeries.Query.getData(selector, column_name, query_object);
            }
        }

        chart_configs.height = height;
        chart_configs.width = width;

        x_domain[0] = d3.min(data, function(d) { return d.key; });
        x_domain[1] = d3.max(data, function(d) { return d.key; });

        y_domain[0] = 0;
        y_domain[1] = d3.max(data, function(d) { return +d.value; });

        chart_configs.svg = svg = d3.select("#" + options.selector + "_svg");
        chart_configs.group = group = d3.select("#" + options.selector + "_svg_group");
        chart_configs.xGroup = xGroup = d3.select("#" + options.selector + "_svg_group #xaxis");
        chart_configs.yGroup = yGroup = d3.select("#" + options.selector + "_svg_group #yaxis");

        chart_configs.xScale = xScale = xAxis.scale(x_domain,[0,width]);
        chart_configs.yScale = yScale = yAxis.scale(y_domain,[height,0]);
        chart_configs.yAxis = y_axis = yAxis.axis(options,yScale);

        var fakeOrdinanalScale = d3.scale.ordinal()
            .domain(data.map(function(d,i) {
                return new Date(d.key);
            }))
            .rangeRoundBands([0, width], 0.1);

        chart_configs.fakeOrdinanalScale = fakeOrdinanalScale;
        chart_configs.xAxis = x_axis = xAxis.axis(options,fakeOrdinanalScale);

        x_axis.tickFormat(function(d,i){
            if(options.xAxisTickValuesFormat.constructor === Function) {
                return options.xAxisTickValuesFormat(d,i);
            } else {
                return tickFormat(options.xAxisTickValuesFormat, d);
            }
        });

        plot_group = d3.select("#" + options.selector + "_plot_group");
        chart_configs.column = column = plot_group.selectAll(".column").data(data);

        column.exit().remove();

        column.enter()
            .append("rect")
            .attr("class", "column");

        column.style("fill", function () {
                if (options.isTimeNavigator) {
                    return "url(#"+selector+"_gradient)";
                } else {
                    return options.chartColor[0];
                }
            })
            .style("stroke-width",options.borderThickness)
            .style("stroke",options.bordercolor)
            .attr("x", function(d) { return fakeOrdinanalScale(new Date(d.key)); })
            .attr("width", fakeOrdinanalScale.rangeBand())
            .transition().duration(options.chartTransitionSpeed*1000)
            .attr("y", function(d) { return !d.value ? 0 : yScale(d.value); })
            .attr("height", function(d) { return !d.value ? 0 : (height - yScale(+d.value)); });

        plot_group.attr("clip-path", "url(#" + options.selector + "_clip)");
        TimeSeries.mediator.publish("createOverlay",plot_group,width,height,options);
        xGroup.call(x_axis);
        yGroup.call(y_axis);
        xAxis.setCSSConfigs(options);
        yAxis.setCSSConfigs(options);
        TimeSeries.mediator.publish("xAxisTitle",options.selector);
        TimeSeries.mediator.publish("yAxisTitle",options.selector);
    };

    TimeSeries.mediator.subscribe("renderColumnChart",renderColumnChart);
    TimeSeries.mediator.subscribe("columnChartOrdinal",columnChartOrdinal);

    return {
        columnChart: columnChartOrdinal,
    };
}());