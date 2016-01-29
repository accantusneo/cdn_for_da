var xAxisFunction = TimeSeries.xAxisFunctions;

module ("X Axis Scale Function");

test("Setting the domain and range of x-axis", function () {

    var x = TimeSeries.xAxisFunctions.scale([new Date("2014-01-20"), new Date("2014-04-20")], [0, 600]);

    ok(x, "X axis scale is created");
    deepEqual(x.domain(), [new Date("2014-01-20"), new Date("2014-04-20")], "with domain ['2014-01-20', '2014-04-20']");
    deepEqual(x.range(), [0, 600], "with range [0, 600]");
});

module('X Axis group');
test('X axis group creation', function(){
    var svg,
        options,
        x_translate,
        y_translate,
        element,
        axis_group;

    options = {
        width: 600,
        height: 400,
        selector: "chart",
        chartType: "line"
    }

    svg = d3.select("#"+options.selector)
        .append("svg")
        .attr({
            width: options.width,
            height: options.height,
            id: options.selector + "_svg"
        });

    x_translate = 20;
    y_translate = 10;
    xAxisFunction.createAxisGroup(options,svg,x_translate,y_translate);
    axis_group = document.querySelector("#chart #xaxis");
    //IE 10 takes only non zero values as ie translate(20) if y_translate = 0.

    ok(axis_group,"group to place x-axis has been created");
    equal(parseFloat(axis_group.getAttribute("transform").substring(10,12)),20,"The x axis group created has been translated by 20px from the left");
    equal(parseFloat(axis_group.getAttribute("transform").substring(13,15)),10,"The x axis group created has been translated by 300px from the top");

    element = document.getElementById("chart_svg");
    element.parentNode.removeChild(element);
});

module("X axis CSS implementation testing");

test("Should set the CSS of the x axis", function() {
    var element = document.createElement("div");
    element.id = "chart_container1";
    document.body.appendChild(element);
    var config = {
            width: 600,
            height: 400,
            selector: "chart_container1",
            chartType: "line_chart",
            xAxisTickValueSize: 20,
            xAxisTickValueFontFamily: "'Times New Roman', Georgia, Serif",
            xAxisTickValueColor: "blue",
            xAxisTickValueStyle: "bold",
            xAxisTickColor: "red",
            xAxisLineThickness: 3,
            xAxisLineColor: "yellow",
            xAxisTickSize: 10,
            xAxisTickValues:"smartDefault",
            xAxisTickInterval:1,
            xAxisTickIntervalGranularity:"minute"
        },
        svg,
        xScale,
        xAxis,
        xGroup,
        Group;

    config = TimeSeries.chartConfigValidation.validate(config,TimeSeries.mandatory_configs);
    config = TimeSeries.chartConfigValidation.validate(config, TimeSeries.default.chart_features);
    config = TimeSeries.chartConfigValidation.validate(config, TimeSeries.default.chart_options);

    TimeSeries.chart_configs[config.selector] = config;

    svg = TimeSeries.svgRendererFunctions.createSVG(config);
    Group = TimeSeries.svgRendererFunctions.createGroup(config,svg,20,20,(config.selector + "_svg_group"));
    xGroup = TimeSeries.xAxisFunctions.createAxisGroup(config,Group,20,20);
    xScale = TimeSeries.xAxisFunctions.scale([0,60],[0,500]);
    xAxis = TimeSeries.xAxisFunctions.axis(config, xScale);

    xGroup.call(xAxis);

    TimeSeries.xAxisFunctions.setCSSConfigs(config);
    var font_color = (document.querySelector(".x.axis text").style.fill === "#0000ff") || (document.querySelector(".x.axis text").style.fill === "rgb(0, 0, 255)"),
        line_color = (document.querySelector(".x.axis path").style.stroke === "#ffff00") || (document.querySelector(".x.axis path").style.stroke === "rgb(255, 255, 0)"),
        ticks_color = (document.querySelector(".x.axis line").style.stroke === "#ff0000") || (document.querySelector(".x.axis line").style.stroke === "rgb(255, 0, 0)");

    equal(document.querySelector(".x.axis text").style["font-size"], "20px", "The font size of the tick values is 20px");
    equal(document.querySelector(".x.axis text").style["font-weight"], "bold", "The font weight of the tick values is bold");
    ok(document.querySelector(".x.axis text").style["font-family"], "The font weight of the tick values is 'Times New Roman', Georgia, serif");
    //ok(font_color, "The font color of the tick values is rgb(0, 0, 255)");
    //ok(line_color, "The color of the x axis line is rgb(255, 255, 0)");
    equal(document.querySelector(".x.axis path").style["stroke-width"], "3px", "The width of the x axis line is 3px");
    //ok(ticks_color, "The color of the x axis ticks is rgb(255, 0, 0)");
   element.parentNode.removeChild(element);
   TimeSeries.chart_configs = [];
});

module("X Axis Tick value validation");
test('should return the array passed as the argunment as it is without modification', function() {
    var tick_value = xAxisFunction.validateTickValues("TestingXAxis",["2015-03-25","2015-03-26","2015-03-27","2015-03-28","2015-03-29"]);
    deepEqual(tick_value, ["2015-03-25","2015-03-26","2015-03-27","2015-03-28","2015-03-29"], 'recived the input array as it is as all inputs were valid date.');
});

test('should return the array excluding invalid date values from the input array', function() {
    var tick_value = xAxisFunction.validateTickValues("TestingXAxis",["2015-03-25","sample",undefined,"25/03/2015","26-03-2015","2015-03-26"]);
    deepEqual(tick_value, ["2015-03-25","2015-03-26"], 'recived the array excluding invalid date format.');
});

