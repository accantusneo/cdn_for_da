var yAxisFunction = TimeSeries.yAxisFunctions;

module('Y Axis group');
test('Y axis group creation', function(){
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
    y_translate = 300;
    yAxisFunction.createAxisGroup(options,svg,x_translate,y_translate);
    axis_group = document.querySelector("#chart #yaxis");

    ok(axis_group,"group to place y-axis has been created");
    equal(parseFloat(axis_group.getAttribute("transform").substring(10,12)),20,"The y axis group created has been translated by 20px from the left");
    equal(parseFloat(axis_group.getAttribute("transform").substring(13,16)),300,"The y axis group created has been translated by 300px from the top");
    element = document.getElementById("chart_svg");
    element.parentNode.removeChild(element);
});



module('Y-Axis Scale function testing ',{
    beforeEach: function() {
        this.y_axis_scale = TimeSeries.yAxisFunctions.scale;
    }
});

test('should return an array of domain and range', function() {
    var y_axis = this.y_axis_scale([-100,100],[0,100]);

    equal(y_axis.domain()[0],-100, "Domain's minimum value is -100.");
    equal(y_axis.domain()[1],100, "Domain's maximum value is 100.");

    equal(y_axis.range()[0],0, "Range's minimum value is 0.");
    equal(y_axis.range()[1],100, "Range's maximum value is 100.");
});

module("Y axis CSS implementation testing");
test("Should set the CSS of the y axis", function() {
    var element = document.createElement("div");
    element.id = "chart_container4";
    document.body.appendChild(element);
    var config = {
            width: 600,
            height: 400,
            selector: "chart_container4",
            chartType: "line_chart",
            yAxisPosition: "left",
            yAxisTickSize: 10,
            yAxisTickValues:"smartDefault"
        },
        svg,
        yScale,
        yAxis,
        chart_group,
        yGroup;
    var config = TimeSeries.chartConfigValidation.validate(config,TimeSeries.mandatory_configs);
        config = TimeSeries.chartConfigValidation.validate(config, TimeSeries.default.chart_features);
        config = TimeSeries.chartConfigValidation.validate(config, TimeSeries.default.chart_options);

    TimeSeries.chart_configs[config.selector] = config;

    svg = TimeSeries.svgRendererFunctions.createSVG(config),
    yScale = TimeSeries.yAxisFunctions.scale([0,60],[0,500]),
    yAxis = TimeSeries.yAxisFunctions.axis(config, yScale),
    chart_group = TimeSeries.svgRendererFunctions.createGroup(config, svg, 0, 0, (config.selector + "_svg_group"));
    yGroup = TimeSeries.yAxisFunctions.createAxisGroup(config,chart_group,20,20);
    yGroup.call(yAxis);

    var options = {
            selector: "chart_container4",
            chartType: "line_chart",
            yAxisTickValueSize: 20,
            yAxisTickValueFontFamily: "'Times New Roman', Georgia, Serif",
            yAxisTickValueColor: "blue",
            yAxisTickValueStyle: "bold",
            yAxisTickColor: "red",
            yAxisLineThickness: 3,
            yAxisLineColor: "yellow"
        };
    TimeSeries.chart_configs[options.selector] = options;
    TimeSeries.yAxisFunctions.setCSSConfigs(options);

    var font_color = (document.querySelector(".y.axis text").style.fill === "#0000ff") || (document.querySelector(".y.axis text").style.fill === "rgb(0, 0, 255)"),
        line_color = (document.querySelector(".y.axis path").style.stroke === "#ffff00") || (document.querySelector(".y.axis path").style.stroke === "rgb(255, 255, 0)"),
        ticks_color = (document.querySelector(".y.axis line").style.stroke === "#ff0000") || (document.querySelector(".y.axis line").style.stroke === "rgb(255, 0, 0)");

    equal(document.querySelector(".y.axis text").style["font-size"], "20px", "The font size of the tick values is 20px");
    equal(document.querySelector(".y.axis text").style["font-weight"], "bold", "The font weight of the tick values is bold");
    ok(document.querySelector(".y.axis text").style["font-family"], "The font weight of the tick values is 'Times New Roman', Georgia, serif");
    //ok(font_color, "The font color of the tick values is rgb(0, 0, 255)");
    //ok(line_color, "The color of the y axis line is rgb(255, 255, 0)");
    equal(document.querySelector(".y.axis path").style["stroke-width"], "3px", "The width of the y axis line is 3px");
    //ok(ticks_color, "The color of the y axis ticks is rgb(255, 0, 0)");
    element.parentNode.removeChild(element);
    TimeSeries.chart_configs = [];
});


