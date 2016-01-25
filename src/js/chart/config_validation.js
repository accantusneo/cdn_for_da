TimeSeries.default.mandatory_configs = {
    "selector": {validate_for: "existsOnDOM", "mandatory": true, validateIf:true},
    // "data": {validate_for: ["string", "array", "object"], "mandatory": true, validateIf:true},
    "dateColumnName": {validate_for: "string", "mandatory": true, validateIf:true},
    "metricsColumnName": {validate_for: "array", "mandatory": true, validateIf:true}
};

TimeSeries.default.chart_options = {
    // Data file properties
    // "seriesList": {value: {}, validate_for: "object", validateIf:true},

    //Chart properties....
    "width": {value: 100, validate_for: "number", validateIf:true},
    "height": {value: 100, validate_for: "number", validateIf:true},
    "decimal_precision": {value: 0, validate_for: "number", validateIf:true},
    "chartColor": { value:["red","green","blue","orange","yellow","purple","pink","black","grey"], validateIf:true, validate_for:"array" },
    "marginLeft": {value:20, validateIf:true, validate_for:"number"},
    "marginTop": {value:20, validateIf:true, validate_for:"number"},
    "marginBottom": {value:20, validateIf:true, validate_for:"number"},
    "marginRight": {value:20, validateIf:true, validate_for:"number"},
    "bgColor": {value:"#f6f6f6", validateIf:true, validate_for:"string"},
    "chartTransitionSpeed": {value: 0, validateIf:true, validate_for: "number"},

    "chartBorderWidth": {value:1, validateIf:["showChartBorder",true], validate_for:"number"},
    "chartBorderRadius": {value:3, validateIf:["showChartBorder",true], validate_for:"number"},
    "chartBorderStyle": {value:"solid", validateIf:["showChartBorder",true], validate_for:"string"},
    "chartBorderColor": {value:"lightgray", validateIf:["showChartBorder",true], validate_for:"string"},

    // Chart caption annd sub caption properties
    "caption": {value:"", validateIf:["showCaption",true], validate_for:"string"},
    "captionFontSize": {value:14, validateIf:["showCaption",true], validate_for:"number"},
    "captionFontColor": {value:"#333", validateIf:["showCaption",true], validate_for:"string"},
    "captionFontWeight": {value:"600", validateIf:["showCaption",true], validate_for:"specificValues", specific_values:["normal","bold"]},
    "captionFontFamily": {value:"'Roboto', sans-serif", validateIf:["showCaption",true], validate_for:"string"},
    "captionFontStyle": {value:"normal", validateIf:["showCaption",true], validate_for:"specificValues", specific_values:["italic","oblique","normal","initial","inherit"]},
    "captionAlign": {value:"left", validateIf:["showCaption",true], validate_for:"specificValues", specific_values:["left","oblique"]},
    "captionMargin": {value:-45, validateIf:["showCaption",true], validate_for:"number"},

    "subCaption": {value:"", validateIf:["showSubCaption",true], validate_for:"string"},
    "subCaptionFontSize": {value:11, validateIf:["showSubCaption",true], validate_for:"number"},
    "subCaptionFontColor": {value:"#777", validateIf:["showSubCaption",true], validate_for:"string"},
    "subCaptionFontWeight": {value:"400", validateIf:["showSubCaption",true], validate_for:"specificValues", specific_values:["normal","bold"]},
    "subCaptionFontFamily": {value:"'Roboto', sans-serif", validateIf:["showSubCaption",true], validate_for:"string"},
    "subCaptionFontStyle": {value:"normal", validateIf:["showCaption",true], validate_for:"specificValues", specific_values:["italic","oblique","normal","initial","inherit"]},

    //Grid Properties....
    "gridColor": {value:"#e7e7e7", validateIf: true, validate_for:"string"},
    "gridOpacity":{value:100, validateIf: true, validate_for:"number"},

    //Configs sepcific to line chart....
    "lineThickness": {value:1.5, validateIf:["chartType","line"], validate_for:"number"},
    "lineOnHoverHighlight":{value:false, validateIf:["chartType","line"], validate_for:"boolean"},
    "lineDashed": {value:false, validateIf:["chartType","line"], validate_for:"boolean"},
    "lineDashGap":{value:3, validateIf:["chartType","line"], validate_for:"number"},
    "lineDashLen":{value:3, validateIf:["chartType","line"], validate_for:"number"},
    "lineOpacity": {value:100, validateIf:["chartType","line"], validate_for:"number"},

   //Configs sepcific to crosshair and tooltip....
    "tooltipBorderBodyWidth": {value:1, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipBorderBodyRadius": {value:3, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipBorderBodyStyle": {value:"solid", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBorderBodyColor": {value:"#CCCCCC", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBgBodyColor": {value:"white", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBgBodyOpacity": {value:95, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipBodyFontSize":{value:12, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipBodyFontFamily": {value:"'roboto', sans-serif", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBodyFontWeight": {value:"normal", validateIf:["showTooltip",true], validate_for:"specificValues", specific_values:["normal","bold"]},
    "tooltipBodyFontColor": {value:"#4F4F4F", validateIf:["showTooltip",true], validate_for:"string"},


    "tooltipBorderFooterWidth": {value:0, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipBorderFooterRadius": {value:3, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipBorderFooterStyle": {value:"solid", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBorderFooterColor": {value:"#CBCBCB", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBgFooterColor": {value:"white", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipBgFooterOpacity": {value:95, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipFooterFontSize":{value:8, validateIf:["showTooltip",true], validate_for:"number"},
    "tooltipFooterFontFamily": {value:"Helvetica Neue,Helvetica,Arial,sans-serif", validateIf:["showTooltip",true], validate_for:"string"},
    "tooltipFooterFontWeight": {value:"normal", validateIf:["showTooltip",true], validate_for:"specificValues", specific_values:["normal","bold"]},
    "tooltipFooterFontColor": {value:"#1D1D1D", validateIf:["showTooltip",true], validate_for:"string"},

    "crosshairBorderWidth": {value:1, validateIf:["showCrosshair",true], validate_for:"number"},
    "crosshairBorderRadius": {value:3, validateIf:["showCrosshair",true], validate_for:"number"},
    "crosshairBorderStyle": {value:"solid", validateIf:["showCrosshair",true], validate_for:"string"},
    "crosshairBorderColor": {value:"#CCCCCC", validateIf:["showCrosshair",true], validate_for:"string"},
    "crosshairBgColor": {value:"#4c4c4c", validateIf:["showCrosshair",true], validate_for:"string"},
    "crosshairBgOpacity": {value:100, validateIf:["showCrosshair",true], validate_for:"number"},
    "crosshairFontSize":{value:12, validateIf:["showToolTip",true], validate_for:"number"},
    "crosshairFontFamily": {value:"'roboto', sans-serif", validateIf:["showCrosshair",true], validate_for:"string"},
    "crosshairFontColor": {value:"white", validateIf:["showCrosshair",true], validate_for:"string"},
    "crosshairFontWeight": {value:"bold", validateIf:["showCrosshair",true], validate_for:"specificValues", specific_values:["normal","bold"]},

    //X-Axis Properties....
    "xAxisPosition": {value:"bottom", validateIf:["showXAxis",true], validate_for:"specificValues", specific_values:["top","bottom"]},
    "xAxisLineColor": {value:"#e7e7e7", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisLineThickness": {value:1, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisGranularity": {value:"none", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTimeChangeInParentGranularity": {value:false, validateIf:["showXAxis",true], validate_for:"boolean"},
    "xAxisLineOpacity":{value:1, validateIf:["showXAxis",true], validate_for:"number"},

    "showXAxisRange": {value: false, validateIf: true, validate_for: "boolean"},
    "xAxisRangeFontSize": {value:11, validateIf:["showXAxisRange",true], validate_for:"number"},
    "xAxisRangeFontFamily": {value:"'roboto', sans-serif", validateIf:["showXAxisRange",true], validate_for:"string"},
    "xAxisRangeFontColor": {value:"#1D1D1D", validateIf:["showXAxisRange",true], validate_for:"string"},
    "xAxisRangeFontWeight": {value:"normal", validateIf:["showXAxisRange",true], validate_for:"specificValues", specific_values:["bold","normal"]},
    "xAxisRangeOpacity": {value:70, validateIf:["showXAxisRange",true], validate_for:"number"},

    // "xAxisOnHoverHighlight": {value:false, validate_for:"boolean"},
    // X-Axis title
    "xAxisTitle": {value:"", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTitleFontFamily": {value:"'roboto', sans-serif", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTitleFontSize": {value:12, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTitleFontColor": {value:"#777", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTitleFontWeight": {value:"600", validateIf:["showXAxis",true], validate_for:"specificValues", specific_values:["bold","normal"]},
    "xAxisTitleOpacity": {value:100, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTitlePosition": {value:"center", validateIf:["showXAxis",true], validate_for:"specificValues", specific_values:["left","right","center"]},

    "xAxisTickSize": {value:0, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisOuterTickSize": {value:0, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTickColor": {value:"#e7e7e7", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTickPosition": {value:"bottom", validateIf:["showXAxis",true], validate_for:"specificValues", specific_values:["top","bottom"]},
    "xAxisTickInterval": {value:0, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTickIntervalGranularity": {value: "smartDefault", validateIf:["showXAxis",true], validate_for:"specificValues",specific_values:["second","minute","hour","day","month","year"]},
    "xAxisTickPadding": {value:6, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTickMargin": {value:[0,0], validateIf:["showXAxis",true], validate_for:"array"},
    "xAxisTicksOverlapHandlingMethod": {value:"none", validateIf:["showXAxis",true], validate_for:"specificValues", specific_values:["wrapping","slicing","abbreviated","none"]},
    "xAxisTicksPrefix": {value:"", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTicksSuffix": {value:"", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTickOpacity": {value:1, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTickThickness": {value: 1, validateIf:["showXAxis",true], validate_for: "number"},
    "xAxisNoOfTicks": {value:5, validateIf:["showXAxis",true], validate_for:"number"},

    "xAxisTickValues": {value: "smartDefault", validateIf:["showXAxis",true], validate_for:"array"},
    "xAxisTickValueFontFamily": {value:"'roboto', sans-serif", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTickValueSize": {value:9, validateIf:["showXAxis",true], validate_for:"number"},
    "xAxisTickValueColor": {value:"#777", validateIf:["showXAxis",true], validate_for:"string"},
    "xAxisTickValueWeight": {value:"400", validateIf:["showXAxis",true], validate_for:"specificValues", specific_values:["bold","normal"]},
    "xAxisTickValuesFormat": {value: "multi", validateIf:["showXAxis",true], validate_for:["string", "function"]},


    //Y-Axis Properties....
    "yAxisPosition":{value:"left", validateIf:["showYAxis",true], validate_for:"specificValues", specific_values:["left","right"]},
    "yAxisColor": {value:"#e7e7e7", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisThickness": {value:0, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisLineOpacity":{value:0, validateIf:["showYAxis",true], validate_for:"number"},
    //"yAxisOnHoverHighlight": {value:false, validateIf:["showYAxis",true], validate_for:"boolean"},

    "yAxisTitle": {value:"", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTitleFontFamily": {value:"'roboto', sans-serif", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTitleFontSize": {value:12, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisTitleFontColor": {value:"#777", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTitleFontWeight": {value:"300", validateIf:["showYAxis",true], validate_for:"specificValues",specific_values:["bold","number"]},
    "yAxisTitlePosition": {value:"center", validateIf:["showYAxis",true], validate_for:"specificValues", specific_values:["center","top","bottom"]},
    "yAxisTitleOpacity": {value:100, validateIf:["showYAxis",true], validate_for:"number"},

    "yAxisTickSize": {value:0, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisOuterTickSize": {value:0, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisTickColor": {value:"#e7e7e7", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTickPosition": {value:"left", validateIf:["showYAxis",true], validate_for:"specificValues", specific_values:["right","left"]},
    "yAxisTickInterval": {value:0, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisTickPadding": {value:6, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisTickMargin": {value:[0,0], validateIf:["showYAxis",true], validate_for:"array"},
    "yAxisTicksPrefix": {value:"", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTicksSuffix": {value:"", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTickOpacity": {value:1, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisTickThickness": {value: 1, validateIf:["showYAxis",true], validate_for: "number"},
    "yAxisNoOfTicks": {value:5, validateIf:["showYAxis",true], validate_for:"number"},


    "yAxisTickValues": {value: "smartDefault", validateIf:["showYAxis",true], validate_for:"array"},
    "yAxisTickFormat": {value: "smartDefault", validateIf:["showYAxis",true], validate_for:["string", "function"]},

    "yAxisTickValueFontFamily": {value:"'roboto', sans-serif", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTickValueSize": {value:9, validateIf:["showYAxis",true], validate_for:"number"},
    "yAxisTickValueColor": {value:"#777", validateIf:["showYAxis",true], validate_for:"string"},
    "yAxisTickValueWeight": {value:"400", validateIf:["showYAxis",true], validate_for:"specificValues",specific_values:["bold","normal"]},


    // Missing data
    "processMissingDataPoint": {value: true,  validateIf:true, validate_for:"boolean"},
    "minimumTimeStep": {value: 1,  validateIf:true, validate_for: "number"},
    "minimumTimeStepGranularity": {value: "day",  validateIf:true, validate_for: "specificValues", specific_values: ["year, month, day, hour, minute, second"]},
    "processingMethod": {value: {"disable": "all"},  validateIf:true, validate_for: "specificValues", specific_values: ["disable", "enable", "hide"]}, // specific value, array of values, range, 'regular missing points', 'irregular missing points', 'all'


    // Anomaly detection
    "anomalyPointCircleColor": {value: "#FF0000", validateIf:["enableAnomalyDetection",true], validate_for:"string"},
    "anomalyPointCircleRadius": {value: 4, validateIf:["enableAnomalyDetection",true], validate_for:"number"},
    "anomalyPointFillColor": {value: "smartDefault", validateIf:["enableAnomalyDetection",true], validate_for:"string"},
    "anomalyPointStrokeWidth": {value: 2, validateIf:["enableAnomalyDetection",true], validate_for:"number"},
    "anomalyPointStrokeOpacity": {value: 70, validateIf:["enableAnomalyDetection",true], validate_for:"number"},

    // Data
    "isDataSorted": {value: true,  validateIf:true, validate_for:"boolean"},
    "dataFormat": {value: "smartDefault", validateIf:true, validate_for:"specificValues", specific_values:["json","csv"]},
    "dataSource": {value: "", validateIf: true, validate_for: "string"},
    "gaId": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    "startDate": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    "endDate": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    "accessToken": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    //Live data

    "refreshFrequency": {value: 10, validateIf:["enableLiveData",true], validate_for: "number"},
    "showLiveDataSeparately": {value: false, validateIf:["enableLiveData",true], validate_for: "boolean"},
    "inputDataRange": {value: "Only new data", validateIf:["enableLiveData",true], validate_for: "specificValues", specific_values: ["Only new data", "New and old data", "Fixed length data", "All data with null for future"]},
    "dataBucketSize": {value: "fixed", validateIf:["enableLiveData",true], validate_for: "specificValues", specific_values: ["fixed", "variable"]},
    "bucketOutputLength": {value: -1, validateIf:["enableLiveData",true], validate_for: "number"},
    "outputDataRange": {value: "all", validateIf:["enableLiveData",true], validate_for: "specificValues", specific_values: ["all", "fixed"]},
    "chartTimeSpan": {value: 24, validateIf:["enableLiveData",true], validate_for: "number"},
    "chartTimeSpanGranularity": {value: "smartDefault", validateIf:["enableLiveData",true], validate_for:"specificValues", specific_values:["second","minute","hour","day","month","year"]},
    "fixedBrushLengthOnRefresh": {value: false , validateIf:["enableLiveData",true], validate_for: "boolean"},
    "liveDataOnResume": {value: "goToRecent", validateIf:["enableLiveData",true], validate_for:"specificValues", specific_values:["resume","goToRecent"]},
    "liveDataStatusFontFamily": {value:"'roboto', sans-serif", validateIf:["showYAxis",true], validate_for:"string"},
    "liveDataStatusFontSize": {value:10, validateIf:["enableLiveData",true], validate_for:"number"},
    "liveDataStatusFontColor": {value:"#FF0000", validateIf:["enableLiveData",true], validate_for:"string"},
    "liveDataStatusFontWeight": {value:"bold", validateIf:["enableLiveData",true], validate_for:"specificValues",specific_values:["bold","normal"]},
    "liveDataStatusOpacity": {value:80, validateIf:["enableLiveData",true], validate_for:"number"},

    "numberprefix": {value: "",  validateIf:true, validate_for: "string"},
    "numbersuffix": {value: "",  validateIf:true, validate_for: "string"},

    //Visual Comparison
    "enableVisualComparison": {value: true,  validateIf:true, validate_for: "boolean"},

    //Time Shift
    "enableTimeShift": {value: true,  validateIf:true, validate_for: "boolean"},

    //Time Searcher
    "enableTimeSearcher": {value: true,  validateIf:true, validate_for: "boolean"},

    //Growth Views
    "enableGrowthViews": {value: true,  validateIf:true, validate_for: "boolean"},

    //Data Point Growth
    "enableDataPointGrowth": {value: true,  validateIf:true, validate_for: "boolean"},

    // Simplify Dataset
    "simplifyDataset": {value: true,  validate_for:"boolean", validateIf:true},

    // Smoothing
    "applySmoothingOnLoad": {value: false,  validate_for:"boolean", validateIf:true},
    "smoothingMethod": {value: "Moving average", validateIf:["enableSmoothing",true], validate_for:"specificValues", specific_values:["Moving average"]},
    // "smoothingSliderWidth": {value: 100, validateIf:["enableSmoothing",true], validate_for: "number"},
    // "smoothingSliderHeight": {value: 10, validateIf:["enableSmoothing",true], validate_for: "number"},
    "smoothingSliderTicks": {value: 3, validateIf:["enableSmoothing",true], validate_for: "number"},
    "smoothingIndex": {value: 0, validateIf:["enableSmoothing",true], validate_for: "betweenValues", between_values: {"number":true,"between":[0,1],"decimalPlaces":2}},
    //"smoothingSliderPosition": {value:"top",validate_for: "string", specific_values:["top","bottom"]},

    // Legends
    "legendPosition": {value: "bottom", validateIf:["showLegends",true], validate_for: "specificValues", specific_values: ["bottom", "right"]},
    "legendItemFontWeight": {value:"normal", validateIf:["showLegends",true], validate_for:"specificValues", specific_values:["normal","bold"]},
    "legendItemFontFamily": {value: "Arial", validateIf:["showLegends",true], validate_for: "string"},
    "legendItemFontSize": {value: 11, validateIf:["showLegends",true], validate_for: "number"},
    "legendItemFontColor": {value: "#1D1D1D", validateIf:["showLegends",true], validate_for: "string"},
    "legendItemHoverFontColor": {value: "#000000", validateIf:["showLegends",true], validate_for: "string"},
    "legendItemHiddenColor": {value: "#CCC", validateIf:["showLegends",true], validate_for: "string"},
    "legendBorderThickness" : {value: 0, validateIf:["showLegends",true], validate_for: "number"},
    "legendBorderColor" : {value: "transparent", validateIf:["showLegends",true], validate_for: "string"},
    "legendBorderOpacity" : {value: 1, validateIf:["showLegends",true], validate_for: "number"},
    "legendBgColor" : {value: "transparent", validateIf:["showLegends",true], validate_for: "string"},
    "legendBgOpacity" : {value: 1, validateIf:["showLegends",true], validate_for: "number"},

    // Data points per pixel
    "dataPointsPerPixel": {value: 0.1, validateIf:true, validate_for: "number"},

    // Range Selector
    "rangeSelectorBgColor": {value: "rgba(199, 209, 212, 0.97)", validateIf:["showRangeSelector",true], validate_for: "string"},
    "rangeSelectorLabelColor": {value: "#777", validateIf:["showRangeSelector",true], validate_for: "string"},
    "rangeSelectorLabelThickness": {value:"normal", validateIf:["showRangeSelector",true], validate_for:"specificValues", specific_values:["normal","bold"]},
    "rangeSelectorLabelSize":  {value: 10, validateIf:["showRangeSelector",true], validate_for: "number"},
    "brushColor": {value: "#A59F9F", validateIf:["showRangeSelector",true], validate_for: "string"},
    "rangeSelectorHighlightColor": {value: "transparent", validateIf:["showRangeSelector",true], validate_for: "string"},
    "rangeSelectorHighlightLabelColor": {value: "#4e4e4e", validateIf:["showRangeSelector",true], validate_for: "string"},

    //Navigator
    //"navigatorMode":{value:"line", validateIf:["isNavigator",true], validate_for:"specificValues", specific_values:["bar","line"]},
    "impacts":{value:[], validateIf:["isNavigator",true], validate_for:"array"},
    "numberOfBrush":{value:1, validateIf:["isNavigator",true], validate_for:"number"},
    "outputDateFormat":  {value: "%a %b %e %Y", validateIf:true, validate_for: "string"},
    "outputNumberFormat": {value: ".2f",  validateIf:true, validate_for: "string"},

    //Dimesional Analysis
    "dimensionalAnalysisHighlightColor": {value: "orange", validateIf:["enableDimensionalAnalysis",true], validate_for: "string"},

     //column Chart congigs
    "borderThickness": {value: 1, validateIf:["chartType","column"], validate_for: "number"},
    "bordercolor": {value: "white", validateIf:["chartType","column"], validate_for: "string"},

};


TimeSeries.default.chart_features = {
    "showCaption": {value:false, validateIf:true, validate_for:"boolean"},
    "showSubCaption": {value:false, validateIf:true, validate_for:"boolean"},

    "showXAxis": {value:true,  validateIf:true, validate_for:"boolean"},
    "showYAxis": {value:true, validateIf:true, validate_for:"boolean"},

    "showXAxisGrid": {value:false, validateIf:true, validate_for:"boolean"},
    "showYAxisGrid": {value:false, validateIf:true, validate_for:"boolean"},

    "showTooltip": {value:true,  validateIf:true, validate_for:"boolean"},
    "showCrosshair": {value:true, validateIf:true, validate_for:"boolean"},

    "showLegends": {value: true,  validateIf:true, validate_for:"boolean"},
    "showChartBorder":{value: true,  validateIf:true, validate_for:"boolean"},

    "showRangeSelector": {value: true, validateIf:true, validate_for:"boolean"},

        //Zoom
    "enableZoom": {value:true,  validateIf:true, validate_for:"boolean"},
        // Range Filter
    // "rangeFilter": {value: false,  validateIf:true, validate_for:"boolean"},

    // Dimension Filter
    // "dimensionFilter": {value: false,  validateIf:true, validate_for:"boolean"}
    "enableAnomalyDetection": {value: true,  validateIf:true, validate_for:"boolean"},
    "enableLiveData": {value: false,  validateIf:true, validate_for: "boolean"},
    "enableSmoothing": {value: true,  validateIf:true, validate_for:"boolean"},
    "enableDimensionalAnalysis": {value: true,  validateIf:true, validate_for:"boolean"}
};


TimeSeries.default.mandatory_filter_configs = {
    "selector": {validate_for: "existsOnDOM", "mandatory": true, validateIf:true},
    "impacts": {validate_for:"array", mandatory: true, validateIf: true}
};

TimeSeries.default.filter_configs = {

};

TimeSeries.chartConfigValidation = (function(){
    /**
    *   @function: validate
    *   @param {String} configurations - A configuration object that is passed by the user.
    *   @returns {Object} An object that contains all validated parameters for creating a chart .
    *   @description: default_configs - This method validates each configuration passed by the user to check if proper value is passed or not.
    *   If correct values are not passed properly warning message is logged and default values are taken instead.
    *   If any configuration parameter is passed then default value is taken for that configuration parameter.
    */
    var validate = function (configurations,default_configs) {
        var message = "",
            validate_for,
            id,
            len,
            status,
            current_validateIf,
            mandatory = false;
        for (id in default_configs){
            current_validateIf = default_configs[id].validateIf;
            message = "";
            if((current_validateIf === true || validateIf(configurations,current_validateIf[0],current_validateIf[1]) )) {
                if(configurations[id]!==undefined){
                    validate_for = default_configs[id].validate_for;
                    len = validate_for.length;
                    if (validate_for.constructor !== Array) {
                        status = validationCases(validate_for, id, configurations, default_configs);
                    } else {
                        for (var i = 0; i < len; i++) {
                            status = validationCases(validate_for[i], id, configurations, default_configs);
                            if (i > 0) {
                                message += " OR ";
                            }
                            message += validationErrorMessages(validate_for, default_configs[id]);
                            if (status) {
                                break;
                            }
                        }
                    }
                    if (!status) {
                        message = TimeSeries.errors.invalidConfig(id,configurations.selector) + " " + message;
                        if(!default_configs[id].mandatory) {
                            configurations[id] = default_configs[id].value;
                            warningHandling(message);
                        } else {
                            mandatory = true;
                            errorHandling(message);
                        }
                    }
                } else {
                    if(default_configs[id].mandatory) {
                        configurations = false;
                        message = "Please specify '" + id + "' of the chart in the configuration parameters";
                        errorHandling(message);
                    } else if (default_configs[id].value !== undefined) {
                        configurations[id] = default_configs[id].value;
                    }
                }
            }
        }
        return mandatory ? false : configurations;
    };

    /**
    *   @function: validationCases
    *   @param {String} validate_for - The configuration should be validated against
    *   @param {string} id - The configuration to be validated.
    *   @param {String} configurations - A configuration object that is passed by the user.
    *   @param {Object} default_configs - An object that contains all validated parameters for creating a chart .
    *   @returns {boolean} - Returns true if the config is successfully validated.
    *   @description: This method contains all the cases of validation for datatypes and values.
    */
    function validationCases (validate_for, id, configurations, default_configs) {
        var message;
        switch(validate_for){
            case "number":
                return TimeSeries.validation.dataTypes(configurations[id],"number");
            case "string":
                return TimeSeries.validation.dataTypes(configurations[id],"string");
            case "boolean":
                return TimeSeries.validation.dataTypes(configurations[id],"boolean");
            case "array":
                return TimeSeries.validation.dataTypes(configurations[id],"array");
            case "specificValues":
                return TimeSeries.validation.specificValues(configurations[id],default_configs[id].specific_values);
            case "betweenValues":
                return TimeSeries.validation.betweenValues(configurations[id],default_configs[id].between_values);
            case "function":
                return TimeSeries.validation.dataTypes(configurations[id],"function");
            case "existsOnDOM":
                return existsOnDOM(configurations[id]);
            case "validateArrayOfColor":
                return validateArrayOfColor(configurations[id]);
        }
    }

    /**
    *   @function: validationErrorMessages
    *   @param {String} validate_for - The configuration should be validated against
    *   @param {Object} default_configs - An object that contains all validated parameters for creating a chart .
    *   @returns Additional message.
    *   @description: This method shows errors / warnings for failed validation.
    */
    function validationErrorMessages (validate_for, default_configs) {
        var message;
        switch(validate_for){
            case "number":
                return message;
            case "string":
                return message;
            case "boolean":
                return message;
            case "array":
                return message;
            case "specificValues":
                message += (" It should be one of the following values ["+default_configs.specific_values.toString()+"]");
                return message;
            case "betweenValues":
                message += (" It should be between the following values [" + default_configs.between_values.between.toString()+ "] and upto " + default_configs.between_values.decimalPlaces.toString() + "decimal values");
                return message;
            case "function":
                return message;
            case "existsOnDOM":
                message += " Please enter a valid chart selector";
                return message;
        }
    }

    TimeSeries.mediator.subscribe("validate",validate);

    return {
        validate: validate
    };
}());

function validateIf (options, what, value) {
    return options[what] === value;
}

function validateArrayOfColor (options,id) {
    var status = false,
        validatation_func = TimeSeries.validation.dataTypes,
        message = "",
        color_array = options[id],
        k = 0;

    for (var i = 0, length = color_array.length; i < length; i++) {
        if(!validatation_func(color_array[i],"string")) {
            status = true;
            if(k) {
                message += ", ";
            }

            message += color_array[i];
            color_array[i] = "grey";
            k++;
        }
    }

    if(status) {
        warningHandling(TimeSeries.errors.invalidConfig(id,options.selector) + message + " are not valid colors");
    }

    return color_array;
}

function validateDimensionMetrics (options, data){
    var dimension = options.dateColumnName,
        metrics_column_name = options.metricsColumnName,
        msg,
        status = true,
        columns = "",
        k = "",
        newMetricsColumn = [],
        displayMetricsColumn = [];

    if(!(dimension in data)) {
        msg = TimeSeries.errors.invalidColumnName(options.selector, "dateColumnName", dimension);
        errorHandling(msg);
        status = false;
    }

    for (var i = 0, length = metrics_column_name.length; i < length; i++) {
        if (typeof metrics_column_name[i] === "string") {
            if(!(metrics_column_name[i] in data)) {
                columns += k + metrics_column_name[i];
                status = false;
            } else {
                newMetricsColumn.push(metrics_column_name[i].replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,""));
                displayMetricsColumn.push(metrics_column_name[i]);
            }
        } else {
            if(!(metrics_column_name[i].metric in data) || !(metrics_column_name[i].seriesColumnName in data)) {
                columns += k + metrics_column_name[i].metric + " or " + metrics_column_name[i].seriesColumnName;
                status = false;
            } else {
                newMetricsColumn.push(metrics_column_name[i].metric.replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,"") + "_" + metrics_column_name[i].seriesName.replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,""));
                displayMetricsColumn.push(metrics_column_name[i].metric + " - " + metrics_column_name[i].seriesName);
            }
        }
        k = ", ";
    }

    if(columns) {
        msg = TimeSeries.errors.invalidColumnName(options.selector, "metricsColumnName", columns);
        errorHandling(msg);
    }

    TimeSeries.chart_options[options.selector].newMetricsColumn = [];
    TimeSeries.chart_options[options.selector].newMetricsColumn = newMetricsColumn;
    TimeSeries.chart_options[options.selector].displayMetricsColumn = [];
    TimeSeries.chart_options[options.selector].displayMetricsColumn = displayMetricsColumn;

    return status;
}
