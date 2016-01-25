/**
@author Pykih developers
@module captionSubCaption
@namespace TimeSeries
**/
TimeSeries.captionSubCaption = (function(){
    var caption = function (options,svg) {
        if (options.showCaption && options.caption.length > 0) {
            var chart_configs = TimeSeries.chart_configs[options.selector],
                left,
                top = chart_configs.previousGroupsHeight + options.captionFontSize + 4,
                group,
                attr_object = {
                    "font-size" : options.captionFontSize,
                    "font-family" : options.captionFontFamily,
                    "font-weight" : options.captionFontWeight,
                    "fill" : options.captionFontColor,
                    "font-style" : options.captionFontStyle
                };
            if (options.captionAlign === "center") {
                left = options.width / 2;
                attr_object["text-anchor"] = "middle";
            } else if (options.captionAlign === "left") {
                left = (options.marginLeft + options.captionMargin);
            }
            group = TimeSeries.mediator.publish("createGroup",options, svg, left, top, (options.selector + "_svg_caption_group")); //Group to place the caption
            group.append("text")
                .attr(attr_object)
                .text(null)
                    .append("tspan")
                    .text(options.caption);
            chart_configs.previousGroupsHeight += document.getElementById(options.selector + "_svg_caption_group").getBoundingClientRect().height + 4;
        } else {
            options.showCaption = false;
        }
    };
    var subCaption = function (options,svg) {
        if (options.showSubCaption && options.subCaption.length > 0) {
            var chart_configs = TimeSeries.chart_configs[options.selector],
                left,
                top = chart_configs.previousGroupsHeight + options.subCaptionFontSize + 1,
                group,
                attr_object = {
                    "font-size" : options.subCaptionFontSize,
                    "fill" : options.subCaptionFontColor,
                    "font-family" : options.subCaptionFontFamily,
                    "font-weight" : options.subCaptionFontWeight,
                    "font-style" : options.subCaptionFontStyle
                };
            if (options.captionAlign === "center") {
                left = options.width / 2;
                attr_object["text-anchor"] = "middle";
            } else if (options.captionAlign === "left") {
                left = (options.marginLeft + options.captionMargin);
            }
            group = TimeSeries.mediator.publish("createGroup",options, svg, left, top, (options.selector + "_svg_sub_caption_group")); //Group to place the sub caption
            if (options.subCaption.length * 5 < options.width - 160) {
                group.append("text")
                    .attr(attr_object)
                    .text(null)
                        .append("tspan")
                        .text(options.subCaption);
            } else {
                group.append("text")
                    .attr(attr_object)
                    .text(null)
                        .append("tspan")
                        .text(options.subCaption.slice(0,(options.width - 160) / 6) + "...");
                svg.append("svg:image")
                    .attr({
                        'x': options.width - 190,
                        'y': top - options.subCaptionFontSize + 3,
                        'width': 10,
                        'height': 10,
                        "xlink:href": "../../src/img/info.png",
                        "id": options.selector + "_sub_caption_info"
                    })
                    .style({
                        cursor: "pointer"
                    })
                    .on("mouseover",function(d) {
                        var mouseX = d3.event.pageX - 100,
                            mouseY = d3.event.pageY + 10,
                            tooltip_text = "<div style='font-size:11px;'>" + options.subCaption + "</div>";
                        TimeSeries.mediator.publish("renderTooltipContent", options.selector + "_tooltip", tooltip_text);
                        d3.select("#" + options.selector + "_tooltip").style({
                            "top": mouseY  + "px",
                            "left": mouseX  + "px",
                            "width": "200px"
                        });
                        d3.select("#" + options.selector + "_tooltip").style('display', "block");
                    })
                    .on("mouseout",function(d) {
                        d3.select("#" + options.selector + "_tooltip").style('display', "none");
                    });
            }
            chart_configs.previousGroupsHeight += document.getElementById(options.selector + "_svg_sub_caption_group").getBoundingClientRect().height + 6;
        } else {
            options.showSubCaption = false;
        }
    };

    var createMarker = function(selector, color) {
        var options = TimeSeries.chart_options[selector],
            chart_configs = TimeSeries.chart_configs[selector],
            svg = chart_configs.svg,
            // svg1 = document.getElementById("#" + selector + "_svg"),
            group = TimeSeries.mediator.publish("createGroup",options, svg, 0, 0, (selector + "_marker")),
            // height = options.subCaptionFontSize + options.captionFontSize - 4;
            height = options.captionFontSize,
            impact_switch_image = document.createElement("img"),
            selector_dom = document.getElementById(selector);

        // impact_switch_image.src = "../../src/img/impactSwitchOn.png";
        // impact_switch_image.className = "impactSwitchContainer";
        // impact_switch_image.id = options.selector + "_impact_switch";
        // selector_dom.insertBefore(impact_switch_image, selector_dom.firstChild);
        // impact_switch_image.addEventListener("click", function () {
        //     TimeSeries.mediator.publish("switchImpacts", selector);
        // });
    };

    var xAxisTitle = function (selector, range) {
        var options = TimeSeries.chart_options[selector],
        chart_configs = TimeSeries.chart_configs[selector],
        group, x_axis_height, x_title_range;

        group = d3.select("#" + options.selector + "_svg_group");
        x_axis_height = document.querySelector("#" + options.selector + "_svg_group #xaxis").getBoundingClientRect().height;
        x_title_range = TimeSeries.mediator.publish("createGroup",options, group, (chart_configs.width / 2), (chart_configs.height + x_axis_height + options.xAxisTitleFontSize), "xaxis_title_range");

        if (options.showXAxisRange) {
            var x_axis_range = TimeSeries.mediator.publish("createGroup",options, x_title_range, 0, 0, "xaxis_range"),
                dateFormat = TimeSeries.dateFormatFunctions.dateFormatter;

            x_axis_range.append("text")
            .attr({
                "fill" : options.xAxisRangeFontColor,
                "font-family" : options.xAxisRangeFontFamily,
                "font-weight" : options.xAxisRangeFontWeight,
                "fill-opacity" : options.xAxisRangeOpacity/100,
                "align" : "center",
                "text-anchor" : "middle"
            })
            .style({
                "font-size" : options.xAxisRangeFontSize
            })
            .text(dateFormat(options.outputDateFormat, new Date(range[0])) + "  -  "  +  dateFormat(options.outputDateFormat, new Date(range[1])));
        }

        if (options.showXAxis && options.xAxisTitle) {
            var x_range =  document.querySelector("#" + options.selector + "_svg_group #xaxis_title_range"),
                x_range_height = x_range ? x_range.getBoundingClientRect().height + 5: 0,
                x_title = TimeSeries.mediator.publish("createGroup",options, x_title_range, 0, x_range_height, "xaxis_title");

            x_title.append("text")
            .attr({
                "fill" : options.xAxisTitleFontColor,
                "font-family" : options.xAxisTitleFontFamily,
                "font-weight" : options.xAxisTitleFontWeight,
                "fill-opacity" : options.xAxisTitleOpacity/100,
                "align" : "center",
                "text-anchor" : "middle"
            })
            .style({
                "font-size" : options.xAxisTitleFontSize
            })
            .text(options.xAxisTitle);
        }

    };

    var updateXAxisRange = function(options, range) {
        if (options.showXAxisRange) {
            var x_axis_range = d3.select("#" + options.selector + "_svg_group #xaxis_range text"),
            dateFormat = TimeSeries.dateFormatFunctions.dateFormatter;

            x_axis_range.text(dateFormat(options.outputDateFormat, new Date(range[0])) + "  -  "  +  dateFormat(options.outputDateFormat, new Date(range[1])));
        }
    };

    var yAxisTitle = function (selector) {
        var options = TimeSeries.chart_options[selector],
            chart_configs = TimeSeries.chart_configs[selector];

        if (options.showYAxis && options.yAxisTitle && !document.querySelector("#" + options.selector + "_svg_group #" + "yaxis_title")) {

            var group = d3.select("#" + options.selector + "_svg_group"),
                y_axis_width = document.querySelector("#" + options.selector + "_svg_group #yaxis").getBoundingClientRect().width,
                y_axis_height = document.querySelector("#" + options.selector + "_svg_group #yaxis").getBoundingClientRect().height,
                y_title = TimeSeries.mediator.publish("createGroup",options, group, 0, 0, "yaxis_title");
            y_title.attr({
                "transform" : "translate(" + (- y_axis_width - options.yAxisTitleFontSize) + "," + y_axis_height / 2 + ")" + "rotate(270)"
            });
            y_title.append("text")
            .attr({
                "fill" : options.yAxisTitleFontColor,
                "font-family" : options.yAxisTitleFontFamily,
                "font-weight" : options.yAxisTitleFontWeight,
                "fill-opacity" : options.yAxisTitleOpacity/100,
                "align" : "center",
                "text-anchor" : "middle"
            })
            .style({
                "font-size" : options.yAxisTitleFontSize
            })
            .text(options.yAxisTitle);
        }
    };

    var liveDataStatus = function (selector,text) {
        if (!TimeSeries.chart_options[selector].enableLiveData || TimeSeries.chart_status[selector].status !== "completed") {
            return;
        }
        var live_data_status = document.querySelector("#" + selector + "_live_data_status"),
            options = TimeSeries.chart_options[selector],
            chart_configs = TimeSeries.chart_configs[selector];
        if (!live_data_status) {
            var group = d3.select("#" + options.selector + "_svg_group"),
                previous_height = 0;
            if (document.querySelector("#" + options.selector + "_svg_group #xaxis")) {
                previous_height += document.querySelector("#" + options.selector + "_svg_group #xaxis").getBoundingClientRect().height;
            } else {
                previous_height += 15;
            }
            if (document.querySelector("#" + options.selector + "_svg_group #" + "xaxis_title")) {
                previous_height += document.querySelector("#" + options.selector + "_svg_group #" + "xaxis_title").getBoundingClientRect().height;
            } else {
                previous_height += 15;
            }
            live_data_status = TimeSeries.mediator.publish("createGroup",options, group, (chart_configs.width - 50), (chart_configs.height + previous_height), "live_data_status");
            live_data_status.append("text")
            .attr({
                "id" : options.selector + "_live_data_status",
                "fill" : options.liveDataStatusFontColor,
                "font-family" : options.liveDataStatusFontFamily,
                // "font-weight" : options.liveDataStatusFontWeight,
                "fill-opacity" : options.liveDataStatusOpacity/100,
                "align" : "center",
                "text-anchor" : "middle"
            })
            .style({
                "font-size" : options.liveDataStatusFontSize
            })
            .text("");
        } else {
            if (document.querySelector("#" + selector + "_live_data_status").innerHTML !== text && document.querySelector("#" + selector + "_live_data_status").innerHTML !== " " + text) {
                document.querySelector("#" + selector + "_live_data_status").innerHTML = text;
            }
        }
    };

    var createGrowthViewsGroup = function (options,svg) {
        if (options.enableGrowthViews) {
            var chart_configs = TimeSeries.chart_configs[options.selector],
                // left = document.getElementById(options.selector + "_svg").getBoundingClientRect().right - 200,
                left = options.width - 35 - 140,
                top = chart_configs.previousGroupsHeight,// - document.getElementById(options.selector + "_svg_caption_group").getBoundingClientRect().height + options.captionFontSize + 8,
                group;

            if (options.showCaption) {
                top -= document.getElementById(options.selector + "_svg_caption_group").getBoundingClientRect().height + 5;
            }
            if (options.showSubCaption) {
                // top -= options.subCaptionFontSize;
            }

            group = TimeSeries.mediator.publish("createGroup",options, svg, left, top, (options.selector + "_chart_growth_group"));

            d3.select("#" + options.selector + "_chart_growth_group")
                .append("text")
                .attr({
                    "id": options.selector + "_growth_point_data_value",
                    x: 0,
                    y: 0,
                    "font-size" : options.captionFontSize,
                    "font-family" : options.captionFontFamily,
                    "font-weight" : options.captionFontWeight,
                    "fill" : options.captionFontColor,
                    "font-style" : options.captionFontStyle
                })
                .style({
                    "visibility": "hidden"
                })
                .text("Data Point");
            d3.select("#" + options.selector + "_chart_growth_group")
                .append("text")
                .attr({
                    "id": options.selector + "_growth_point_change_value",
                    x: 65,
                    y: 0,
                    "font-size" : options.captionFontSize,
                    "font-family" : options.captionFontFamily,
                    "font-weight" : options.captionFontWeight,
                    "fill" : options.captionFontColor,
                    "font-style" : options.captionFontStyle
                })
                .style({
                    "visibility": "hidden"
                })
                .text("Data Point");
            d3.select("#" + options.selector + "_chart_growth_group")
                .append("text")
                .attr({
                    "id": options.selector + "_growth_point_data_label",
                    x: 0,
                    y: 14,
                    "font-size" : options.subCaptionFontSize,
                    "fill" : options.subCaptionFontColor,
                    "font-family" : options.subCaptionFontFamily,
                    "font-weight" : options.subCaptionFontWeight,
                    "font-style" : options.subCaptionFontStyle
                })
                .style({
                    "visibility": "hidden"
                })
                .text("Growth Point");
            d3.select("#" + options.selector + "_chart_growth_group")
                .append("text")
                .attr({
                    "id": options.selector + "_growth_point_change_label",
                    x: 65,
                    y: 14,
                    "font-size" : options.subCaptionFontSize,
                    "fill" : options.subCaptionFontColor,
                    "font-family" : options.subCaptionFontFamily,
                    "font-weight" : options.subCaptionFontWeight,
                    "font-style" : options.subCaptionFontStyle
                })
                .style({
                    "visibility": "hidden"
                })
                .text("Growth Point");

            if (!options.showCaption) {
                chart_configs.previousGroupsHeight += document.getElementById(options.selector + "_growth_point_data_value").getBoundingClientRect().height + 4;
            }
            if (!options.showSubCaption) {
                chart_configs.previousGroupsHeight += document.getElementById(options.selector + "_growth_point_data_label").getBoundingClientRect().height + 6;
            }

            d3.select("#" + options.selector + "_svg")
                .append("line")
                .attr({
                    'id': "header_bottom_border",
                    "x1": 0,
                    "y1": chart_configs.previousGroupsHeight,
                    "x2": options.width,
                    "y2": chart_configs.previousGroupsHeight,
                })
                .style({
                    "stroke": "lightgrey",
                    "stroke-width": "0.5px"
                });
            d3.select("#" + options.selector + "_svg")
                .append("line")
                .attr({
                    'id': options.selector + "_vertical_line",
                    "x1": options.width - chart_configs.previousGroupsHeight,
                    "y1": 0,
                    "x2": options.width - chart_configs.previousGroupsHeight,
                    "y2": chart_configs.previousGroupsHeight,
                })
                .style({
                    "stroke": "lightgrey",
                    "stroke-width": "0.5px"
                });
        }
    };

    TimeSeries.mediator.subscribe("addCaption",caption);
    TimeSeries.mediator.subscribe("addSubCaption",subCaption);
    TimeSeries.mediator.subscribe("createMarker",createMarker);
    TimeSeries.mediator.subscribe("xAxisTitle",xAxisTitle);
    TimeSeries.mediator.subscribe("yAxisTitle",yAxisTitle);
    TimeSeries.mediator.subscribe("liveDataStatus",liveDataStatus);
    TimeSeries.mediator.subscribe("updateXAxisRange",updateXAxisRange);
    TimeSeries.mediator.subscribe("createGrowthViewsGroup",createGrowthViewsGroup);

    return {
        addCaption: caption,
        addSubCaption: subCaption
    };
})();