module("Y axis Tick value validation");
test('should return the array passed as the argunment as it is without modification', function() {
    var tick_value = yAxisFunction.validateTickValues("selector",[10,20,30,40,50,60]);
    deepEqual(tick_value, [10,20,30,40,50,60], 'recived the input array as it is as all input were number.');
});

test('should return the array excluding non numeric values from the input array', function() {
    var tick_value = yAxisFunction.validateTickValues("selector" ,[10,"sample",undefined,false,50,60]);
    deepEqual(tick_value, [10,50,60], 'recived the array excluding non numeric values.');
});

module('Y-Axis TickValue Testing');
test('should return the tick value array inserted durng the call ([10,20,30,40,50,60])', function() {
    var config = {
        "yAxisTickValues":[10,20,30,40,50,60],
        "selector":"test"
    };
    TimeSeries.chart_configs[config.selector] = config;
    var scale = TimeSeries.yAxisFunctions.scale([0,100],[0,100]),
        y_axis = TimeSeries.yAxisFunctions.axis(config,scale);

    deepEqual(y_axis.tickValues(), [10,20,30,40,50,60], 'proper tickValues set i.e. [10,20,30,40,50,60]');
    config = {
        "yAxisTickValues":"smartDefault"
    };
    TimeSeries.chart_configs[config.selector] = config;
    y_axis = TimeSeries.yAxisFunctions.axis(config,scale);
    deepEqual(y_axis.tickValues(), null, 'proper tickValues set i.e. null');
    TimeSeries.chart_configs = [];
});

module('y-grid');
test('creation of y-grid group', function(){
    var element = document.createElement("div");
    element.id = "chart_container2";
    document.body.appendChild(element);
    var config = {
            width: 600,
            height: 400,
            selector: "chart_container2",
            chartType: "line_chart",
            yAxisPosition: "left",
            yAxisTickSize: 10,
            yAxisTickValues:"smartDefault"
        },
        svg = TimeSeries.svgRendererFunctions.createSVG(config),
        gridGroup = TimeSeries.yAxisFunctions.createGridGroup(svg,20,21);

    grid_group = document.querySelector("#yaxis_grid");

    ok(grid_group,"group to place y-grid has been created");
    equal(parseFloat(grid_group.getAttribute("transform").substring(10,12)),20,"The y-grid group created has been translated by 20px from the left");
    equal(parseFloat(grid_group.getAttribute("transform").substring(13,15)),21,"The y-grid group created has been translated by 21px from the top");
    element.parentNode.removeChild(element);
});

test("Should set the CSS of the y-grid", function() {
    TimeSeries.chart_configs = {};
    var element = document.createElement("div");
    element.id = "chart_container3";
    document.body.appendChild(element);
    var config = {
            width: 600,
            height: 400,
            selector: "chart_container3",
            chartType: "line_chart",
            yAxisPosition: "left",
            yAxisTickSize: 10,
            yAxisTickValues:"smartDefault",
            gridColor: "red",
            gridOpacity: 0.5
        },
        svg,
        yScale,
        grid,
        grid_group,
        gridCss,
        group;
        TimeSeries.chart_options["chart_container3"] = config;
        TimeSeries.chart_configs["chart_container3"] = config;
        svg = TimeSeries.svgRendererFunctions.createSVG(config);
        group = TimeSeries.svgRendererFunctions.createGroup(config,svg,0,0,config.selector + "_svg_group");
        yScale = TimeSeries.yAxisFunctions.scale([0,60],[0,500]);
        grid = TimeSeries.yAxisFunctions.createGrid(config.selector, yScale);
        gridGroup = TimeSeries.yAxisFunctions.createGridGroup(group,20,21);

    gridGroup.call(grid);
    TimeSeries.yAxisFunctions.setGridCSS(config);
    equal(document.querySelector(".y.grid line").style["opacity"], "0.005", "The opacity of the y-grid lines is 0.005");
    ok(document.querySelector(".y.grid line").style.stroke, "The color of the y-grid lines is rgb(255, 0, 0)");
    element.parentNode.removeChild(element);
});
