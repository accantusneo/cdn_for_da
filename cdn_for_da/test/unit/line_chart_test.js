module('Line Chart Testing');
test('The DOM structure for line chart ', function(assert) {
    var svg = document.getElementById('chart_line_line'),
        caption = svg.firstChild,
        sub_caption = caption.nextSibling,
        chart_group = sub_caption.nextSibling,
        x_axis = chart_group.firstChild,
        y_axis = x_axis.nextSibling,
        plot_group = y_axis.nextSibling,
        crosshair = plot_group.nextSibling,
        path = plot_group.firstChild,
        clippath = plot_group.lastChild;


        ok(svg,'has an svg element.');
        ok(caption,'has a caption <g>.');
        ok(sub_caption,'has a SubCaption <g>.');
        ok(chart_group,'has a chart container group <g>.');
        ok(x_axis,'has a x_axis group.');
        ok(y_axis,'has a y_axis group.');
        ok(plot_group,'has a plot group.');
        ok(path,'plot_group has path.');
        ok(crosshair,'has a crosshair group.');
        ok(clippath,'plot_group has clippath.');

        equal(caption.getAttribute("id"),"chart_lineline_caption_group","proper id assigned to the caption group 'chart_lineline_caption_group'.");
        equal(sub_caption.getAttribute("id"),"chart_lineline_sub_caption_group","proper id assigned to the sub caption group 'chart_lineline_sub_caption_group'.");
        equal(chart_group.getAttribute("id"),"chart_lineline_group","proper id assigned to the chart group 'chart_lineline_sub_caption_group'.");
        equal(x_axis.getAttribute("id"),"xaxis","proper id assigned to the x_axis group 'xaxis'.");
        equal(y_axis.getAttribute("id"),"yaxis","proper id assigned to the y_axis group 'yaxis'.");
        equal(plot_group.getAttribute("id"),"chart_line_plot_group","proper id assigned to the plot_group 'chart_line_plot_group'.");
        equal(crosshair.getAttribute("id"),"chart_line_crosshair","proper id assigned to the crosshair 'chart_line_crosshair'.");
});

test('updateFeatureToChartMapping updates the JSON object',function() {
    var options = {
        selector: "chart",
        enableAnomalyDetection: true,
        anomalyPointCircleRadius: 5,
        anomalyPointOnHoverColor: "#FF0000",
        anomalyDetectionIconImgSrc: "",
        dimensionFilter: true,
        enableSmoothing: true,
        smoothingSliderTicks: 2,
        rangeFilter: true
    }
    TimeSeries.featureToChartMapping = {};
    TimeSeries.lineChartFunctions.updateFeatureToChartMapping(options);
    deepEqual(TimeSeries.featureToChartMapping.anomalyDetection, {
        applyOn: ["help","chart"],
        name: "Anomaly Detection"
    },"updateFeatureToChartMapping updates the JSON config for features");
});