module('X-Axis TickValue Testing');
test('should return the tick value array inserted durng the call (["2015-03-25","2015-03-26","2015-03-27","2015-03-28","2015-03-29"])', function() {
    var config = {
        "xAxisTickValues":["2015-03-25","2015-03-26","2015-03-27","2015-03-28","2015-03-29"],
        "xAxisTickInterval":1,
        "xAxisTickIntervalGranularity":"hour",
        "selector":"test"
    }
    TimeSeries.chart_configs[config.selector] = config;

    var scale = xAxisFunction.scale([0,100],[0,100]),
        x_axis = xAxisFunction.axis(config,scale);
    deepEqual(x_axis.tickValues(), ["2015-03-25","2015-03-26","2015-03-27","2015-03-28","2015-03-29"], 'proper tickValues set i.e. ["2015-03-25","2015-03-26","2015-03-27","2015-03-28","2015-03-29"]');

    config = {
        "xAxisTickValues":"smartDefault",
        "xAxisTickInterval":1,
        "xAxisTickIntervalGranularity":"second",
        "selector":"test2"
    };
    TimeSeries.chart_configs[config.selector] = config;
    x_axis = xAxisFunction.axis(config,scale);
    deepEqual(x_axis.tickValues(), null, "proper tickValues set i.e. 'smartDefault'");
    TimeSeries.chart_configs = [];
});

module('x-grid');
test('creation of x-grid group', function(){
    var element = document.createElement("div");
    element.id = "chart_container2";
    document.body.appendChild(element);
    var config = {
            width: 600,
            height: 400,
            selector: "chart_container2",
            chartType: "line_chart",
            xAxisTickSize: 10,
            xAxisTickValues:"smartDefault"
        },
        svg = TimeSeries.svgRendererFunctions.createSVG(config),
        gridGroup = TimeSeries.xAxisFunctions.createGridGroup(svg,20,400);

    grid_group = document.querySelector("#xaxis_grid");

    ok(grid_group,"group to place x-grid has been created");
    equal(parseFloat(grid_group.getAttribute("transform").substring(10,12)),20,"The x-grid group created has been translated by 20px from the left");
    equal(parseFloat(grid_group.getAttribute("transform").substring(13,16)),400,"The x-grid group created has been translated by 400px from the top");
    element.parentNode.removeChild(element);
});

test("Should set the CSS of the x-grid", function() {
    var element = document.createElement("div");
    element.id = "chart_container3";
    document.body.appendChild(element);
    var config = {
            width: 600,
            height: 400,
            selector: "chart_container3",
            chartType: "line",
            xAxisTickSize: 10,
            xAxisTickValues:"smartDefault",
            gridColor: "red",
            gridOpacity: 50
        },
        svg,
        xScale,
        grid,
        gridGroup,
        gridCss,
        group;

    config = TimeSeries.chartConfigValidation.validate(config,TimeSeries.mandatory_configs);
    config = TimeSeries.chartConfigValidation.validate(config, TimeSeries.default.chart_features);
    config = TimeSeries.chartConfigValidation.validate(config, TimeSeries.default.chart_options);

    TimeSeries.chart_options[config.selector] = config;
    TimeSeries.chart_configs[config.selector] = config;

    svg  = TimeSeries.svgRendererFunctions.createSVG(config);
    xScale = TimeSeries.xAxisFunctions.scale([0,60],[0,500]);

    grid  = TimeSeries.xAxisFunctions.createGrid(config.selector, xScale);

    group = TimeSeries.svgRendererFunctions.createGroup(config,svg,0,0,config.selector + "_svg_group");

    gridGroup  = TimeSeries.xAxisFunctions.createGridGroup(group,20,400);

    gridGroup.call(grid);

    TimeSeries.xAxisFunctions.setGridCSS(config);
    var grid_line_color = (document.querySelector(".x.grid line").style.stroke === "#ff0000") || (document.querySelector(".x.grid line").style.stroke === "rgb(255, 0, 0)");
    equal(document.querySelector(".x.grid line").style["opacity"], "0.5", "The opacity of the x-grid lines is 0.5");
    //ok(grid_line_color, "The color of the x-grid lines is rgb(255, 0, 0)");
   element.parentNode.removeChild(element);
});

module('X-Axis time gradient testing');
test('should return an appropriate d3.time based on chart config', function() {
    var x_axis = xAxisFunction.intervalGranularity("minute");
    deepEqual(x_axis.d3Time, d3.time.minute, 'returned d3.time.minute when minute is set in configuration.');
    equal(x_axis.format, "%M", 'returned the correct format %M');

    var x_axis = xAxisFunction.intervalGranularity("hour");
    deepEqual(x_axis.d3Time, d3.time.hour, 'returned d3.time.hour when minute is set in configuration.');
    equal(x_axis.format, "%H", 'returned the correct format %H');
});

module('X-Axis ticks testing');
test('should return an array with a function and numeric value', function() {
    var config = {
        "xAxisTickValues":"smartDefault",
        "xAxisTickInterval":1,
        "xAxisTickIntervalGranularity":"hour",
        "selector":"test"
    };
    TimeSeries.chart_configs[config.selector] = config;

    var scale = xAxisFunction.scale([0,100],[0,100]),
        tick = xAxisFunction.axis(config,scale);

    ok(TimeSeries.validation.dataTypes(tick.ticks()[0],"function"), 'the first element is a function.');
    equal(tick.ticks()[1], 1, "the second element is interval '1'.");
    TimeSeries.chart_configs = [];
});
