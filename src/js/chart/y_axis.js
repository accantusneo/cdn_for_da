/**
@author Pykih developers
@module Y axis functionality module
@namespace TimeSeries
*/
TimeSeries.yAxisFunctions = (function() {
    /**
    *   @function: axis
    *   @param {String} options - An object of valid chart configurations.
    *   @param {String} scale - Axis scale.
    *   @returns {Function} A d3 axis functions.
    *   @description: It creates a d3 axis.
    */
    var axis = function(options,scale) {
        var tickValues = validateTickValues(options.selector, options.yAxisTickValues),
            tickFormat = options.yAxisTickFormat,
            chart_configs = TimeSeries.chart_configs[options.selector],
            configYAxisTickValuesFormat = chart_configs.yAxisTickValuesFormat,
            numberFormatter = TimeSeries.numberFormatFunctions.numberFormatter;
            if (configYAxisTickValuesFormat) {
                tickFormat = function(d) {
                    if (chart_configs.numbersuffix) {
                        return numberFormatter(configYAxisTickValuesFormat,d) + chart_configs.numbersuffix;
                    } else {
                        return numberFormatter(configYAxisTickValuesFormat,d);
                    }
                };
            } else if (tickFormat && tickFormat.constructor === Function) {
            } else if(tickFormat === "smartDefault" || tickFormat === undefined){
                tickFormat = null;
            } else {
                tickFormat = function(d) {
                    return numberFormatter(options.yAxisTickFormat,d);
                };
            }
        return d3.svg.axis()
                .scale(scale)
                .orient(options.yAxisPosition)
                .ticks(options.yAxisNoOfTicks)
                .tickSize(options.yAxisTickSize)
                .tickFormat(tickFormat)
                .tickValues(tickValues)
                .outerTickSize(options.yAxisOuterTickSize);

    };
    var createAxisGroup = function(options,svg,x_translate,y_translate){
        var group = svg.append("g")
                       .attr({
                            "id": "yaxis",
                            "class": "y axis",
                            "transform":"translate(" + x_translate + "," + y_translate + ")"
                        });
        return group;
    };
    /**
    *   @function: containerHtmlString
    *   @param {String} domain - An array of minimum and maximum domain values.
    *   @param {String} range - An array of minimum and maximum range values.
    *   @returns {Function} A d3 scale function.
    *   @description: It generates the d3 y-axis scale.
    */
    var scale = function(domain,range) {
		return d3.scale.linear()
				.domain(domain)
    			.range(range);
	};
    /**
    *   @function: setCSSConfigs
    *   @param {String} options - An object of valid chart configurations.
    *   @description: It sets the font-size, style, family and color of tick values.
    *   It also sets the color and width of the axis line and the color of the ticks.
    */
    var setCSSConfigs = function(options) {
        //Tick labels
        d3.selectAll("#"+ options.selector + "_svg_group" + " .y.axis text")
            .style({
                "font-size" : options.yAxisTickValueSize + "px",
                "font-weight" : options.yAxisTickValueStyle,
                "font-family" : options.yAxisTickValueFontFamily,
                "fill" : options.yAxisTickValueColor
            });
        //Line
        d3.selectAll("#"+ options.selector + " .y.axis path")
          .style({
            "stroke" : options.yAxisLineColor,
            "stroke-width" : options.yAxisLineThickness + "px",
            "opacity": options.yAxisLineOpacity
          });
        //Ticks
        d3.selectAll("#"+ options.selector + " .y.axis line")
          .style({
            "stroke" : options.yAxisTickColor,
            "opacity": options.yAxisTickOpacity,
            "stroke-width": options.yAxisTickThickness
          });
    };
    /**
    *   @function: validateTickValues
    *   @param {String} array - An array tick values.
    *   @returns {Array} An array with validated tick values or null.
    *   @description: It validates the tick values array passed by the user.
    */
    var validateTickValues = function (selector, array) {
        if (array && array.constructor === Function) {
            return array;
        } else if(array === "smartDefault" || array === undefined || array.length === 0){
            return null;
        }
        var i,
            modified_array = [],
            length = array.length;

        for(i=0;i<length;i++) {
            if(TimeSeries.validation.dataTypes(array[i],"number")) {
                modified_array.push(array[i]);
            } else {
                warningHandling(TimeSeries.errors.invalidConfig("yAxisTickValue: "+array[i],selector));
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
            tickValues = validateTickValues(selector, options.yAxisTickValues);
        var grid = d3.svg.axis()
                      .scale(scale)
                      .orient(options.yAxisPosition)
                      .ticks(options.yAxisNoOfTicks)
                      .tickSize(-chart_configs.width)
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
                            "id": "yaxis_grid",
                            "class": "y grid",
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
        d3.selectAll("#"+ options.selector + "_svg_group .y.grid line")
          .style({
            "stroke" : options.gridColor,
            "opacity" : options.gridOpacity / 100
          });
    };

    return {
        scale: scale,
        createAxisGroup: createAxisGroup,
        axis: axis,
        setCSSConfigs: setCSSConfigs,
        validateTickValues: validateTickValues,
        createGrid: createGrid,
        createGridGroup: createGridGroup,
        setGridCSS: setGridCSS
    };
}());
