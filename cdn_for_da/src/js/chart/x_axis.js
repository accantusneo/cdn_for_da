/**
@author Pykih developers
@module xAxisFunctions
@namespace TimeSeries
*/
TimeSeries.xAxisFunctions = (function() {
    /**
    @Function: xScale
    @description: xScale for setting the domain and range of the x-axis
    */
    var scale = function (domain, range) {
        return d3.time.scale()
            .domain(domain)
            .range(range);
    };
    var createAxisGroup = function(options,svg,x_translate,y_translate){
        var group = svg.append("g")
           .attr({
                "id": "xaxis",
                "class": "x axis",
                "transform":"translate(" + x_translate + "," + y_translate + ")"
            });
        return group;
    };
    /**
    *   @function: axis
    *   @param {Object} options - An object of valid chart configurations.
    *   @param {String} scale - Axis scale.
    *   @returns {Function} A d3 axis function.
    *   @description: It creates a d3 axis.
    */
    var axis = function(options, scale) {
        // console.log(options.xAxisNoOfTicks, "options.xAxisNoOfTicks xaxis");
        var tickValues = validateTickValues(options.selector,options.xAxisTickValues),
            tickIntervalGranularity = intervalGranularity(options.xAxisTickIntervalGranularity),
            tickFormat = TimeSeries.dateFormatFunctions.dateFormatter,
            numberFormatter = TimeSeries.numberFormatFunctions.numberFormatter,
            configXAxisTickValuesFormat = TimeSeries.chart_configs[options.selector].xAxisTickValuesFormat,
            axisFunc = d3.svg.axis()
                .scale(scale)
                .orient(options.xAxisPosition)
                .ticks(options.xAxisNoOfTicks)
                .tickSize(options.xAxisTickSize)
                .tickValues(tickValues)
                .tickPadding(options.xAxisTickPadding)
                .tickFormat(function(d,i){
                    if (configXAxisTickValuesFormat) {
                        return numberFormatter(configXAxisTickValuesFormat,d);
                    } else if(options.xAxisTickValuesFormat.constructor === Function) {
                        return options.xAxisTickValuesFormat(d,i);
                    } else {
                        return tickFormat(options.xAxisTickValuesFormat, d);
                    }
                })
                .outerTickSize(options.xAxisOuterTickSize);

        if(tickIntervalGranularity.d3Time) {
            axisFunc.ticks(tickIntervalGranularity.d3Time,options.xAxisTickInterval);
        }
        return axisFunc;
    };
    /**
    *   @function: setCSSCo nfigs
    *   @param {String} options - An object of valid chart configurations.
    *   @description: It sets the font-size, style, family and color of tick values.
    *   It also sets the color and width of the axis line and the color of the ticks.
    */
    var setCSSConfigs = function(options) {
        //Tick labels
        d3.selectAll("#"+ options.selector + "_svg_group" + " .x.axis text")
            .style({
                "font-size" : options.xAxisTickValueSize + "px",
                "font-weight" : options.xAxisTickValueStyle,
                "font-family" : options.xAxisTickValueFontFamily,
                "fill" : options.xAxisTickValueColor
            });
        //Line
        d3.selectAll("#"+ options.selector + "_svg_group" + " .x.axis path")
          .style({
            "stroke" : options.xAxisLineColor,
            "stroke-width" : options.xAxisLineThickness + "px",
            "opacity": options.xAxisLineOpacity
          });
        //Ticks
        d3.selectAll("#"+ options.selector + "_svg_group" + " .x.axis line")
          .style({
            "stroke" : options.xAxisTickColor,
            "opacity": options.xAxisTickOpacity,
            "stroke-width": options.xAxisTickThickness
          });
    };
    /**
    *   @function: validateTickValues
    *   @param {String} array - An array tick values.
    *   @returns {String} An array with validated tick values or null.
    *   @description: It validates the tick values array (for valid date values) passed by the user.
    */
    var validateTickValues = function (selector,array) {
        if(array === "smartDefault" || array === undefined || array.length === 0){
            return null;
        }
        if (TimeSeries.chart_options[selector] && TimeSeries.chart_options[selector].chartType === "column") {
            return array;
        }
        var i,
            modified_array = [],
            length = array.length,
            date_format;

        for(i=0;i<length;i++) {
            date_format = TimeSeries.mediator.publish("detectDateFormat",selector,[{x:array[i]}],"x");
            if(TimeSeries.validation.dataTypes(array[i],"date") && (date_format.format !== "Invalid format")) {
                modified_array.push(array[i]);
            } else {
                warningHandling(TimeSeries.errors.invalidConfig("xAxisTickValue: "+array[i]+" invalid date type",selector));
            }
        }
        return modified_array;
    };
    /**
    *   @function: createGrid
    *   @param {String} options - An object of valid chart configurations.
    *   @param {String} scale - d3 scale object.
    *   @returns {Object} d3 axis object.
    *   @description: It creates a d3 axis and sets its scale, orientation, tick values, tick size and tick format.
    */
    var createGrid = function(selector, scale) {
        var chart_configs = TimeSeries.chart_configs[selector],
            options =  TimeSeries.chart_options[selector],
            tickValues = validateTickValues(options.xAxisTickValues);
        var grid = d3.svg.axis()
                      .scale(scale)
                      .orient(options.xAxisPosition)
                      .ticks(options.xAxisNoOfTicks)
                      .tickSize(-chart_configs.height)
                      .tickFormat("")
                      .outerTickSize(0);
        return grid;
    };
    /**
    *   @function: createGridGroup
    *   @param {String} svg - d3 svg object.
    *   @param {String} x_translate - The x translation for the axis.
    *   @param {String} y_translate - The y translation for the axis.
    *   @returns {Object} d3 group object.
    *   @description: It creates a d3 group to place the grid and set its id, class and translation.
    */
    var createGridGroup = function(svg,x_translate,y_translate){
        var group = svg.append("g")
                       .attr({
                            "id": "xaxis_grid",
                            "class": "x grid",
                            "transform":"translate(" + x_translate + "," + y_translate + ")"
                        });
        return group;
    };
    /**
    *   @function: setGridCSS
    *   @param {String} options - An object of valid chart configurations.
    *   @description: It sets the color and opacity of the grid lines.
    */
    var setGridCSS = function(options) {
        d3.selectAll("#"+ options.selector + "_svg_group .x.grid line")
          .style({
            "stroke" : options.gridColor,
            "opacity" : options.gridOpacity/100
          });
    };
    /**
    *   @function: intervalGranularity
    *   @param {String} granularity - An object of valid chart configurations.
    *   @returns {Object} An object that has the d3 time property and other property as format.
    *   @description: It retruns an object that has d3.time and format properties.
    */
    var intervalGranularity = function(granularity) {
        switch(granularity) {
            case "second":
                return {
                    d3Time:d3.time.second,
                    format:"%S"
                };
            case "minute":
                return {
                    d3Time:d3.time.minute,
                    format:"%M"
                };
            case "hour":
                return {
                    d3Time:d3.time.hour,
                    format:"%H"
                };
            case "day":
                return {
                    d3Time:d3.time.day,
                    format:"%d"
                };
            case "month":
                return {
                    d3Time:d3.time.month,
                    format:"%b"
                };
            case "year":
                return {
                    d3Time:d3.time.year,
                    format:"%Y"
                };
            default:
                return {
                    d3Time: null,
                    format: null
                };
        }
    };

    return {
        scale: scale,
        createAxisGroup: createAxisGroup,
        axis: axis,
        setCSSConfigs: setCSSConfigs,
        validateTickValues: validateTickValues,
        createGrid: createGrid,
        createGridGroup: createGridGroup,
        setGridCSS: setGridCSS,
        intervalGranularity:intervalGranularity
    };
}());
