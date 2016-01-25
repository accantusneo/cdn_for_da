var TimeSeries = {};

TimeSeries.configJSON = [];

TimeSeries.default_config = {};

TimeSeries.view = {};

TimeSeries.view.cell_obj = {};

TimeSeries.view.div_obj = {};

TimeSeries.view.container_obj = {};

TimeSeries.query_data = {};

TimeSeries.live_data = {};

TimeSeries.chart_configs = {};
TimeSeries.chart_options = {};
TimeSeries.chart_status = {};

TimeSeries.navigator_config={};

TimeSeries.featuresOnChart = {};

TimeSeries.chart_to_filter_mapping = {};

TimeSeries.default = {};
TimeSeries.default.chart_config={};
TimeSeries.default.navigator_config={};

TimeSeries.default.is_deletable = true;
TimeSeries.default.delete_html = "";

TimeSeries.errors = {};

TimeSeries.allCharts = [];

TimeSeries.featureGroups = {"group1": [], "group2": [], "group3": [], "group4": []};
TimeSeries.featureToChartMapping = {};
TimeSeries.chartToFeatureMapping = {};

TimeSeries.assets = TimeSeries.assets || "/";

TimeSeries.global_data_sets = {};
TimeSeries.data_aliases = {};
TimeSeries.gData_set_to_chart_mapping = {};
TimeSeries.gChart_to_data_set_mapping = {};
TimeSeries.data_load_status = {};

TimeSeries.modalStatus = {};
