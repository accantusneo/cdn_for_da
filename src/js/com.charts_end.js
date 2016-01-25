return {
    seeVisualComparison : seeVisualComparison,
    seeTimeShift : seeTimeShift,
    updateVisualComparison : updateVisualComparison,
    seeDimensionalAnalysis : seeDimensionalAnalysis,
    updateDimensionalAnalysis : updateDimensionalAnalysis,
    applySmoothing : applySmoothing,
    applyAnomalyDetection : applyAnomalyDetection,
    dimensionFilter : dimensionFilter,
    rangeFilter : rangeFilter,
    createFilter : createFilter,
    createMenuBar : createMenuBar,
    createChart : createChart,

    get assets () {
        return TimeSeries.assets;
    },
    set assets(options) {
        if (TimeSeries.validation.dataTypes(options,"string")) {
            TimeSeries.assets = options;
        } else {
            TimeSeries.assets = "/"
        }
    },
    TimeSeries: TimeSeries
};
}());
