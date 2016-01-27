module('chart configuration testing ',{
    beforeEach: function() {
        this.validate = TimeSeries.chartConfigValidation.validate;
    }
});
test('should return default value of all chart config.', function() {
    var ip_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"]
    };
    var method_op = this.validate(ip_config,TimeSeries.mandatory_configs);
        method_op = this.validate(method_op, TimeSeries.default.chart_features);
        method_op = this.validate(method_op, TimeSeries.default.chart_options);

    equal(method_op.yAxisTickSize, 5, 'yAxisTickSize value proper.');

    deepEqual(method_op.yAxisTickMargin, [0,0], 'yAxisTickMargin value proper.');

    equal(method_op.yAxisTickValueSize, 11, 'yAxisTickValueSize value proper.');
});

test('should log proper warning messages for incorrect parameters type.', function() {
    var ip_config,method_op;
    ip_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "xAxisLineThickness": "sample"
    };
    method_op = this.validate(ip_config,TimeSeries.mandatory_configs);
    method_op = this.validate(method_op, TimeSeries.default.chart_features);
    method_op = this.validate(method_op, TimeSeries.default.chart_options);
    deepEqual(method_op.xAxisLineThickness, 1, 'xAxisLineThickness warning given and default value taken.');

    ip_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "xAxisTickValues": {}
    };
    method_op = this.validate(ip_config,TimeSeries.mandatory_configs);
    method_op = this.validate(method_op, TimeSeries.default.chart_features);
    method_op = this.validate(method_op, TimeSeries.default.chart_options);
    deepEqual(method_op.xAxisTickValues, "smartDefault", 'xAxisTickValues warning given and default value taken.');

    ip_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "xAxisTimeChangeInParentGranularity": 12
    };
    method_op = this.validate(ip_config,TimeSeries.mandatory_configs);
    method_op = this.validate(method_op, TimeSeries.default.chart_features);
    method_op = this.validate(method_op, TimeSeries.default.chart_options);
    deepEqual(method_op.xAxisTimeChangeInParentGranularity, false, 'xAxisTimeChangeInParentGranularity  warning given and default value taken.');


    ip_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "yAxisTitlePosition": "sample"
    };
    method_op = this.validate(ip_config,TimeSeries.mandatory_configs);
    method_op = this.validate(method_op, TimeSeries.default.chart_features);
    method_op = this.validate(method_op, TimeSeries.default.chart_options);
    deepEqual(method_op.yAxisTitlePosition, "center", 'yAxisTitlePosition  warning given and default value taken.');
});

test('validating line chart configs',function() {
    var config,
        op_config;

    config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "showCaption":true,
        "showSubCaption": true,
        "bgColor": "red",
        "chartType": "line",
        "lineThickness": "3px" ,
        "caption": 222,
        "captionFontSize": 0,
        "captionFontColor": "red",
        "captionFontWeight": "xyz",
        "captionFontFamily": "Arial",
        "subCaption": "",
        "subCaptionFontSize": "20",
        "subCaptionFontColor": 20,
        "subCaptionFontWeight": 5,
        "subCaptionFontFamily": 20,
        "showCrosshair": "y",
        "showToolTip": "n",
        "enableZoom": false,
        "showXAxisGridLine": true,
        "showYAxisGridLine": false,
        "gridColor": false,
        "marginLeft": "test",
        "marginTop": "fail"
    };
    op_config = this.validate(config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.bgColor,"red","Value of 'bgColor' is valid");
    equal(op_config.lineThickness,1.5,"Invalid value for 'lineThickness'. It should be a number");
    equal(op_config.caption,"","Invalid value for 'caption'. It should be a string");
    equal(op_config.captionFontSize,0,"Value of 'captionFontSize' is valid");
    equal(op_config.captionFontColor,"red","Value of 'captionFontColor' is valid");
    equal(op_config.captionFontWeight,"normal","The value of 'captionFontWeight' is invalid. It should be one of the following values [normal,bold]");
    equal(op_config.captionFontFamily,"Arial","Value of 'captionFontFamily' is valid");
    equal(op_config.subCaption,"","Value of 'subCaption' is valid");
    equal(op_config.subCaptionFontSize,"20","Value of 'subCaptionFontSize' is valid");
    equal(op_config.subCaptionFontColor,"#1D1D1D","Invalid value for 'subCaptionFontColor'. It should be a string");
    equal(op_config.subCaptionFontWeight,"normal","The value of 'subCaptionFontWeight' is invalid. It should be one of the following values [normal,bold]");
    equal(op_config.subCaptionFontFamily,"'Helvetica Neue',Helvetica,Arial,sans-serif","Invalid value for 'subCaptionFontFamily'. It should be a string");
    equal(op_config.showCrosshair,true,"Invalid value for 'showCrosshair'. It should be either true or false");
    equal(op_config.showToolTip,true,"Invalid value for 'showToolTip'. It should be either true or false");
    equal(op_config.enableZoom,false,"Value of 'enableZoom' is valid");
    equal(op_config.showXAxisGridLine,true,"Value of 'showXAxisGridLine' is valid");
    equal(op_config.showYAxisGridLine,false,"Value of 'showYAxisGridLine' is valid");
    equal(op_config.gridColor,"#1D1D1D","Invalid value for 'gridColor'. It should be a string");
    equal(op_config.marginTop,20,"Invalid value for 'marginTop'. It should be a number");
    equal(op_config.marginLeft,50,"Invalid value for 'marginLeft'. It should be a number");
});

