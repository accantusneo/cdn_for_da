/**
@author Pykih developers
@module svgFunctions
@namespace TimeSeries
*/
TimeSeries.svgRendererFunctions = (function() {
    /**
    @Function: createSVG
    @description: createSVG for rendering the SVG element on DOM.
    */
    var createSVG = function(options) {
        var svg = d3.select("#"+options.selector)
            .append("svg")
            .attr({
                width: options.width,
                height: options.height,
                id: options.selector + "_svg",
                "data-width": options.width,
                "data-height": options.height,
                "preserveAspectRatio": "none",
                "viewBox": "0 0 " + options.width + " " + options.height
            })
            .style({
                "display": "block", // Mandatory to avoid empty space below the svg.
                "background-color": options.bgColor,
                // "border-radius": "5px"
            });
        return svg;
    };

    var createGroup = function(options,svg,x_translate,y_translate,id) {
        var group = svg.append("g")
           .attr({
                "id": id,
                "transform":"translate(" + x_translate + "," + y_translate + ")"
            });
        return group;
    };

    var checkIfDimensionInPecentage = function(options,dimension) {
        var isPecentage =  options[dimension] ? false : true,
            index = options[dimension] && (typeof options[dimension]) !== "number" ? options[dimension].indexOf("%") : -1;

        if(index !== -1) {
            options[dimension] = options[dimension].substring(0,index);
            isPecentage = true;
        }

        return isPecentage;
    };

    var calculateSVGDimensions = function(options, dimension) {
        var getParentElement = document.getElementById(options.selector),
            chart_configs = TimeSeries.chart_configs[options.selector],
            getParentBoundingRect/* = getParentElement.getBoundingClientRect()[dimension]*/,
            getParentElementDimension = getParentElement.style[dimension],
            parent_element_dimension,
            get_computed_style = window.getComputedStyle(getParentElement, null),
            padding,
            diff;

            switch(dimension) {
                case "width":
                    padding = parseFloat(get_computed_style.getPropertyValue("padding-left")) + parseFloat(get_computed_style.getPropertyValue("padding-right"));
                    getParentBoundingRect = getParentElement.clientWidth;
                break;
                case "height":
                    padding = parseFloat(get_computed_style.getPropertyValue("padding-top")) + parseFloat(get_computed_style.getPropertyValue("padding-bottom"));
                    getParentBoundingRect = getParentElement.clientHeight;
                break;
                default:
                    padding = 0;
            }

        parent_element_dimension = getParentElementDimension || getParentBoundingRect;
        diff = getParentBoundingRect - padding;

        if(dimension === "width" && !parent_element_dimension) {
            getParentElement.style[dimension] = "100%";
            getParentBoundingRect = getParentElement.clientWidth;
        } else if(dimension === "height" && !diff) {
            errorHandling("For Chart Selector '" + options.selector + "': Please provide the height to the parent container of the svg or specify the height of the svg in px");
            return false;
        }

        return (getParentBoundingRect * (parseFloat(options[dimension])/100)) - padding;
    };

    TimeSeries.mediator.subscribe("createSVG",createSVG);
    TimeSeries.mediator.subscribe("createGroup",createGroup);
    TimeSeries.mediator.subscribe("calculateSVGDimensions",calculateSVGDimensions);
    TimeSeries.mediator.subscribe("checkIfDimensionInPecentage",checkIfDimensionInPecentage);

    return {
        createSVG: createSVG,
        createGroup: createGroup
    };
}());
