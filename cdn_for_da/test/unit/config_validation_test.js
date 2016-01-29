var default_config = TimeSeries.default.chart_options;

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

    equal(method_op.yAxisTickSize, default_config.yAxisTickSize.value, 'yAxisTickSize value proper.');

    deepEqual(method_op.yAxisTickMargin, [0,0], 'yAxisTickMargin value proper.');

    equal(method_op.yAxisTickValueSize, default_config.yAxisTickValueSize.value, 'yAxisTickValueSize value proper.');
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
        "showTooltip": "n",
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
    equal(op_config.caption,"","Invalid value for 'caption'. It should be a string");
    equal(op_config.captionFontSize,0,"Value of 'captionFontSize' is valid");
    equal(op_config.captionFontColor,"red","Value of 'captionFontColor' is valid");
    equal(op_config.captionFontWeight, default_config.captionFontWeight.value,"The value of 'captionFontWeight' is invalid. It should be one of the following values [normal,bold]");
    equal(op_config.captionFontFamily,"Arial","Value of 'captionFontFamily' is valid");
    equal(op_config.subCaption,"","Value of 'subCaption' is valid");
    equal(op_config.subCaptionFontSize,"20","Value of 'subCaptionFontSize' is valid");
    equal(op_config.subCaptionFontColor,default_config.subCaptionFontColor.value,"Invalid value for 'subCaptionFontColor'. It should be a string");
    equal(op_config.subCaptionFontWeight,default_config.subCaptionFontWeight.value,"The value of 'subCaptionFontWeight' is invalid. It should be one of the following values [normal,bold]");
    equal(op_config.subCaptionFontFamily,default_config.subCaptionFontFamily.value,"Invalid value for 'subCaptionFontFamily'. It should be a string");
    equal(op_config.showCrosshair,true,"Invalid value for 'showCrosshair'. It should be either true or false");
    equal(op_config.showTooltip,true,"Invalid value for 'showToolTip'. It should be either true or false");
    equal(op_config.enableZoom,false,"Value of 'enableZoom' is valid");
    equal(op_config.showXAxisGridLine,true,"Value of 'showXAxisGridLine' is valid");
    equal(op_config.showYAxisGridLine,false,"Value of 'showYAxisGridLine' is valid");
    equal(op_config.gridColor, default_config.gridColor.value, "Invalid value for 'gridColor'. It should be a string");
    equal(op_config.marginTop, default_config.marginTop.value,"Invalid value for 'marginTop'. It should be a number");
    equal(op_config.marginLeft, default_config.marginLeft.value,"Invalid value for 'marginLeft'. It should be a number");
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
        "tooltipBgBodyColor": 20,
        "tooltipBgBodyOpacity": "heloo",
        "numberprefix": 0,
        "numbersuffix": 1
    },
        op_config;

    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.tooltipBgBodyColor, default_config.tooltipBgBodyColor.value, "Invalid value for 'tooltipBgBodyColor'. It should be a valid color");
    equal(op_config.tooltipBgBodyOpacity, default_config.tooltipBgBodyOpacity.value, "Invalid value for 'tooltipBgBodyOpacity'. It should be a number");
    equal(op_config.numberprefix, "", "Invalid value for 'numberprefix'. It should be a string");
    equal(op_config.numbersuffix, "", "Invalid value for 'numbersuffix'. It should be a string");


    input_config = {
        "selector": "TestingConfiguration",
        "height" : 500,
        "width" : 700,
        "dateColumnName" : "x",
        "metricsColumnName" : ["India","China","Japan"],
        "chartType": "line",
        "toolTipBorderColor": "red",
        "tooltipBgBodyColor": "green",
        "tooltipBgBodyOpacity": 20,
        "numberprefix": "$",
        "numbersuffix": "k"
    };

    op_config = this.validate(input_config,TimeSeries.mandatory_configs);
    op_config = this.validate(op_config, TimeSeries.default.chart_features);
    op_config = this.validate(op_config, TimeSeries.default.chart_options);

    equal(op_config.toolTipBorderColor, "red", "Valid value for 'toolTipBorderColor'.");
    equal(op_config.tooltipBgBodyColor, "green", "Valid value for 'tooltipBgBodyColor'.");
    equal(op_config.tooltipBgBodyOpacity, 20, "Valid value for 'tooltipBgBodyOpacity'.");
    equal(op_config.numberprefix, "$", "Valid value for 'numberprefix'.");
    equal(op_config.numbersuffix, "k", "Valid value for 'numbersuffix'.");
});