test("line config validation",function(){
    var input_config = {
            "selector": "TestingConfiguration",
            "height" : 500,
            "width" : 700,
            "dateColumnName" : "x",
            "metricsColumnName" : ["India","China","Japan"],
            "chartType": "line",
            lineDashed: "true",
            lineDashLen: "3",
            lineDashGap: "5",
            lineOpacity: "true"
        },
        op_config;

    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.lineDashed, false, "Invalid value for 'lineDashed'. It should be a boolean value");
    equal(op_config.lineDashLen, "3", "Invalid value for 'lineDashLen'. It should be a number");
    equal(op_config.lineDashGap, "5", "Invalid value for 'lineDashGap'. It should be a number");
    equal(op_config.lineOpacity, 100, "Invalid value for 'lineDashGap'. It should be a number");

    input_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "chartType": "line",
        lineDashed: true,
        lineDashLen: 3,
        lineDashGap: 5,
        lineOpacity: 60
    };
    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.lineDashed, true, "Valid value for 'lineDashed'");
    equal(op_config.lineDashLen, 3, "Valid value for 'lineDashed'. It should be a boolean value");
    equal(op_config.lineDashGap, 5, "Valid value for 'lineDashed'. It should be a boolean value");
    equal(op_config.lineOpacity, 60, "Invalid value for 'lineDashGap'. It should be a number");
});

// test("Crosshair config validation",function() {
//     var input_config = {
//         showCrosshair
//     }
// })

