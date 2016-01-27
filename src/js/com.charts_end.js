return {
    seeDimensionalAnalysis : seeDimensionalAnalysis,
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
