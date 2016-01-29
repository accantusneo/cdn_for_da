/**
@author Pykih developers
@module lineChartFunctions
@namespace TimeSeries
*/

TimeSeries.crosshair = (function() {
    var createTooltip = function(options,id) {
        if(!document.getElementById(id)) {
            d3.select("body")
                .append("div")
                .attr({
                    "id" : id,
                    "class" : "comcharts-TS-tooltip_div"
                })
                .style({
                    "border-width": options.tooltipBorderBodyWidth,
                    "border-radius": options.tooltipBorderBodyRadius,
                    "border-style": options.tooltipBorderBodyStyle,
                    "border-color": options.tooltipBorderBodyColor,

                    "background-color": options.tooltipBgBodyColor,
                    "opacity": options.tooltipBgBodyOpacity/100,

                    "font-size": options.tooltipBodyFontSize,
                    "font-family": options.tooltipBodyFontFamily,
                    "font-weight": options.tooltipBodyFontWeight,
                    "color": options.tooltipBodyFontColor,
                    "z-index": 1000,
                    "display":options.tooltipBodyDisplay
                });
        }
    };

    var toolTipPosition = function (tooltip,top,left) {
        tooltip.style({
            "top" : top + "px",
            "left" : left + "px"
        });
    };

    var renderTooltipContent = function(id,tooltip_content) {
        d3.select("#" + id)
            .html(tooltip_content);
    };

    var tooltipText = function(options, data, data_index, selected_raw_data){
        var tooltip_text = '';
        tooltip_text += tooltipTextBody(options, data, data_index, selected_raw_data);
        return tooltip_text;
    };

    TimeSeries.mediator.subscribe("createTooltip", createTooltip);
    TimeSeries.mediator.subscribe("renderTooltipContent", renderTooltipContent);
    TimeSeries.mediator.subscribe("toolTipPosition", toolTipPosition);
    TimeSeries.mediator.subscribe("tooltipText", tooltipText);

    return {
        createTooltip: createTooltip
    };
}());