test("crosshair and tooltip config validation",function(){
    var input_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "chartType": "line",
        "toolTipBorderColor": 10,
        "toolTipBgColor": 20,
        "toolTipBgOpacity": "heloo",
        "numberprefix": 0,
        "numbersuffix": 1,
        "crossHairBorderColor": 10,
        "crossHairBgColor": 1,
        "crossHairBgOpacity": "h",
        "crossHairTextFamily": 1,
        "crossHairTextColor": true,
        "crossHairTextThickness": "norma"
        },
        op_config;

    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.toolTipBorderColor, "#CCCCCC", "Invalid value for 'toolTipBorderColor'. It should be a valid color");
    equal(op_config.toolTipBgColor, "#fff", "Invalid value for 'toolTipBgColor'. It should be a valid color");
    equal(op_config.toolTipBgOpacity, 95, "Invalid value for 'toolTipBgOpacity'. It should be a number");
    equal(op_config.numberprefix, "", "Invalid value for 'numberprefix'. It should be a string");
    equal(op_config.numbersuffix, "", "Invalid value for 'numbersuffix'. It should be a string");
    equal(op_config.crossHairBorderColor, "#CCCCCC", "Invalid value for 'crossHairBorderColor'. It should be a number");
    equal(op_config.crossHairBgColor, "#4c4c4c", "Invalid value for 'crossHairBgColor'. It should be a color");
    equal(op_config.crossHairBgOpacity, 100, "Invalid value for 'crossHairBgOpacity'. It should be a number");
    equal(op_config.crossHairTextFamily,"'Helvetica Neue',Helvetica,Arial,sans-serif" , "Invalid value for 'crossHairTextFamily'. It should be a valid font family");
    equal(op_config.crossHairTextColor, "white", "Invalid value for 'crossHairTextColor'. It should be a number");
    equal(op_config.crossHairTextThickness, "bold", "Invalid value for 'crossHairTextThickness'. It should be either bold or normal");


    input_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "chartType": "line",
        "toolTipBorderColor": "red",
        "toolTipBgColor": "green",
        "toolTipBgOpacity": 20,
        "numberprefix": "$",
        "numbersuffix": "k",
        "crossHairBorderColor": "red",
        "crossHairBgColor": "yellow",
        "crossHairBgOpacity": 50,
        "crossHairTextFamily": "forte",
        "crossHairTextColor": "green",
        "crossHairTextThickness": "normal",
        "crossHairBorderColor": "red",
        "crossHairBgColor": "yellow",
        "crossHairBgOpacity": 50,
        "crossHairTextFamily": "forte",
        "crossHairTextColor": "green",
        "crossHairTextThickness": "normal",

    };

    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.toolTipBorderColor, "red", "Valid value for 'toolTipBorderColor'.");
    equal(op_config.toolTipBgColor, "green", "Valid value for 'toolTipBgColor'.");
    equal(op_config.toolTipBgOpacity, 20, "Valid value for 'toolTipBgOpacity'.");
    equal(op_config.numberprefix, "$", "Valid value for 'numberprefix'.");
    equal(op_config.numbersuffix, "k", "Valid value for 'numbersuffix'.");
    equal(op_config.crossHairBorderColor, "red", "Valid value for 'crossHairBorderColor'.");
    equal(op_config.crossHairBgColor, "yellow", "Valid value for 'crossHairBgColor'.");
    equal(op_config.crossHairBgOpacity, 50, "Invalid value for 'crossHairBgOpacity'.");
    equal(op_config.crossHairTextFamily,"forte" , "Valid value for 'crossHairTextFamily'.");
    equal(op_config.crossHairTextColor, "green", "Valid value for 'crossHairTextColor'.");
    equal(op_config.crossHairTextThickness, "normal", "Valid value for 'crossHairTextThickness'.");
});

test('Legends configuration validation',function(){
    var input_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "chartType": "line",
        "showLegends": 1,
        "legendPosition": true,
        "legendItemFontWeight": false,
        "legendItemFont": 40,
        "legendItemFontSize": "fontsize",
        "legendItemFontColor": 0,
        "legendItemHiddenColor": true,
        "legendBorderThickness" : "thickness",
        "legendBorderColor" : 3,
        "legendBorderOpacity" : true,
        "legendBgColor" : 20,
        "legendBgOpacity" : "opacity",
    },
    op_config;
    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.showLegends, true, "Invalid value for 'showLegends'. It should be a either true or false");
    equal(op_config.legendPosition, "bottom", "Invalid value for 'legendPosition'. It should be a either right or bottom");
    equal(op_config.legendItemFontWeight, "normal", "Invalid value for 'legendItemFontWeight'. It should be either bold or normal");
    equal(op_config.legendItemFontFamily,"Arial" , "Invalid value for 'legendItemFontFamily'. It should be a valid font family");
    equal(op_config.legendItemFontSize,11 , "Invalid value for 'legendItemFontSize'. It should be a valid number");
    equal(op_config.legendItemFontColor,"#1D1D1D" , "Invalid value for 'legendItemFontColor'. It should be a valid color");
    equal(op_config.legendItemHoverFontColor,"#000000" , "Invalid value for 'legendItemHoverFontColor'. It should be a valid color");
    equal(op_config.legendItemHiddenColor,"#CCC" , "Invalid value for 'legendItemHiddenColor'. It should be a valid color");
    equal(op_config.legendBorderThickness,0 , "Invalid value for 'legendBorderThickness'. It should be a valid number");
    equal(op_config.legendBorderColor,"transparent" , "Invalid value for 'legendBorderColor'. It should be a valid color");
    equal(op_config.legendBorderOpacity,1 , "Invalid value for 'legendBorderOpacity'. It should be a valid number between 0 and 1");
    equal(op_config.legendBgColor,"transparent" , "Invalid value for 'legendBgColor'. It should be a valid color");
    equal(op_config.legendBgOpacity,1 , "Invalid value for 'legendBgOpacity'. It should be a valid number between 0 and 1");
});
