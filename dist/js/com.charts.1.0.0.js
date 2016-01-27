var comCharts = (function() {
var TimeSeries = {};

TimeSeries.configJSON = [];

TimeSeries.default_config = {};

TimeSeries.query_data = {};

TimeSeries.chart_configs = {};
TimeSeries.chart_options = {};
TimeSeries.chart_status = {};

TimeSeries.featuresOnChart = {};

TimeSeries.chart_to_filter_mapping = {};

TimeSeries.default = {};
TimeSeries.default.chart_config={};

TimeSeries.errors = {};
TimeSeries.allCharts = [];

// TimeSeries.featureGroups = {"group1": [], "group2": [], "group3": [], "group4": []};
TimeSeries.featureToChartMapping = {};
TimeSeries.chartToFeatureMapping = {};

TimeSeries.assets = TimeSeries.assets || "/";

TimeSeries.global_data_sets = {};
TimeSeries.data_aliases = {};
TimeSeries.gData_set_to_chart_mapping = {};
TimeSeries.gChart_to_data_set_mapping = {};
TimeSeries.data_load_status = {};

TimeSeries.modalStatus = {};

/*
@author : Pykih developers
@module Query
*/
TimeSeries.Query = (function() {
    /**
    @Function: createDimension
    @param {string} table_name - Name of Table you have Created.
    @param {string} query_name - Name of Query you have Created.
    @param {Array} dimension -  Array of dimension you want to create.
    @description: create dimension function accepts table name, query name and an array of dimensions and creates these dimension in the specified table.It also creates a custom_dimension for aggregation functions.
    */
    var createDimension = function (table_name, query_name, dimensions) {
        var config = TimeSeries.query_data[table_name];
        if (!TimeSeries.query_data[table_name].custom_internal_dimension_)
            TimeSeries.query_data[table_name].custom_internal_dimension_ = config.cf.dimension(function (d) {
            return "a";
        });

            TimeSeries.query_data[table_name][query_name+"_dimension_"] = config.cf.dimension(function (d) {
                var dimension_function ='',
                    concatenator = "|+|",
                    dimensionFn,
                    dimension_name,
                    dimension_fun,
                    len = dimensions.length,
                    custom_column;
                for (var i = 0; i < len; i++) {
                    if (i === 0) {
                        concatenator = "";
                    }
                    if(typeof dimensions[i] == 'object') {
                        custom_column = Object.keys(dimensions[i])[0];
                        dimension_fun = dimensions[i][custom_column];
                    } else {
                        dimension_fun = dimensions[i];
                    }
                    if (typeof dimension_fun === "function") {
                        dimension_name = custom_column;
                    } else {
                        dimension_name = dimension_fun;
                    }
                    if (typeof dimension_fun === "function") {
                        dimension_function = dimension_fun(d);
                    } else {
                        if(concatenator === "" && len === 1) {
                            dimension_function = d[dimension_fun];
                        } else {
                            dimension_function += d[dimension_fun]+concatenator;
                        }
                    }
                }
                return dimension_function;
            });
    };
    /**
    @Function: createMetric
    @param {string} table_name - Name of Table you have Created.
    @param {string} query_name - Name of Query you have Created.
    @param {Array} metrics -  Array of metrics you want to create.
    @description: createMetric accepts table name, query name and an array of metrics and creates these metrics in the specified table.If group is not applied then it uses custom_dimension for creating metrics.
    */
    var createMetric = function (table_name, query_name, metrics) {
        if(!TimeSeries.query_data[table_name][query_name].query_config.metric) {
            // console.log("-0-0-0-0-0-0-0")
            TimeSeries.query_data[table_name][query_name].query_config.metric = metrics.metric;
            metrics = metrics.metric;
        }
        var config = TimeSeries.query_data[table_name],
            len = metrics.length;
        for (var i = 0; i < len; i++) {
            var key = Object.keys(metrics[i])[0];
            if (!config.hasOwnProperty(query_name+"_dimension_")) {
                createDimension(table_name, query_name, [key]);
            }
            var met_col = key,
                met_agg = metrics[i][key],
                decimal_precision;
                if(decimal_precision) {
                    decimal_precision = "1e-"+decimal_precision;
                } else {
                    decimal_precision = "1e-2";
                }
            var metricFn = function (d) {
                if (typeof met_agg === "function") {
                    return met_agg(d);
                } else {
                    return +d[met_col];
                }
                },
                add = function (p,v) {
                    var clean_value = (!isNaN(+v[met_col]))?+v[met_col]:0;
                    switch (met_agg) {
                        case 'count':
                            return p + 1;
                        case 'sum':
                            p +=  parseFloat(clean_value);
                            if (p < +decimal_precision) p = 0;
                            return p;
                        case 'min':
                            if(p === 'a') {
                                p = +clean_value;
                            }
                            p = p < +clean_value ? p : +clean_value;
                            return p;
                        case 'max':
                            if(p === 'a') {
                                p = +clean_value;
                            }
                            p = p > +clean_value ? p : +clean_value;
                            return p;
                        case 'median':
                            p.arr.push(+clean_value);
                            p.arr.sort(function(a,b){return a - b;});
                            var half = Math.floor(p.arr.length/2);
                            if(p.arr.length % 2) {
                                p.val = p.arr[half];
                                return p;
                            } else {
                                p.val = (p.arr[half-1] + p.arr[half]) / 2.0;
                                return p;
                            }
                            break;
                        case 'avg':
                            ++p.count;
                            p.sum += +clean_value;
                            p.val = p.sum/p.count;
                            if (p.sum <= 0) {
                                p.val = 0;
                            }
                            return p;
                        case 'value':
                            p.val = clean_value;
                            return p;
                        case 'std':
                            p.arr.push(+clean_value);
                            ++p.count;
                            p.sum += +clean_value;
                            p.mean = p.sum/p.count;
                            var diff = 0;
                            for (var i = 0; i < p.count; i++) {
                                diff+= Math.pow((p.arr[i] - p.mean),2);
                            }
                            p.variance = diff/p.count;
                            p.std = Math.sqrt(p.variance);
                            return p;
                        default:
                            return metricFn(v);
                    }
                },
                remove = function (p,v) {
                    var clean_value = (!isNaN(+v[met_col]))?+v[met_col]:0;
                    switch (met_agg) {
                        case 'count':
                            return p - 1;
                        case 'sum':
                            p -= parseFloat(clean_value);
                            if (p < +decimal_precision) p = 0;
                            return p;
                        case 'min':
                            if(p === 'a') {
                                p = +clean_value;
                            }
                            p = p < +clean_value ? p : +clean_value;
                            return p;
                        case 'max':
                            if(p === 'a') {
                                p = +clean_value;
                            }
                            p = p > +clean_value ? p : +clean_value;
                            return p;
                        case 'mean':
                            break;
                        case 'median':
                            p.arr.push(+clean_value);
                            p.arr.sort(function(a,b){return a - b;});
                            var half = Math.floor(p.arr.length/2);
                            if(p.arr.length % 2) {
                                p.val = p.arr[half];
                                return p;
                            } else {
                                p.val = (p.arr[half-1] + p.arr[half]) / 2.0;
                                return p;
                            }
                            break;
                        case 'avg':
                            p.sum -= +clean_value;
                            --p.count;
                            p.val = p.sum/p.count;
                            if (p.sum <= 0) {
                                p.val = 0;
                            }
                            return p;
                        case 'value':
                            p.val = clean_value;
                            return p;
                        case 'std':
                            p.arr.push(+clean_value);
                            ++p.count;
                            p.sum -= +clean_value;
                            p.mean = p.sum/p.count;
                            var diff = 0;
                            for (var i = 0; i < p.count; i++) {
                                diff+= Math.pow((p.arr[i] - p.mean),2);
                            }
                            p.variance = diff*p.count;
                            p.std = Math.sqrt(p.variance);
                            return p;
                        default:
                            return metricFn(v);
                    }
                },
                initial = function () {
                    switch (met_agg) {
                        case 'count':
                            return 0;
                        case 'sum':
                            return 0;
                        case 'min':
                            return 'a';
                        case 'max':
                            return 'a';
                        case 'mean':
                            break;
                        case 'median':
                            return {val:0,arr:[]};
                        case 'avg':
                            return {count:0, sum:0, val:0};
                        case 'value':
                            return {val:0};
                        case 'std':
                            return {mean: 0, variance: 0, deviation: 0,sum: 0, count: 0,arr: []};
                        default:
                            return 0;
                    }
                };
            // It check wether the current query contains dimension
            if(config[query_name].query_config.dimension) {
                // var grp = config[query_name].query_config.group;
                // if (!config.hasOwnProperty(query_name+"_dimension_")) {
                //    query.createDimension(table_name, query_name, [grp]);
                // }
                TimeSeries.query_data[table_name][query_name+"_metric_"] = config[query_name+"_dimension_"].group().reduce(add,remove,initial);
            } else {
                TimeSeries.query_data[table_name][query_name+"_metric_"] = config.custom_internal_dimension_.group().reduce(add,remove,initial);
            }
        }
    };

    // applyFilter accepts table name, query name and an array of filters
    // and applies these filters on the specified table.
    var applyFilter = function (table_name, query_name, filters) {
        var config = TimeSeries.query_data[table_name],
        custom_column_name;
        if(typeof config[query_name].query_config.dimension[0] == 'object') {
            custom_column_name = Object.keys(config[query_name].query_config.dimension[0])[0];
        } else {
            custom_column_name = config[query_name].query_config.dimension[0];
        }
        // filters = TimeSeries.query_data[table_name][query_name].query_config.filter;
        for (var i = 0; i < filters.length; i++) {
            var column_name = filters[i].column,
                condition_type = filters[i].condition,
                value = filters[i].values,
                filter_function;
            switch (condition_type) {
                case "Equal" :
                    filter_function = function (d) {
                        return (d === value);
                    };
                    break;

                case "NotEqual" :
                    filter_function = function (d) {
                        return (d !== value);
                    };
                    break;

                case "LessThan" :
                    filter_function = function (d) {
                        return (d < value);
                    };
                    break;

                case "GreaterThan" :
                    filter_function = function (d) {
                        return (d > value);
                    };
                    break;

                case "LessThanEqual" :
                    filter_function = function (d) {
                        return (d <= value);
                    };
                    break;

                case "GreaterThanEqual" :
                    filter_function = function (d) {
                        return (d >= value);
                    };
                    break;

                case "Between" :
                    filter_function = function (d) {
                        return (d >= value[0] && d <= value[1]);
                    };
                    break;

                case "NotBetween" :
                    filter_function = function (d) {
                        return (d < value[0] && d > value[1]);
                    };
                    break;

                case "In" :
                    filter_function = function (d) {
                        return (value.indexOf(d) !== -1);
                    };
                    break;

                case "NotIn" :
                    filter_function = function (d) {
                        return (value.indexOf(d) === -1);
                    };
                    break;

                case "IsNull" :
                    filter_function = function (d) {
                        return (d === undefined || d === null);
                    };
                    break;

                case "IsNotNull" :
                    filter_function = function (d) {
                        return (d !== undefined && d !== null);
                    };
                    break;

                case "Eval" :
                    filter_function = value;
                    break;

                default:
            }
            if (config[query_name].query_config.dimension.length === 1 && custom_column_name === column_name) {
                TimeSeries.query_data[table_name][query_name+"_dimension_"].filter(filter_function);
            } else {
                createDimension(table_name, column_name, [column_name]);
                TimeSeries.query_data[table_name][column_name+"_dimension_"].filter(filter_function);
            }
        }
    };
    // propagateFilter accepts impacting and impacted table and query name
    // and propagates the applied filters in a chain reaction fashion to all the impacted querys.
    var propagateFilter = function (table_name, query_name, impacted_table_name, impacted_query_name) {
        var q_config = TimeSeries.query_data[table_name][query_name].query_config;
        if (q_config.filter_impacts) {
            delete q_config.filter_impacts;
        }
        if (q_config.data_impacts) {
            delete q_config.data_impacts;
        }
        setQuery(impacted_table_name, query_name, q_config);
        var obj = {};
        obj[impacted_table_name] = impacted_query_name;
            if (!TimeSeries.query_data[table_name][query_name].query_config.filter_impacts) {
                TimeSeries.query_data[table_name][query_name].query_config.filter_impacts = [obj];
            } else {
                TimeSeries.query_data[table_name][query_name].query_config.filter_impacts.push(obj);
            }
    };
    // propagateData accepts table name, query name and data to be propagated
    // and propagates the data in a chain reaction fashion to all the impacted tables.
    var propagateData = function (table_name, query_name, data, config) {
        var data_impacts = TimeSeries.query_data[table_name][query_name].query_config.data_impacts,
            i,
            j;

        for (i = 0; i < data_impacts.length; i++) {
            if (data_impacts[i] === table_name) {
                break;
            }
            var table = data_impacts[i];
            var keys = Object.keys(TimeSeries.query_data[table]);
            for (j = 0; j < keys.length; j++) {
                if (keys[j].match("_dimension_")) {
                    TimeSeries.query_data[table][keys[j]].filterAll();
                    TimeSeries.query_data[table][keys[j]].dispose();
                    delete TimeSeries.query_data[table][keys[j]];
                } else if (keys[j].match("_metric_")) {
                    TimeSeries.query_data[table][keys[j]].dispose();
                    delete TimeSeries.query_data[table][keys[j]];
                }
            }

            TimeSeries.query_data[table].cf.remove();
            TimeSeries.query_data[table].cf.add(data);
            // TimeSeries.query_data[table].cf = crossfilter(data);
            keys = Object.keys(TimeSeries.query_data[table]);
            for (j = 0; j < keys.length; j++) {
                if (keys[j] !== "cf" && !keys[j].match("_dimension_") && !keys[j].match("_metric_")) {
                    setQuery(table, keys[j], TimeSeries.query_data[table][keys[j]].query_config);
                    // if (TimeSeries.query_data[table][keys[j]].query_config.metric) {
                    //     createMetric(table,keys[j],TimeSeries.query_data[table][keys[j]].query_config.metric);
                    // }
                    if (TimeSeries.query_data[table][keys[j]].query_config.data_impacts) {
                        var d = getData(table, keys[j]);
                    }
                }
            }
        }
        return;
    };
    // setQuery accepts table name, query name and query config
    // and creates dimension, metrics and call filter and data propogation methods.
    // It also updates the JSON config.
    var setQuery = function (table_name, query_name, query_config) {
        var i,
            j;
        TimeSeries.query_data[table_name][query_name] = {"query_config":query_config};
        if (TimeSeries.query_data[table_name][query_name].query_config.dimension) {
            createDimension(table_name, query_name, TimeSeries.query_data[table_name][query_name].query_config.dimension);
        }
        if (TimeSeries.query_data[table_name][query_name].query_config.metric) {
            createMetric(table_name, query_name, TimeSeries.query_data[table_name][query_name].query_config.metric);
        }
        if (TimeSeries.query_data[table_name][query_name].query_config.filter) {
            applyFilter(table_name, query_name, TimeSeries.query_data[table_name][query_name].query_config.filter);
        }
        if (TimeSeries.query_data[table_name][query_name].query_config.filter_impacted_by) {
            var filter_impacted_by = TimeSeries.query_data[table_name][query_name].query_config.filter_impacted_by;
            for (i = 0; i < filter_impacted_by.length; i++) {
                propagateFilter(Object.keys(filter_impacted_by[i])[0], filter_impacted_by[i][Object.keys(filter_impacted_by[i])[0]], table_name, query_name);
            }
        }
        if (TimeSeries.query_data[table_name][query_name].query_config.data_impacted_by) {
            var data_impacted_by = TimeSeries.query_data[table_name][query_name].query_config.data_impacted_by;
            for (i = 0; i < data_impacted_by.length; i++) {
                var table = Object.keys(data_impacted_by[i])[0],
                    table_query = data_impacted_by[i][table];
                if (!TimeSeries.query_data[table][table_query].query_config.data_impacts) {
                    TimeSeries.query_data[table][table_query].query_config.data_impacts = [table_name];
                } else if (TimeSeries.query_data[table][table_query].query_config.data_impacts.indexOf(table_name) !== -1) {
                    continue;
                } else {
                    TimeSeries.query_data[table][table_query].query_config.data_impacts.push(table_name);
                }
            }
        }
        if (TimeSeries.query_data[table_name][query_name].query_config.data_impacts) {
            if (!TimeSeries.query_data[table_name][query_name].query_config.data_impacts) {
                TimeSeries.query_data[table_name][query_name].query_config.data_impacts = query_config.data_impacts;
            } else {
                var data_impacts = query_config.data_impacts,
                    data_impacts_length = data_impacts.length;
                for (i = 0; i < data_impacts_length; i++) {
                    if (TimeSeries.query_data[table_name][query_name].query_config.data_impacts.indexOf(data_impacts[i]) !== -1) {
                        continue;
                    } else {
                        TimeSeries.query_data[table_name][query_name].query_config.data_impacts.push(data_impacts[i]);
                    }
                }
            }
        }
    };
    /**
    @Function: addFilter
    @param {string} table_name - Name of Table you have Created.
    @param {string} query_name - Name of Query you have Created.
    @param {Array} filters -  Array of filter you want to filter.
    @description: addFilter accepts table name, query name and an array of filters and applies these filters on the specified table and updates the JSON config.
    */
    var addFilter = function (table_name, query_name, filters) {
        if (TimeSeries.query_data[table_name][query_name].query_config.filter) {
            TimeSeries.query_data[table_name][query_name].query_config.filter.push.apply(TimeSeries.query_data[table_name][query_name].query_config.filter, filters);
        } else {
            TimeSeries.query_data[table_name][query_name].query_config.filter = filters;
        }
        // console.log(TimeSeries.query_data[table_name][query_name].query_config.filter,filters);
        applyFilter(table_name, query_name, filters);
        var filter_impacts = TimeSeries.query_data[table_name][query_name].query_config.filter_impacts;
        if (filter_impacts) {
            for (var i = 0; i < filter_impacts.length; i++) {
                var table = Object.keys(filter_impacts[i])[0];
                if (table === table_name) {
                    break;
                }
                // TimeSeries.query_data[table][query_name].query_config.filter.push.apply(TimeSeries.query_data[table][query_name].query_config.filter, filters);
                addFilter(table, query_name, filters);
            }
        }
    };
    // removeFilter accepts table name, query name and an array of filters
    // and removes these filters from the specified table and updates the JSON config.
    /**
    @Function: removeFilter
    @param {string} table_name - Name of Table you have Created.
    @param {string} query_name - Name of Query you have Created.
    @param {Array} filters -  paas whole config to get data
    @description: removeFilter accepts table name, query name and an array of filters and removes these filters from the specified table and updates the JSON config.
    */
    var removeFilter = function (table_name, query_name, filters) {
        // console.log("----------",table_name,filters,TimeSeries.query_data[table_name].query8_dimension_.top(Infinity));
        var filter_impacts = TimeSeries.query_data[table_name][query_name].query_config.filter_impacts,
            i,
            j,
            config_filter = TimeSeries.query_data[table_name][query_name].query_config.filter,
            value_equals,
            config_filter_len;
        if(config_filter) config_filter_len = config_filter.length;
        if (TimeSeries.query_data[table_name][query_name+"_dimension_"]) {
            TimeSeries.query_data[table_name][query_name+"_dimension_"].filterAll();
        }
        // console.log(filters.length)
        for (i = 0; i < filters.length; i++) {
            if (TimeSeries.query_data[table_name][filters[i].column+"_dimension_"]) {
                TimeSeries.query_data[table_name][filters[i].column+"_dimension_"].filterAll();
            }
            // config_filter = TimeSeries.query_data[table_name][query_name].query_config.filter;
            for (j = 0; j < config_filter_len; j++) {
                if (!filters[i].condition && !filters[i].values && !config_filter[j]) {
                    if (config_filter[j].column === filters[i].column) {
                        TimeSeries.query_data[table_name][query_name].query_config.filter.splice(j,1);
                        config_filter.splice(j,1);
                        j--;
                    }
                }
            }
        }
        // query.applyFilter(table_name, query_name, TimeSeries.query_data[table_name][query_name].query_config.filter);
        if (filter_impacts) {
            for (i = 0; i < filter_impacts.length; i++) {
                var impacted_table_name = Object.keys(filter_impacts[i])[0];
                if (impacted_table_name === table_name) {
                    break;
                }
                removeFilter(impacted_table_name, query_name, filters);
            }
        }
    };
    // getData accepts table name, query name and config
    // and returns data based on the provided configurations
    /**
    @Function: getData
    @param {string} table_name - Name of Table you have Created.
    @param {string} query_name - Name of Query you have Created.
    @param {JSON} config -  paas whole config to get data
    @description: getData accepts table name, query name and config and returns data based on the provided configurations.
    */
    var getData = function(table_name, query_name, config) {
        var new_column,
            sort,
            order,
            column,
            data,
            key_name,
            key_obj = {},
            key_value,
            d;
        try {
            if(!config) config ={};
            if(config.sort) {
                sort = Object.keys(config.sort)[0];
                order = config.sort[sort];
            }
        }catch(e){
            console.error('Sort syntax is not proper');
        }

        if(!TimeSeries.query_data[table_name][query_name]) {
            // console.error('Query Name '+query_name+' does not Exist');
            return false;
        }
        if (TimeSeries.query_data[table_name][query_name].query_config.metric){
            column = config.metric;
            key_obj = TimeSeries.query_data[table_name][query_name].query_config.metric[0];
            key_value = Object.keys(TimeSeries.query_data[table_name][query_name].query_config.metric[0])[0];
            // console.log(key_obj,key_value);
            new_column = query_name+'_metric_';
        } else if (TimeSeries.query_data[table_name][query_name].query_config.dimension) {
            column = config.dimension;
            // if (TimeSeries.query_data[table_name][query_name].query_config.group) {
            //     new_column = query_name+'_metric_';
            // } else {
                new_column = query_name+'_dimension_';
            // }
        } else{
            new_column = query_name+'_dimension_';
            // console.error("Invalid config param.Pass either dimension or metric");
        }

        function orderValue (p) {
            return p;
        }
        try {
            if (sort == 'asc' && order == 'dataquerykey') {
                data = TimeSeries.query_data[table_name][new_column].all();
            } else if (sort == 'asc' && order == 'dataqueryvalue') {
                data = TimeSeries.query_data[table_name][new_column].top(Infinity,'asc');
            } else if (sort == 'desc' && order == 'dataquerykey') {
                data = TimeSeries.query_data[table_name][new_column].all('desc');
            } else if (sort == 'desc' && order == 'dataqueryvalue') {
                data = TimeSeries.query_data[table_name][new_column].top(Infinity);
            } else {
                data = TimeSeries.query_data[table_name][new_column].top(Infinity,'asc');
            }

        } catch(e){
            console.error('Metric ,Dimension is not created or exist');
        }
        // dataset = data.slice(0);
        var len = data.length,
            i;
        // console.log(data);
        if (key_obj[key_value] == 'avg') {
            dataset = JSON.parse(JSON.stringify(data));
            // dataset = data.slice(0,len);
            for (i = 0; i < len; i++) {
                var a =  dataset[i].value.val;
                dataset[i].value = a;
            }
        } else {
            // removing referencing of data
            dataset = JSON.parse(JSON.stringify(data));
            // dataset = data.slice(0, len);
        }
        if(config.filter) {
            var local_filter,
                condition_type,
                attr,
                value;
            if (config.filter instanceof Array) {
                for (i = 0; i < config.filter.length; i++) {
                    local_filter = config.filter[i];
                    condition_type = local_filter.condition;
                    attr = local_filter.column;
                    value = local_filter.values;
                    dataset = dataset.filter(createFilterFunction(condition_type,attr,value));
                }
                // console.log(dataset);
            } else {
                local_filter = config.filter;
                condition_type = local_filter.condition;
                attr = local_filter.column;
                value = local_filter.values;
                dataset = dataset.filter(createFilterFunction(condition_type,attr,value));
                // console.log(dataset);
            }
        }
        if (config.bottom && typeof config.bottom === "number") {
            d = dataset.slice(dataset.length - config.bottom < 0 ? 0 : dataset.length - config.bottom,dataset.length);
        } else if (config.top && typeof config.bottom === "number") {
            d = dataset.slice(0,config.top > dataset.length ? dataset.length : config.top);
        }
        if (config.propagateData !== false && TimeSeries.query_data[table_name][query_name].query_config.data_impacts) {
            propagateData(table_name, query_name, d ? d : dataset);
        }
        return d ? d : dataset;
    };

    /**
    @Function: createFilterFunction
    @param {string} condition_type - Give conditional type as a string
    @param {string} attr - pass column name
    @param {Integer} value -  send value to fiter the data
    @description: createFilterFunction accepts detail for filter and return the data based on the provided configurations.
    */
    var createFilterFunction = function(condition_type,attr,value) {
        switch (condition_type) {
                case "Equal" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return typeof d[attr] === "object" ? d[attr].val === value : d[attr] === value;
                        }

                    };
                    break;
                case "NotEqual" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] !== value);
                        }

                    };
                    break;

                case "LessThan" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] < value);
                        }
                    };
                    break;

                case "GreaterThan" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] > value);
                        }
                    };
                    break;

                case "LessThanEqual" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] <= value);
                        }
                    };
                    break;

                case "GreaterThanEqual" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] >= value);
                        }
                    };
                    break;

                case "Between" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] >= value[0] && d[attr] <= value[1]);
                        }
                    };
                    break;

                case "NotBetween" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] < value[0] && d[attr] > value[1]);
                        }

                    };
                    break;

                case "In" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (value.indexOf(d[attr]) !== -1);
                        }

                    };
                    break;

                case "NotIn" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (value.indexOf(d[attr]) === -1);
                        }

                    };
                    break;

                case "IsNull" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] === undefined || d[attr] === null);
                        }

                    };
                    break;

                case "IsNotNull" :
                    filter_function = function (d) {
                        if((''+d.key).indexOf('||') > 0 ) {
                            if((''+d.key).split("||").indexOf(value) > -1) {
                                d.key = +d.key.split("||")[0];
                                // console.log(d.key.split("||").indexOf(value),d)
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return (d[attr] !== undefined && d[attr] !== null);
                        }
                    };
                    break;

                case "Eval" :
                    filter_function = value;
                    break;

                default:
            }
        return filter_function;
    };
    // init initializes the crossfilter instance and stores it in JSON config
    /**
    @Function: init
    @param {string} table_name - Table name to create Table.
    @param {JSON} data - Pass Data to create table.
    @param {Array} dimension -  Array of dimension you want to create.
    @description: init initializes the crossfilter instance .
    */
    var init = function(table_name, data) {
        TimeSeries.query_data[table_name] = {"cf":crossfilter(data)};
        return true;
    };
    /**
    @Function: updateData
    @param {string} table_name - Table name to create Table.
    @param {JSON} data - Pass Data to create table.
    @param {Array} updateAll -  if all update the entire dataset in crossfilter
    @description: init initializes the crossfilter instance .
    */
    // updateAll is kept as a parameter for future scalability to update specific rows in data
    var updateData = function(table_name, data, updateAll, limited) {
        if (updateAll === "all") {
            var keys = Object.keys(TimeSeries.query_data[table_name]);
            for (var j = 0; j < keys.length; j++) {
                if (keys[j].match("_dimension_")) {
                    TimeSeries.query_data[table_name][keys[j]].filterAll();
                }
            }
            TimeSeries.query_data[table_name].cf.remove();
            TimeSeries.query_data[table_name].cf.add(data);
        } else {
            TimeSeries.addFilter(table_name,"query",[{"column":"x","condition":"Between","values":limited}]);
            TimeSeries.query_data[table_name].cf.remove();
            TimeSeries.removeFilter(table_name,"query",[{"column":"x","condition":"Between","values":limited}]);
            TimeSeries.query_data[table_name].cf.add(data);
        }
    };

    /**
    @Function: deleteQuery
    @param {string} table_name - Name of table you have created.
    @param {string} query_name -  Name of Query you have Created.
    @description: delete query from the table.
    */
    var deleteQuery = function(table_name, query_name) {
        try {
            if(TimeSeries.query_data[table_name]) {
                if(TimeSeries.query_data[table_name][query_name]) {
                    delete TimeSeries.query_data[table_name][query_name];
                } else {
                    // console.error('Query Name '+query_name+' does not Exist');
                }

                if(TimeSeries.query_data[table_name][query_name+'_dimension_']) {
                    TimeSeries.query_data[table_name][query_name+'_dimension_'].remove();
                    TimeSeries.query_data[table_name][query_name+'_dimension_'].dispose();
                    delete TimeSeries.query_data[table_name][query_name+'_dimension_'];
                }

                if(TimeSeries.query_data[table_name][query_name+'_metric_']) {
                    TimeSeries.query_data[table_name][query_name+'_metric_'].remove();
                    TimeSeries.query_data[table_name][query_name+'_metric_'].dispose();
                    delete TimeSeries.query_data[table_name][query_name+'_metric_'];
                }
            } else {
                console.error('Table Name '+table_name+' does not Exist');
            }
        } catch(e) {
            console.error('Error in Table name or query name');
        }
    };

    // a closure to provide the public methods
    /**
     * Returns function to developer
     * @returns {Function} init,setQuery,addFilter,removeFilter,getData function to user
     */
    return { //exposed to developer
        init : init,
        setQuery : setQuery,
        addFilter : addFilter,
        removeFilter : removeFilter,
        getData : getData,
        updateData : updateData,
        deleteQuery : deleteQuery,
        createMetric: createMetric
    };

}());

/*
@author Pykih developers
@module mediator
@namespace TimeSeries
*/
TimeSeries.mediator = (function(){
    var subscribe = function(channel, fn){
        if (!TimeSeries.mediator.channels[channel]) TimeSeries.mediator.channels[channel] = {};
        TimeSeries.mediator.channels[channel] = { context: this, callback: fn };
        return this;
    };

    var publish = function(channel){
        if (!TimeSeries.mediator.channels[channel]) {
            return false;
        }

        // console.log(arguments,">>>>>>>>>>>>>>>> MEDIATOR");
        var args = Array.prototype.slice.call(arguments, 1),
            subscription = TimeSeries.mediator.channels[channel];

        return subscription.callback.apply(subscription.context, args);
    };

    var publishToAll = function(callbacks) {
        if(callbacks && callbacks.length!==0) {
            var actual_function,
                attribute_array,
                attribute_array_length,
                function_name,
                function_context,
                callbacks_length = callbacks.length,
                i;

            for(i=0;i<callbacks_length;i++) {
                function_name = callbacks[i].function_name;
                actual_function = TimeSeries.mediator.channels[function_name].callback;
                function_context = TimeSeries.mediator.channels[function_name].context;
                attribute_array = callbacks[i].attribute;
                actual_function.apply(function_context,attribute_array);
            }
        }
    };

    var unsubscribe = function(channel) {
        delete TimeSeries.mediator.channels[channel];
    };

    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        unsubscribe:unsubscribe,
        publishToAll:publishToAll
    };

}());

/**
@author Pykih developers
@module validation
@namespace TimeSeries
**/
TimeSeries.validation = (function() {
    /**
    @Function: isEmpty
    @param {string} config - The string to be tested.
    @description - To find if the string is empty or not.
    **/
    var isEmpty = function(config) {
        var is_empty = config.length === 0 || !config.trim();
        return is_empty;
    };
    /**
    @Function: dataTypes
    @param {string} config - The string to be tested.
    @param {string} datatype - The datatype of the config.
    @description To find if data is as per required data type.
    **/
    var dataTypes = function(config,datatype) {
        switch (datatype) {
            case "number":
                return (!isNaN(parseFloat(config)) && isFinite(config));
            case "array":
                return config.constructor === Array;
            case "boolean":
                return config.constructor === Boolean;
            case "string":
                return config.constructor === String;
            case "object":
                return config.constructor === Object;
            case "function":
                return config.constructor === Function;
            case "date":
                return new Date(config) != "Invalid Date";
        }
    };
    /**
    @Function: specificValues
    @param {(string|number|boolean)} config - The value to be tested.
    @param {array} values - The array of the valid values.
    @description: It checks if the parameter config exists in the array.
    */
    var specificValues = function(config,values) {
        return values.indexOf(config) !== -1;
    };
    /**
    @Function: betweenValues
    @param {number} config - The value to be tested.
    @param {array} values - The array of the valid range of values.
    @description: It checks if the parameter config is between the limit values.
    */
    var betweenValues = function(config,values) {
        var result = true;
        if (values.number) {
            result = result && dataTypes(config,"number");
        }
        if (values.between) {
            result = result && config >= values.between[0] && config <= values.between[1];
        }
        if (values.decimalPlaces >= 0) {
            result = result && ((config.toString().split('.')[1] || []).length <= 2);
        }
        return result;
    };
    return {
        isEmpty:isEmpty,
        dataTypes:dataTypes,
        specificValues:specificValues,
        betweenValues:betweenValues
    };
}());

/**
@Function: unique
@param {array} array - An array of values.
@return {array} - An array with unique values from the array paramter.
@description: It checks if the parameter config exists in the array.
*/
Array.prototype.unique = function() {
    if (this.length === 0) {
        return [];
    }
    this.sort();
    var re = [this[0]],
        length = this.length;
    for (var i = 1; i < length; i++) {
        if (this[i] !== re[re.length-1]) {
            re.push(this[i]);
        }
    }
    return re;
};

/**
@Function: areAllValuesSame
@param {array} array - An array of values.
@return {array} - true or false
@description: It checks if any element in the array is different from the first element of the array to verify if all the elements of the array are same.
*/
Array.prototype.areAllValuesSame = function() {
    var length = this.length;
    for (var i = 1; i < length; i++) {
        if (this[i] !== this[0]) {
            return false;
        }
    }
    return true;
};
/**
@Function: equal
@param {array} array - An array of values.
@return {boolean} - true or false
@description: It checks if all the elements of both the arrays are same
*/
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

// Add path interpolator to d3
d3.interpolators.push(function(a, b) {
    var isPath, isArea, interpolator, ac, bc, an, bn;

    // Create a new array of a given length and fill it with the given value
    function fill(value, length) {
        return d3.range(length)
            .map(function() {
                return value;
            });
    }

    // Extract an array of coordinates from the path string
    function extractCoordinates(path) {
        return path.substr(1, path.length - (isArea ? 2 : 1)).split('L');
    }

    // Create a path from an array of coordinates
    function makePath(coordinates) {
        return 'M' + coordinates.join('L') + (isArea ? 'Z' : '');
    }

    // Buffer the smaller path with coordinates at the same position
    function bufferPath(p1, p2) {
        var d = p2.length - p1.length;

        // Paths created by d3.svg.area() wrap around such that the 'end'
        // of the path is in the middle of the list of coordinates
        if (isArea) {
            return fill(p1[0], d/2).concat(p1, fill(p1[p1.length - 1], d/2));
        } else {
            return fill(p1[0], d).concat(p1);
        }
    }

    // Regex for matching the 'd' attribute of SVG paths
    isPath = /M-?\d*\.?\d*,-?\d*\.?\d*(L-?\d*\.?\d*,-?\d*\.?\d*)*Z?/;

    if (isPath.test(a) && isPath.test(b)) {
        // A path is considered an area if it closes itself, indicated by a trailing 'Z'
        isArea = a[a.length - 1] === 'Z';
        ac = extractCoordinates(a);
        bc = extractCoordinates(b);
        an = ac.length;
        bn = bc.length;

        // Buffer the ending path if it is smaller than the first
        if (an > bn) {
            bc = bufferPath(bc, ac);
        }

        // Or, buffer the starting path if the reverse is true
        if (bn > an) {
            ac = bufferPath(ac, bc);
        }

        // Create an interpolater with the buffered paths (if both paths are of the same length,
        // the function will end up being the default string interpolator)
        interpolator = d3.interpolateString(bn > an ? makePath(ac) : a, an > bn ? makePath(bc) : b);

        // If the ending value changed, make sure the final interpolated value is correct
        return bn > an ? interpolator : function(t) {
            return t === 1 ? b : interpolator(t);
        };
    }
});

var applyCSS = function(elementId,css_config) {
    var element = document.getElementById(elementId),
        css_name = Object.keys(css_config);
    for (var i = 0, len=css_name.length; i < len; i++) {
        element.style[css_name[i]] = css_config[css_name[i]];
    }
};

var linearGradient = function (options) {
    var data;
    if (options.feature && options.feature.name === "Visual Comparison") {
        if (options.selector.indexOf("secret") > -1) {
            data = [
                {id: "0",  offset: "0%", color: options.chartColor, opacity: 0},
                {id: "1", offset: "0.4%", color: options.chartColor, opacity: 0},
                {id: "2", offset: "0.4%", color: options.brushColor, opacity: 0},
                {id: "3", offset: "25%", color: options.brushColor, opacity: 0},
                {id: "4", offset: "25%", color: options.chartColor, opacity: 0},
                {id: "5", offset: "75%", color: options.chartColor, opacity: 0},
                {id: "6", offset: "75%", color: options.brushColor, opacity: 1},
                {id: "7", offset: "99.6%", color: options.brushColor, opacity: 1},
                {id: "8", offset: "99.6%", color: options.chartColor, opacity: 0},
                {id: "9", offset: "100%", color: options.chartColor, opacity: 0}
            ];
        } else {
            data = [
                {id: "0", offset: "0%", color: options.chartColor, opacity: 1},
                {id: "1", offset: "0.4%", color: options.chartColor, opacity: 1},
                {id: "2", offset: "0.4%", color: options.brushColor, opacity: 1},
                {id: "3", offset: "25%", color: options.brushColor, opacity: 1},
                {id: "4", offset: "25%", color: options.chartColor, opacity: 1},
                {id: "5", offset: "75%", color: options.chartColor, opacity: 1},
                {id: "6", offset: "75%", color: options.brushColor, opacity: 0},
                {id: "7", offset: "99.6%", color: options.brushColor, opacity: 0},
                {id: "8", offset: "99.6%", color: options.chartColor, opacity: 1},
                {id: "9", offset: "100%", color: options.chartColor, opacity: 1}
            ];
        }
    } else {
        data = [
            {id: "0", offset: "0%", color: options.chartColor},
            {id: "1", offset: "0.4%", color: options.chartColor},
            {id: "2", offset: "0.4%", color: options.brushColor},
            {id: "3", offset: "99.6%", color: options.brushColor},
            {id: "4", offset: "99.6%", color: options.chartColor},
            {id: "5", offset: "100%", color: options.chartColor}
        ];
    }
    options.group.append("linearGradient")
        .attr("id", options.selector+"_gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", options.extent[0]).attr("y1", 0)
        .attr("x2", options.extent[1]).attr("y2", 0)
        .selectAll("stop")
            .data(data)
            .enter().append("stop")
                .attr("id", function(d) { return options.selector+"_stop"+d.id; })
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; })
                // .attr("stroke-dasharray", ("3,3"))
                // .attr("stroke", function(d) { return d.color; })
                // .attr("stroke-width", "1px")
                .attr("stop-opacity", function(d) { return d.opacity; });
};

var existsOnDOM = function(id) {
    return (document.getElementById(id) ? true : false);
};

var onDOMContentLoaded = function (fn) {
    function completed() {
        document.removeEventListener( "DOMContentLoaded", completed, false );
        window.removeEventListener( "load", completed, false );
    }

    if ( document.addEventListener ) {
        document.addEventListener( "DOMContentLoaded", completed, false );
        window.addEventListener( "load", completed, false );
    } else if ( document.attachEvent ) { // if IE event model is used
        document.attachEvent("onreadystatechange", function(){
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", arguments.callee );
            }
        });
    }
    return this;
};
 var capitalizeFirstLetter = function (string) {
    string = string.trim();
    string = string.substr(0, 1).toUpperCase() + string.substr(1);

    return string;
};


var offset = function(elem, property) { //valid property value : Top, Left, Width, Height
    var offset = 0;
    property = "offset" + property;

    do {
        if ( !isNaN( elem[property] ) )
        {
            offset += elem[property];
        }
        elem =  elem.offsetParent;
    } while( elem );
    return offset;
};

var addZero = function (i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

// temporarily using a set of random generated colors.
var getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

/**
@author Pykih developers
@module validation
@namespace TimeSeries
**/
/**
@function: errorHandling
@param {string} error_message - The error message to be shown to the user.
@description: It logs the passed error message in the browser console.
*/
function errorHandling(error_message){
    console.error('%c[Error - TimeSeries] ', 'color: red;font-weight:bold;font-size:14px',error_message);
}

/**
@function: renderHTMLString
@param {string} error_message - The warning message to be shown to the user.
@description: It logs the passed warning message in the browser console.
*/
function warningHandling(error_message) {
    console.warn('%c[Warning - TimeSeries] ', 'color: #F8C325;font-weight:bold;font-size:14px',error_message);
}

/**
@module: TimeSeries.errors
@description: It contains all helper functions for generating generic error and warning 'messages'.
*/
TimeSeries.errors = (function(){
    /**
    *   @function: idNotFoundOnDom
    *   @param {String} id - The element name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The element with id 'some_id' does not exist on DOM.
    *   @description: It returns a string to the caller.
    */
    var idNotFoundOnDom = function(id,selector){
        return "For Chart Selector '" + selector+"' : "+"The element with the id '"+id+"' does not exist on DOM.";
    };
    /**
    *   @function: idAlreadyExistsOnDom
    *   @param {String} id - The element name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The element with id 'some_id' already exist on DOM.
    *   @description: It returns a string to the caller.
    */
    var idAlreadyExistsOnDom = function(id,selector){
        return "For Chart Selector '" + selector+"' : "+"The element with the id '"+id+"' already exist on DOM.";
    };
    /**
    *   @function: idNotFound
    *   @param {String} id - The element name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The element with id 'some_id' does not exist.
    *   @description: It returns a string to the caller.
    */
    var idNotFound = function (id,selector){
        return "For Chart Selector '" + selector + "' : "+"The element with the id '" + id + "' does not exist.";
    };
    /**
    *   @function: fieldAlreadyExists
    *   @param {String} field - The field name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: 'some_field' already exist.
    *   @description: It returns a string to the caller.
    */
    var fieldAlreadyExists = function (field,selector){
        return "For Chart Selector '" + selector+"' : "+"'"+field+"' already exist.";
    };
   /**
    *   @function: fieldNotFound
    *   @param {String} field - The field name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: 'some_field' does not exist. Please insert a valid value for it.
    *   @description: It returns a string to the caller.
    */
    var fieldNotFound = function (field,selector){
        return "For Chart Selector '" + selector+"' : " + "'" + field + "' does not exist. Please insert a valid value for it.";
    };
    /**
    *   @function: invalidConfig
    *   @param {String} field - The field name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The value of 'some_field' is invalid.
    *   @description: It returns a string to the caller.
    */
    var invalidConfig = function(field,selector){
        return "For Chart Selector '" + selector+"' : " + "The value of '"+field+"' is invalid.";
    };
    var invalidDataFormat = function(selector) {
        return "For Chart Selector '" + selector+"' : " + "Invalid data format. Please enter data in one of the following formats : (JSON String, CSV String, CSV file, JSON file, JSON Object)";
    };

    var invalidColumnName = function(selector, field, column_names) {
        return "For Chart Selector '" + selector+"' : " + "The value of '" + field + "' is invalid. Column '" + column_names + "' doesnot exist in the data";
    };

    return {
        idNotFoundOnDom: idNotFoundOnDom,
        idAlreadyExistsOnDom: idAlreadyExistsOnDom,
        idNotFound: idNotFound,
        fieldAlreadyExists: fieldAlreadyExists,
        fieldNotFound: fieldNotFound,
        invalidConfig: invalidConfig,
        invalidDataFormat: invalidDataFormat,
        invalidColumnName: invalidColumnName
    };
})();
/*
@author : Pykih developers
@module dataManipulation
*/
TimeSeries.dataManipulationFunctions = (function() {
    // Builds a binary heap within the specified array a[lo:hi]. The heap has the
    // property such that the parent a[lo+i] is always less than or equal to its
    // two children: a[lo+2*i+1] and a[lo+2*i+2].
    var heapify = function (a, lo, hi, field, date_format) {
        var n = hi - lo,
            i = (n >>> 1) + 1;
        while (--i > 0) {
            sift(a, i, n, lo, field);
        }
        return a;
    };
    // Sorts the specified array a[lo:hi] in descending order, assuming it is
    // already a heap.
    var heapsort = function (a, lo, hi, field, date_format) {
        var n = hi - lo,
            t;
        while (--n > 0) {
            t = a[lo];
            a[lo] = a[lo + n];
            a[lo + n] = t;
            sift(a, 1, n, lo, field);
        }
        return a.reverse();
    };
    // Sifts the element a[lo+i-1] down the heap, where the heap is the contiguous
    // slice of array a[lo:lo+n]. This method can also be used to update the heap
    // incrementally, without incurring the full cost of reconstructing the heap.
    var sift = function (a, i, n, lo, field, date_format) {
        var d = a[--lo + i];
        if (date_format === "TimeStamp") {
            a[lo + i][field] = new Date(parseInt(d[field])).getTime();
            d[field] = new Date(parseInt(d[field])).getTime();
        } else {
            a[lo + i][field] = new Date(d[field]).getTime();
            d[field] = new Date(d[field]).getTime();
        }
        a[lo + i].isRawData = true;
        d.isRawData = true;
        var x = d[field],
            child;
        while ((child = i << 1) <= n) {
            if (child < n) {
                if (date_format === "TimeStamp") {
                    a[lo + child][field] = new Date(parseInt(a[lo + child][field])).getTime();
                    a[lo + child + 1][field] = new Date(parseInt(a[lo + child + 1][field])).getTime();
                } else {
                    a[lo + child][field] = new Date(a[lo + child][field]).getTime();
                    a[lo + child + 1][field] = new Date(a[lo + child + 1][field]).getTime();
                }
                a[lo + child].isRawData = true;
                a[lo + child + 1].isRawData = true;
                if (a[lo + child][field] > a[lo + child + 1][field]) {
                    child++;
                }
            }
            if (x <= a[lo + child][field]) {
                break;
            }
            a[lo + i] = a[lo + child];
            i = child;
        }
        a[lo + i] = d;
    };
    /**
    @Function: heapSort
    @param {Array} data - The data array
    @param {string} date_field - Name of attribute in which date-time is present in the data
    @param {String} date_format - Format of date in data
    @param {boolean} isDataSorted - Does the data needs sorting
    @returns {Object} - Sorted data with date converted to timestamp
    @description: Convert date into timestamp and sort data based on timestamp by using heap
    */
    var heapSort = function (data, date_field, date_format, options) {
        if (!options.isDataSorted) {
            var heaped_data = heapify(data,0,data.length,date_field,date_format);
            return heapsort(heaped_data,0,heaped_data.length,date_field,date_format);
        }
        return data;
    };
    /**
    @Function: dataProcessing
    @param {Array} data - The data array
    @param {string} date_field - Name of attribute in which date-time is present in the data
    @param {String} format_data - Object of format, regex and mapping for the detected date format
    @param {String} date_format - Format of date in data
    @param {Object} options - The options object passed by the chart which contains configs such as processMissingDataPoint, minTimeStep, chart width, etc
    @returns {Object} - returns the manipulated dataset
    @description: Loop over data to detect granularity in the data
    */

    var mmm_array = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var mmmm_array = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    var dataProcessing = function (data, date_field, format_data, date_format, options) {
        var i,
            j,
            n,
            d,
            data_length = data.length,
            year = [],
            year_length = -1,
            month = [],
            month_length = -1,
            date = [],
            date_length = -1,
            hour = [],
            hour_length = -1,
            minute = [],
            minute_length = -1,
            second = [],
            second_length = -1,
            year_index,
            month_index,
            date_index,
            hour_index,
            minute_index,
            second_index,
            unique_time_steps = [],
            unique_time_steps_count = [],
            index = -1,
            time_step = 0,
            obj,
            key,
            alias = TimeSeries.global_data_sets[options.data].alias,
            regex_data,
            return_obj = {},
            actual_milliseconds_array = [],
            mmm_index,
            mmmm_index;

        for (i = 0; i < data_length; i++) {
            // Detect min and max granularity in data
            if (!options.minGranularity && !options.maxGranularity) {
                d = data[i];
                // Detect Granularity for date in TimeStamp format
                if (date_format === "TimeStamp" || date_format === "YYYYMMDD" || date_format === "YYYYMMDDHH" || date_format === "YYYYMMDDHHMM" || date_format === "YYYYMMDDHHMMSS") {
                    if (date_format === "YYYYMMDD" || date_format === "YYYYMMDDHH" || date_format === "YYYYMMDDHHMM" || date_format === "YYYYMMDDHHMMSS") {
                        date_temp = d[date_field];
                        modified_date = [date_temp.slice(0,4),"/",date_temp.slice(4,6),"/",date_temp.slice(6,8)].join('');
                        if (date_format === "YYYYMMDDHH") {
                            modified_time = [date_temp.slice(8,10),"00","00"].join(':');
                        } else if (date_format === "YYYYMMDDHHMM") {
                            modified_time = [date_temp.slice(8,10),date_temp.slice(10,12),"00"].join(':');
                        } else if (date_format === "YYYYMMDDHHMMSS") {
                            modified_time = [date_temp.slice(8,10),date_temp.slice(10,12),date_temp.slice(12,14)].join(':');
                        } else {
                            modified_time = "00:00:00";
                        }
                        n = new Date([modified_date,modified_time].join(' '));
                    } else {
                        n = new Date(parseInt(d[date_field]));
                    }
                    data[i][TimeSeries.global_data_sets[options.data][date_field] || date_field] = n.getTime();
                    data[i].isRawData = true;
                    if (year[year_length] != n.getFullYear()) {
                        year.push(n.getFullYear());
                        year_length++;
                    }
                    if (month[month_length] != n.getMonth()+1) {
                        month.push(n.getMonth()+1);
                        month_length++;
                    }
                    if (date[date_length] != n.getDate()) {
                        date.push(n.getDate());
                        date_length++;
                    }
                    if (hour[hour_length] != n.getHours()) {
                        hour.push(n.getHours());
                        hour_length++;
                    }
                    if (minute[minute_length] != n.getMinutes()) {
                        minute.push(n.getMinutes());
                        minute_length++;
                    }
                    if (second[second_length] != n.getSeconds()) {
                        second.push(n.getSeconds());
                        second_length++;
                    }
                } else { // Detect Granularity for date in any other format
                    n = new Date(d[date_field]); // Additional code will come in here
                                                 // when we support date formats that are not directly supported by new Date().
                    regex_data = d[date_field].match(format_data.regex);
                    year_index = format_data.mapping[0]+1;
                    month_index = format_data.mapping[1]+1;
                    date_index = format_data.mapping[2]+1;
                    hour_index = format_data.mapping[3]+1;
                    minute_index = format_data.mapping[4]+1;
                    second_index = format_data.mapping[5]+1;
                    data[i][TimeSeries.global_data_sets[options.data][date_field] || date_field] = n.getTime();
                    data[i].isRawData = true;
                    if(year_index != -1 && year[year_length] != regex_data[year_index] && regex_data[year_index] !== undefined) {
                        year.push(+regex_data[year_index]);
                        year_length++;
                    }
                    if(month_index != -1 && month[month_length] != +regex_data[month_index] && regex_data[month_index] !== undefined) {
                        mmm_index = mmm_array.indexOf(regex_data[month_index]);
                        mmmm_index = mmmm_array.indexOf(regex_data[month_index]);
                        month.push(mmm_index !== -1 ? (mmm_index + 1) : mmmm_index !== -1 ? (mmmm_index + 1) : +regex_data[month_index]);
                        month_length++;
                    }
                    if(date_index != -1 && date[date_length] != regex_data[date_index] && regex_data[date_index] !== undefined) {
                        date.push(+regex_data[date_index]);
                        date_length++;
                    }
                    if(hour_index != -1 && hour[hour_length] != regex_data[hour_index] && regex_data[hour_index] !== undefined) {
                        hour.push(+regex_data[hour_index]);
                        hour_length++;
                    }
                    if(minute_index != -1 && minute[minute_length] != regex_data[minute_index] && regex_data[minute_index] !== undefined) {
                        minute.push(+regex_data[minute_index]);
                        minute_length++;
                    }
                    if(second_index != -1 && second[second_length] != regex_data[second_index] && regex_data[second_index] !== undefined) {
                        second.push(+regex_data[second_index]);
                        second_length++;
                    }
                }
            }

            /* Find the minimum time steps for which the data exists (in milliseconds) */
            if (options.processMissingDataPoint) {
                actual_milliseconds_array.push(data[i][date_field]);
                if (!options.minimumTimeStep) {
                    if (i > 0) {
                        time_step = data[i][date_field] - data[i-1][date_field];
                        index = unique_time_steps.indexOf(time_step);
                        if (index === -1) {
                            unique_time_steps.push(time_step);
                            unique_time_steps_count.push(1);
                        } else {
                            unique_time_steps_count[index] = unique_time_steps_count[index] + 1;
                        }
                    } else {
                        obj = JSON.parse(JSON.stringify(data[i]));
                    }
                } else {
                    obj = JSON.parse(JSON.stringify(data[0]));
                }
            }

            if (alias) {
                for (key in alias) {
                    if (!data[i][alias[key]]) {
                        data[i][alias[key]] = data[i][key];
                        delete data[i][key];
                    }
                }
            }
        }
        if (!options.minGranularity && !options.maxGranularity) {
            if (options.enableLiveData && TimeSeries.chart_configs[options.selector].data_processed) {
                var previous_granularity_array = TimeSeries.chart_configs[options.selector].data_processed.min_max_granularity[2];
                return_obj.min_max_granularity = decideMinAndMaxGranularity(
                    previous_granularity_array[0].length > 0 ? previous_granularity_array[0].concat(year) : year,
                    previous_granularity_array[1].length > 0 ? previous_granularity_array[1].concat(month) : month,
                    previous_granularity_array[2].length > 0 ? previous_granularity_array[2].concat(date) : date,
                    previous_granularity_array[3].length > 0 ? previous_granularity_array[3].concat(hour) : hour,
                    previous_granularity_array[4].length > 0 ? previous_granularity_array[4].concat(minute) : minute,
                    previous_granularity_array[5].length > 0 ? previous_granularity_array[5].concat(second) : second
                    );
            } else {
                return_obj.min_max_granularity = decideMinAndMaxGranularity(year,month,date,hour,minute,second);
            }
        }

        if (options.processMissingDataPoint && (unique_time_steps.length > 1 || options.minimumTimeStep)) {
            options.minimumTimeStepGranularity = options.minimumTimeStepGranularity ? options.minimumTimeStepGranularity : return_obj.min_max_granularity[0];
            return_obj.data = data.concat(findMissingDataPoint(data, date_field, options.minimumTimeStep, options.minimumTimeStepGranularity, actual_milliseconds_array, unique_time_steps, unique_time_steps_count, obj));
        } else {
            return_obj.data = data;
        }

        if (options.width) {
            return_obj.initial_zoom_level = decideInitialZoomLevel(options,return_obj.min_max_granularity[2],data,date_field);
        }

        return return_obj;
    };

    /**
    @Function:findMissingDataPoint
    @param {Array} data - The data array
    @param {string} date_field - Name of attribute in which date-time is present in the data
    @param {Number} minimumTimeStep - Calculate minimum time step for finding missing data point only if the user has not passed a number in this paramter. It represents the minimum difference between two timestamp at which there is no missing data.
    @param {String} minimumTimeStepGranularity - It represents the granularity of time of minimumTimeStep. Only applicable if minimumTimeStep is present.
    @param {Array} actual_milliseconds_array - An array containing the dates in milliseconds from each object of the dataset
    @param {Array} unique_time_steps - An array containing unique differences in milliseconds between two consecutive timestamps throught out the dataset
    @param {Array} unique_time_steps_count - An array containing number of times the values in unique_time_steps occured while finding the differences throughout the dataset.
    @param {Object} obj - An object with all the keys from the dataset and the values as NA so the missing timestamp in milliseconds will be assigned to the date attribute and then the object will be one missing data point which can be pushed to the array of missing_data_points
    @returns {Object} - Returns an array of missing datapoints
    @description: Loop over data to detect granularity in the data
    */
    var findMissingDataPoint = function (data, date_field, minimumTimeStep, minimumTimeStepGranularity, actual_milliseconds_array, unique_time_steps, unique_time_steps_count, obj) {
        var i,
            key,
            minimum_time_step_index = 0,
            minimum_time_step = 0,
            divisor = 1,
            milliseconds_extent,
            d3_time_range,
            expected_milliseconds_array = [],
            milliseconds_binary_array_length = 0,
            milliseconds_binary_array = [],
            missing_data_points = [],
            maxlen = 0;
        for (key in obj) {
            obj[key] = "NA";
        }
        if (!minimumTimeStep) {
            if (unique_time_steps_count.areAllValuesSame()) {
                minimum_time_step = Math.min.apply(Math, unique_time_steps_count);
            } else {
                minimum_time_step_index = unique_time_steps_count.indexOf(Math.max.apply(Math, unique_time_steps_count));
                minimum_time_step = unique_time_steps[minimum_time_step_index];
            }

            /* Find the divisor to convert the minimum time steps found from milliseconds to the granularity of the data */
            switch (minimumTimeStepGranularity) {
                case "second":
                    divisor = 1000;
                    break;
                case "minute":
                    divisor = 1000 * 60;
                    break;
                case "hour":
                    divisor = 1000 * 60 * 60;
                    break;
                case "day":
                    divisor = 1000 * 60 * 60 * 24;
                    break;
                case "month":
                    divisor = 1000 * 60 * 60 * 24 * 30;
                    break;
                case "second":
                    divisor = 1000 * 60 * 60 * 24 * 30 * 12;
                    break;
            }
            minimum_time_step = Math.floor(minimum_time_step / divisor);
        } else {
            minimum_time_step = minimumTimeStep;
        }

        /* Build an array of timestamps (in milliseconds) between the min and max time of the timeseries data  */
        milliseconds_extent = d3.extent(data, function (d) {
            return d[date_field];
        });
        d3_time_range = d3.time[minimumTimeStepGranularity].rangePlusBinaryForMDP(milliseconds_extent[0], milliseconds_extent[1], minimum_time_step,actual_milliseconds_array);
        expected_milliseconds_array = d3_time_range[0];
        milliseconds_binary_array = d3_time_range[1];

        // function findPattern(n) {
        // 	var maxlen = parseInt(n.length/2);
        // 	NEXT:
        // 	for (i = 1; i <= maxlen; ++i) {
        // 		var len = k = 0;
        // 		var prev = "";
        // 		do {
        // 			var sub = n.substring(k,k+i);
        // 			k+= i;
        // 			len = sub.length;
        // 			if (len!=i) break;
        // 			if (prev.length && sub.length==i && prev!=sub) continue NEXT;
        // 			if (!prev.length) prev = sub;
        // 		} while (sub.length);
        // 		if (!len || len && n.substr(n.length-len) == n.substr(0,len)) {
        // 			return n.substr(0,i);
        // 		}
        // 	}
        // 	return false;
        // }
        // Reference: http://stackoverflow.com/questions/16474895/finding-a-pattern-in-a-binary-string
        // Iterate over the expected_milliseconds_array to toggle binaries (1 to 0) of specific values which are passed in the configuration via processingMethod. The possibilities are either the 1s for specific values is converted to 0 or 1s of all the other values except the specified is converted to 0.

        /* Find the missing data point by checking if the expected_milliseconds exist in the data. If not then append the object for the same in the original dataset */
        milliseconds_binary_array_length = milliseconds_binary_array.length;
        for (i = 0; i < milliseconds_binary_array_length; i++) {
            if (milliseconds_binary_array[i] === 1) {
                obj = JSON.parse(JSON.stringify(obj));
                obj[date_field] = expected_milliseconds_array[i];
                obj.isRawData = false;
                missing_data_points.push(obj);
            }
        }
        return missing_data_points;
    };

    /**
    @Function: decideMinAndMaxGranularity
    @param {Array} year - An array with all the years in the data
    @param {Array} month - An array with all the months in the data
    @param {Array} date - An array with all the dates in the data
    @param {Array} hours - An array with all the hours in the data
    @param {Array} minutes - An array with all the minutes in the data
    @param {Array} seconds - An array with all the seconds in the data
    @returns {Array} - Minimum and Maximum granularity of data
    @description: Decide the min and max granularity of data based on the length of supplied parameters
    */
    var decideMinAndMaxGranularity = function (year, month, date, hour, minute, second) {
        var unique_year = year.unique(),
            unique_month = month.unique(),
            unique_date = date.unique(),
            unique_hour = hour.unique(),
            unique_minute = minute.unique(),
            unique_second  = second.unique(),
            min_granularity,
            max_granularity,
            granularity_length_array;

        if(unique_year.length > 1) {
            max_granularity = "year";
        } else if(unique_month.length > 1) {
            max_granularity = "month";
        } else if(unique_date.length > 1) {
            max_granularity =   "day";
        } else if(unique_hour.length > 1) {
            max_granularity = "hour";
        } else if(unique_minute.length > 1) {
            max_granularity = "minute";
        } else if(unique_second.length > 1) {
            max_granularity = "second";
        }

        if(unique_second.length > 1) {
            min_granularity = "second";
        } else if(unique_minute.length > 1) {
            min_granularity = "minute";
        } else if(unique_hour.length > 1) {
            min_granularity =   "hour";
        } else if(unique_date.length > 1) {
            min_granularity = "day";
        } else if(unique_month.length > 1) {
            min_granularity = "month";
        } else if(unique_year.length > 1) {
            min_granularity = "year";
        }
        granularity_length_array = [unique_year,unique_month,unique_date,unique_hour,unique_minute,unique_second];
        return [min_granularity,max_granularity,granularity_length_array];
    };
    /**
    @Function: decideInitialZoomLevel
    @param {Array} granularity_length_array - An array with number of unique years,months,days,hours,minutes and seconds
    @param {Number} chart_width_in_pixel - The width of the chart in pixels
    @param {Array} data - The Data array
    @param {String} date_field - An array with all the hours in the data
    @returns {Array} - Domain range for the initial zoom level
    @description: Decide the initial zoom level of the chart based on chart width and no. of data points
    */
    var decideInitialZoomLevel = function (options, granularity_length_array, data, date_field) {
        // var temp = 1,
        //     max_data_points_displayed = Math.floor(chart_width_in_pixel / 3), // assuming 1 data point needs atleast 3 pixels
        //     i = 0,
        //     dp = granularity_length_array[i].length;
        // if (data.length <= max_data_points_displayed || (data.length - max_data_points_displayed) <= (0.1 * data.length)) {
        //     dp = data.length;
        // } else {
        //     while (i < granularity_length_array.length-1) {
        //         i++;
        //         temp = dp * granularity_length_array[i].length;
        //         if (temp <= max_data_points_displayed && temp < data.length) {
        //             dp = temp;
        //         }
        //     }
        //     if (data.length - dp < (0.1 * data.length)) {
        //         dp = data.length;
        //     }
        // }
        // if (dp > (1.1 * max_data_points_displayed) || (dp < max_data_points_displayed && dp !== data.length)) {
        //     dp = max_data_points_displayed;
        // }
        // return dp;
        var max_data_points_displayed = options.width * options.dataPointsPerPixel;
        return Math.round(max_data_points_displayed);
    };

    var simplifyDataset = function (data,limit) {
        var len = data.length;
        if (len<=limit) { return data; }

        limit = limit/2;
        var step = Math.ceil(len / limit),
            local_arr,
            local_arr_len,
            avgX,
            avgY,
            return_arr = [],
            centre_index;
        for (var i = 0; i < limit; i++) {
            local_arr = data.splice(0, step);
            local_arr_len = local_arr.length;
            if (local_arr_len > 2) {
                if (local_arr_len % 2 === 0) {
                    centre_index = (local_arr_len / 2) - 1;
                } else {
                    centre_index = Math.floor(local_arr_len / 2);
                }
                return_arr.push( local_arr[0], local_arr[centre_index] );
                if (data.length === 0) { // last data point at the end
                    return_arr.push(local_arr.splice(-1)[0]);
                }
            } else if (local_arr.length <= 0) { // extra for loop iteration since the limit is in decimal but step is Math.ceiled.
                break;
            } else { // When local_arr.length is 1 or 2, no point finding median.
                return_arr = return_arr.concat(local_arr);
            }
        }
        return return_arr;
    };

    var transformGAData = function (d, options) {
        var data = [],
            columns = d.columnHeaders,
            columns_length = columns.length,
            rows = d.rows,
            rows_length = rows.length,
            i,
            j,
            k,
            split = options.split,
            split_length,
            substitute = options.substitute,
            substitute_length,
            concat = options.concat,
            concat_length;

        for (i = 0; i < rows_length; i++) {
            data[i] = {};
            for (j = 0; j < columns_length; j++) {
                data[i][options.alias[columns[j].name]] = rows[i][j];
                if (split && split.length > 0) {
                    split_length = split.length;
                    for (k = 0; k < split_length; k++) {
                        if (split[k].column === options.alias[columns[j].name]) {
                            splitCells(data[i], split[k].column, split[k].delimeter, split[k].newColumns);
                        }
                    }
                }
                if (substitute && substitute.length > 0) {
                    substitute_length = substitute.length;
                    for (k = 0; k < substitute_length; k++) {
                        if (substitute[k].column === options.alias[columns[j].name]) {
                            substituteCellValues(data[i], substitute[k].column, substitute[k].match, substitute[k].replace, substitute[k].isExact);
                        }
                    }
                }
                if (concat && concat.length > 0) {
                    concat_length = concat.length;
                    for (k = 0; k < concat_length; k++) {
                        concatCells(data[i], concat[k].columns, concat[k].delimeter, concat[k].newColumn);
                    }
                }
            }
        }
        return data;
    };

    var transformGSXData = function (d, options) {
        var data = [],
            input_array = d.feed.entry,
            dimensions = options.dimensions,
            gsx_dimensions = dimensions.map(function(dimension) {
                return "gsx$" + dimension;
            }),
            metrics = options.metrics,
            gsx_metrics = metrics.map(function(metric) {
                return "gsx$" + metric;
            }),
            j,
            len;
        for(var i = 0, length = input_array.length; i < length; i++) {
            data[i] = {};
            for(j = 0, len = dimensions.length; j < len; j++) {
                data[i][options.alias[dimensions[j]]] = input_array[i][gsx_dimensions[j]].$t;
            }
            for(j = 0, len = metrics.length; j < len; j++) {
                data[i][options.alias[metrics[j]]] = input_array[i][gsx_metrics[j]].$t;
            }
        }
        return data;
    };

    var downloadDataURI = function(options, JSONData, ShowLabel, include) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData,
            arrData_length = arrData.length,
            CSV = '',
            index,
            i,
            row;

        //Set Report title in first row or line

        // CSV += ReportTitle + '\r\n\n';

        //This condition will generate the Label/Header
        if (ShowLabel) {
            row = "";

            //This loop will extract the label from 1st index of on array
            for (index in arrData[0]) {
                //Now convert each value to string and comma-seprated
                if (include.indexOf(index) > -1) {
                    row  += index + ',';
                }
            }

            row = row.slice(0, -1);

            //append Label row with line break
            CSV += row + '\r\n';
        }
        //1st loop is to extract each row
        for (i = 0; i < arrData_length; i++) {
            row = "";

            //2nd loop will extract each column and convert it in string comma-seprated
            for (index in arrData[i]) {
                if (include.indexOf(index) > -1) {
                    row  += '"' + arrData[i][index] + '",';
                }
            }

            row.slice(0, row.length - 1);

            //add a line break after each row
            CSV += row + '\r\n';
        }

        if (CSV === '') {
            alert("Invalid data");
            return;
        }

        //Generate a file name
        var fileName = TimeSeries.global_data_sets[options.data].dataName || "MyReport";
        //this will remove the blank-spaces from the title and replace it with an underscore
        fileName  = fileName.replace(/ /g, "_");

        //Initialize file format you want csv or xls
        var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

        // Now the little tricky part.
        // you can use either>> window.open(uri);
        // but this will not work in some browsers
        // or you will not get the correct file extension

        //this trick will generate a temp <a /> tag
        var link = document.createElement("a");
        link.href = uri;

        //set the visibility hidden so it will not effect on your web-layout
        link.style = "visibility:hidden";
        link.download = fileName + ".csv";

        //this part will append the anchor tag and remove it after automatic click
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // if(!options) {
        //     return;
        // }
        // isPlainObject(options) || (options = {data: options});
        //
        // options.dataName || (options.dataName = "download");
        // options.url || (options.url = "http://download-data-uri.appspot.com/");
        // var form = '<form id="export-form" method="post" action="'+options.url+'" style="display:none"><input type="hidden" name="filename" value="'+options.dataName+'"/><input type="hidden" name="data" value="'+data+'"/></form>';
        // d3.select("body").append(form);
        // var element = document.getElementById("export-form");
        // element.submit();
        // element.parentNode.removeChild(element);
        // // document.getElementById("export-form").submit();
        // // $('#export-form').submit().remove();
    };

    var splitColumns = function (data, column, delimeter, new_columns) {
        var data_length = data.length,
            i,
            split,
            j,
            new_columns_length = new_columns.length;

        for (i = 0; i < data_length; i++) {
            split = data[i][column].split(delimeter);
            for (j = 0; j < new_columns_length; j++) {
                data[i][new_columns[j]] = split[j];
            }
            delete data[i][column];
        }
        return data;
    };

    var splitCells = function (data, column, delimeter, new_columns) {
        var split = data[column].split(delimeter),
            new_columns_length = new_columns.length,
            j;

        for (j = 0; j < new_columns_length; j++) {
            data[new_columns[j]] = split[j];
        }
        delete data[column];
        return data;
    };

    var substituteColumnValues = function (data, column, match, replace, isExact) {
        var data_length = data.length,
            i,
            match_length = match.length,
            regex;

        if (isExact) {
            for (i = 0; i < match_length; i++) {
                match[i] = match[i].toLowerCase();
            }

            for (i = 0; i < data_length; i++) {
                if (match.indexOf(data[i][column].toLowerCase()) > -1) {
                    data[i][column] = replace;
                }
            }
        } else {
            regex = new RegExp("[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*" + match.join("[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*|[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*") + "[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*","gi");
            data[i][column] = data[i][column].replace(regex, replace);
        }

        return data;
    };

    var substituteCellValues = function (data, column, match, replace, isExact) {
        var i,
            match_length = match.length;

        if (isExact) {
            for (i = 0; i < match_length; i++) {
                match[i] = match[i].toLowerCase();
            }

            if (match.indexOf(data[column].toLowerCase()) > -1) {
                data[column] = replace;
            }
        } else {
            regex = new RegExp("[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*" + match.join("[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*|[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*") + "[a-z A-Z0-9\\(\\)\\!\\@\\#\\$\\%\\^\\&\\*\\_\\+\\-\\=\\[\\]\\{\\}\\;\\'\\:\\\"\\\\\\/\\|\\, ]*","gi");
            data[column] = data[column].replace(regex, replace);
        }

        return data;
    };

    var concatColumns = function (data, columns, delimeter, new_column) {
        var data_length = data.length,
            i,
            columns_length = columns.length,
            j;

        for (i = 0; i < data_length; i++) {
            data[i][new_column] = "";
            for (j = 0; j < columns_length; j++) {
                data[i][new_column] += data[i][columns[j]];
            }
        }

        return data;
    };

    var concatCells = function (data, columns, delimeter, new_column) {
        var columns_length = columns.length,
            j;

        data[new_column] = "";
        for (j = 0; j < columns_length; j++) {
            data[new_column] += data[columns[j]];
        }

        return data;
    };

    // var removeHostName = function (data, column, new_column) {
    //     var data_length = data.length,
    //         i,
    //         split;
    //
    //     for (i = 0; i < data_length; i++) {
    //         split = data[i][column].split("/");
    //         data[i][new_column] = split[0] + "//" + split[2];
    //     }
    // };

    TimeSeries.mediator.subscribe("dataProcessing",dataProcessing);
    TimeSeries.mediator.subscribe("heapSort",heapSort);
    TimeSeries.mediator.subscribe("findMissingDataPoint",findMissingDataPoint);
    TimeSeries.mediator.subscribe("simplifyDataset",simplifyDataset);
    TimeSeries.mediator.subscribe("transformGAData",transformGAData);
    TimeSeries.mediator.subscribe("transformGSXData",transformGSXData);
    TimeSeries.mediator.subscribe("downloadDataURI",downloadDataURI);

    return {
        dataProcessing : dataProcessing,
        sort : heapSort,
        simplifyDataset : simplifyDataset,
        /* start-test-block */
        findMissingDataPoint: findMissingDataPoint,
        /* end-test-block */
        mmm_array: mmm_array,
        mmmm_array: mmmm_array,
        week_day_array: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    };
})();

/**
@author Pykih developers
@module read data module
@namespace TimeSeries
**/

TimeSeries.getData = (function(){
    /**
    *   @function: getDataFormat
    *   @param {String | Object} data - Object which holds data or string which is either csv string or data file path.
    *   @returns {String} Format of the data.
    *   @description: It internally checks if user has passed csv string or json string or json object or csv or json file.
    */
    var getDataFormat = function(data, options) {
        var format;
            // dot_index =  data ? data.lastIndexOf(".") : null,
            //len = data.length;

        if (options.dataFormat !== "smartDefault") {
            format = options.dataFormat;
        } else if (data.constructor == Array) {
            format = "json_obj";
        } else if(data.indexOf("[")!= -1 && data.indexOf("{")!= -1) {
            format = "json_string";
        } else if(typeof data === "string" && data.indexOf(",")!= -1) {
            format = "csv_string";
        } else if (data.indexOf(".json") > -1) {
            format = "json";
        } else if (data.indexOf(".csv") > -1) {
            format = "csv";
        } else if (data.indexOf("json") > -1) {
            format = "json";
        } else if (data.indexOf("csv") > -1) {
            format = "csv";
        }

        // else if(dot_index) {
        //     format = data.substring(dot_index+1,len);
        //     format = (format === "json" || format === "csv") ? format : "";
        // }
        return format;
    };

    /**
    *   @function: getData
    *   @param {String | Object} data - Object which holds data or string which is either csv string or data file path.
    *   @description: It gets the data format and then based on the formagt it parses the data. If the data is in invalid format it throws error in the console.
    */
    var parseData = function(data, callBack, parameters, inner_callbacks, feature) {
        var chart_selector = parameters.options.selector,
            format = getDataFormat(data, parameters.options),
            xhttp;
        if(TimeSeries.chart_status[chart_selector].status === false) {
            TimeSeries.chart_status[chart_selector].status = "inprogress";
        }
        switch (parameters.options.dataSource) {
            case "google-analytics":
                var data_source,
                    ga_data;
                xhttp = new XMLHttpRequest();
                data_source = TimeSeries.mediator.publish("createGAQuery", parameters.options);
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        console.log(JSON.parse(xhttp.responseText));
                        ga_data = TimeSeries.mediator.publish("transformGAData", JSON.parse(xhttp.responseText), parameters.options);
                        TimeSeries.mediator.publish(callBack, parameters, ga_data, inner_callbacks, feature);
                    }
                };
                data_source = data_source[data_source.name];

                xhttp.open("GET", data_source.query , true);
                xhttp.send();
            break;
            case "google-sheets":
                var query = TimeSeries.mediator.publish("createGSXQuery", parameters.options),
                    gsx_data;
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        console.log(JSON.parse(xhttp.responseText));
                        gsx_data = TimeSeries.mediator.publish("transformGSXData", JSON.parse(xhttp.responseText), parameters.options);
                        console.log("gsx_data", gsx_data);
                        TimeSeries.mediator.publish(callBack, parameters, gsx_data, inner_callbacks, feature);
                    }
                };
                xhttp.open("GET", query , true);
                xhttp.setRequestHeader("Authorization", "Bearer " + parameters.options.accessToken);
                xhttp.send();
            break;
            case "":

                switch(format) {
                    case "json_obj":
                        TimeSeries.mediator.publish(callBack, parameters, data, inner_callbacks, feature);
                    break;
                    case "json_string":
                        data = JSON.parse(data);
                        TimeSeries.mediator.publish(callBack, parameters, data, inner_callbacks, feature);
                        //callBack(parameters);
                    break;
                    case "csv_string":
                        data = Papa.parse(data);
                        TimeSeries.mediator.publish(callBack, parameters, data.data, inner_callbacks, feature);
                        //callBack(parameters);
                    break;
                    case "json":
                        d3.json(data,function(data){
                            TimeSeries.mediator.publish(callBack, parameters, data, inner_callbacks, feature);
                            //callBack(parameters);
                        });
                    break;
                    case "csv":
                        Papa.parse(data, {
                            download: true,
                            header:true,
                            // fastMode:false,
                            complete:function(data) {
                                TimeSeries.mediator.publish(callBack, parameters, data.data, inner_callbacks, feature);
                                //callBack(parameters);
                            }
                        });
                    break;
                }
            break;
        }
    };

    var parseGlobalData = function (data, callBack, dataset) {
         var obj = TimeSeries.global_data_sets[dataset];
            format = getDataFormat(data, obj);

        if(TimeSeries.data_load_status[dataset].status === false) {
            TimeSeries.data_load_status[dataset].status = "inprogress";
        }

        switch (obj.dataSource) {
            case "google-analytics":
                var data_source,
                    xhttp = new XMLHttpRequest(),
                    ga_data;
                data_source = TimeSeries.mediator.publish("createGAQuery", obj);
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        ga_data = TimeSeries.mediator.publish("transformGAData", JSON.parse(xhttp.responseText), obj);
                        TimeSeries.data_load_status[dataset].status = "complete";
                        TimeSeries.global_data_sets[dataset].raw_data = ga_data;
                        console.time("dataSource");
                        TimeSeries.mediator.publish(callBack, dataset, "data", ga_data);
                        console.timeEnd("dataSource");
                    }
                };
                data_source = data_source[data_source.name];

                xhttp.open("GET", data_source.query , true);
                xhttp.send();
            break;
            case "google-sheets":
                var query = TimeSeries.mediator.publish("createGSXQuery", obj),
                    gsx_data;
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        gsx_data = TimeSeries.mediator.publish("transformGSXData", JSON.parse(xhttp.responseText), obj);
                        TimeSeries.data_load_status[dataset].status = "complete";
                        TimeSeries.global_data_sets[dataset].raw_data = gsx_data;
                        TimeSeries.mediator.publish(callBack, dataset, "data", gsx_data);
                    }
                };
                xhttp.open("GET", query , true);
                xhttp.setRequestHeader("Authorization", "Bearer " + obj.accessToken);
                xhttp.send();
            break;
            case "":
            TimeSeries.data_load_status[dataset].status = "complete";
                switch(format) {
                    case "json_obj":
                        //TimeSeries.data_load_status[dataset].status = "complete";
                        TimeSeries.mediator.publish(callBack, dataset, "data", data);
                    break;
                    case "json_string":
                        data = JSON.parse(data);
                        //TimeSeries.data_load_status[dataset].status = "complete";
                        TimeSeries.mediator.publish(callBack, dataset, "data", data);
                        //callBack(dataset);
                    break;
                    case "csv_string":
                        data = Papa.parse(data);
                        //TimeSeries.data_load_status[dataset].status = "complete";
                        TimeSeries.mediator.publish(callBack, dataset, "data", data);
                        //callBack(dataset);
                    break;
                    case "json":
                        d3.json(data,function(data){
                            //TimeSeries.data_load_status[dataset].status = "complete";
                            TimeSeries.mediator.publish(callBack, dataset, "data", data);
                            //callBack(dataset);
                        });
                    break;
                    case "csv":
                        Papa.parse(data, {
                            download: true,
                            header:true,
                            // fastMode:false,
                            complete:function(data) {
                                TimeSeries.mediator.publish(callBack, dataset, "data", data.data);
                                //callBack(dataset);
                            }
                        });
                    break;
                }
            break;
        }
    };

    TimeSeries.mediator.subscribe("parseData",parseData);
    TimeSeries.mediator.subscribe("parseGlobalData",parseGlobalData);
    TimeSeries.mediator.subscribe("getDataFormat",getDataFormat);
    return {
        parseData: parseData,
        getDataFormat: getDataFormat
    };
}());
/**
@author Pykih developers
@module numberFormatFunctions
@namespace TimeSeries
*/
TimeSeries.numberFormatFunctions = (function() {
    /**
    @Function: dateFormatter
    @param {string} format - The directive for the output i.e. the output format
    @param {string} number - Input number to be converted
    @returns {Number} - returns converted number date using the specified directive
    @description: Used to change the format of the number while displaying in axis, tooltip etc.
    */
    var  numberFormatter = function numberFormatter(format, number) {
        return d3.format(format)(number);
    };

    TimeSeries.mediator.subscribe("numberFormatter",numberFormatter);
    return {
        numberFormatter : numberFormatter
    };

}());

/**
@author Pykih developers
@module dateFormatFunctions
@namespace TimeSeries
*/
TimeSeries.dateFormatFunctions = (function() {
    var dateFormatRegex = function () {
        var dateformats = [
            {
                format: ["YYYY MM DD", "YYYY M D", "YYYY MMM DD", "YYYY MMMM DD"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})$/i,
                mapping:[0,1,2,-2,-2,-2]
            },
            {
                format: ["YYYY MM DD hh:mm:ss", "YYYY M D hh:mm:ss", "YYYY MMM DD hh:mm:ss", "YYYY MMMM DD hh:mm:ss"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[0,1,2,3,4,5]
            },
            {
                format: ["YYYY MM DD hh:mm", "YYYY M D hh:mm", "YYYY MMM DD hh:mm", "YYYY MMMM DD hh:mm"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[0,1,2,3,4,-2]
            },
            {
                format: ["YYYY MM DD hh", "YYYY M D hh", "YYYY MMM DD hh", "YYYY MMMM DD hh"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2}) (\d{1,2})$/i,
                mapping:[0,1,2,3,-2,-2]
            },
            {
                format: ["MM DD YYYY", "M D YYYY"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4})$/i,
                mapping:[2,0,1,-2,-2,-2],
                test: ["DD MM YYYY", "D M YYYY"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MM DD YYYY hh:mm:ss", "M D YYYY hh:mm:ss"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,5],
                test: ["DD MM YYYY hh:mm:ss", "D M YYYY hh:mm:ss"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MM DD YYYY hh:mm", "M D YYYY hh:mm"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,-2],
                test: ["DD MM YYYY hh:mm", "D M YYYY hh:mm"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MM DD YYYY hh", "M D YYYY hh"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2})$/i,
                mapping:[2,0,1,3,-2,-2],
                test: ["DD MM YYYY hh" , "D M YYYY hh"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MMM DD YYYY", "MMMM DD YYYY"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4})$/i,
                mapping:[2,0,1,-2,-2,-2]
            },
            {
                format: ["MMM DD YYYY hh:mm:ss", "MMMM DD YYYY hh:mm:ss"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,5]
            },
            {
                format: ["MMM DD YYYY hh:mm", "MMMM DD YYYY hh:mm"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,-2]
            },
            {
                format: ["MMM DD YYYY hh", "MMMM DD YYYY hh"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2})$/i,
                mapping:[2,0,1,3,-2,-2]
            },
            {
                format: ["DD MMM YYYY", "DD MMMM YYYY"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4})$/i,
                mapping:[2,1,0,-2,-2,-2]
            },
            {
                format: ["DD MMM YYYY hh:mm:ss", "DD MMMM YYYY hh:mm:ss"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[2,1,0,3,4,5]
            },
            {
                format: ["DD MMM YYYY hh:mm", "DD MMMM YYYY hh:mm"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[2,1,0,3,4,-2]
            },
            {
                format: ["DD MMM YYYY hh", "DD MMMM YYYY hh"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4}) (\d{1,2})$/i,
                mapping:[2,1,0,3,-2,-2]
            },
            {
                format: ["YYYY MM"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))$/i,
                mapping:[0,1,-2,-2,-2,-2]
            },
            {
                format: ["YYYY"],
                regex: /^(\d{4})$/,
                mapping:[0,-2,-2,-2,-2,-2]
            },
            {
                format: ["hh:mm:ss"],
                regex: /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
                mapping:[-2,-2,-2,0,1,2]
            },
            {
                format: ["hh:mm"],
                regex: /^(\d{1,2}):(\d{1,2})$/,
                mapping:[-2,-2,-2,0,1,-2]
            },
            {
                format: ["hh"],
                regex: /^(\d{1,2})$/,
                mapping:[-2,-2,-2,0,-2,-2]
            },
            {
                format: ["YYYY-MM-DDThh:mm:ss"],
                regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
                mapping:[0,1,2,3,4,5]
            },
            {
                format: ["YYYY-MM-DDThh:mm"],
                regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{1,2})$/,
                mapping:[0,1,2,3,4,-2]
            },
            {
                format: ["YYYY-MM-DDThh:mm:ss"],
                regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2})$/,
                mapping:[0,1,2,3,-2,-2]
            },
            {
                format: ["DAY, DD MMM YYYY", "DAY, DD MMMM YYYY"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})$/i,
                mapping:[3,2,1,-2,-2,-2]
            },
            {
                format: ["DAY, DD MMM YYYY hh:mm:ss", "DAY, DD MMMM YYYY hh:mm:ss"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})[ |,](\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[3,2,1,4,5,6]
            },
            {
                format: ["DAY, DD MMM YYYY hh:mm", "DAY, DD MMMM YYYY hh:mm"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})[ |,](\d{1,2}):(\d{1,2})$/i,
                mapping:[3,2,1,4,5,-2]
            },
            {
                format: ["DAY, DD MMM YYYY hh", "DAY, DD MMMM YYYY hh"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})[ |,](\d{1,2})$/i,
                mapping:[3,2,1,4,-2,-2]
            },
            {
                format: ["DAY, MMM DD YYYY", "DAY, MMMM DD YYYY"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})$/i,
                mapping:[3,1,2,-2,-2,-2]
            },
            {
                format: ["DAY, MMM DD YYYY hh:mm:ss", "DAY, MMMM DD YYYY hh:mm:ss"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})[ |,](\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[3,1,2,4,5,6]
            },
            {
                format: ["DAY, MMM DD YYYY hh:mm", "DAY, MMMM DD YYYY hh:mm"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})[ |,](\d{1,2}):(\d{1,2})$/i,
                mapping:[3,1,2,4,5,-2]
            },
            {
                format: ["DAY, MMM DD YYYY hh", "DAY, MMMM DD YYYY hh"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})[ |,](\d{1,2})$/i,
                mapping:[3,1,2,4,-2,-2]
            },
            {
                format: ["YYYYMMDD"],
                regex: /^(\d{8})$/,
                mapping:[0,1,2,-2,-2,-2]
            },
            {
                format: ["YYYYMMDDHH"],
                regex: /^(\d{10})$/,
                mapping:[0,1,2,3,-2,-2]
            },
            {
                format: ["YYYYMMDDHHMM"],
                regex: /^(\d{12})$/,
                mapping:[0,1,2,3,4,-2]
            },
            {
                format: ["YYYYMMDDHHMMSS"],
                regex: /^(\d{14})$/,
                mapping:[0,1,2,3,4,5]
            }
        ];
        return dateformats;
    };

    var detectDateFormat = function (selector,data, date_field_name) {
        var dateformats = dateFormatRegex(),
            data_length =  data.length,
            format_lenth = dateformats.length,
            format_data,
            regex_data,
            format,
            value = data[0][date_field_name],
            actual_year,
            parsed_year;

        if (!value) {
            warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format (non string). Please enter data with valid date format.");
            return {"format":"Invalid format"};
        }
        if (typeof value === "number") {
            format_data = {"format": "TimeStamp"};
            format = "TimeStamp";
        } else if (value.match(dateformats[17].regex)) {
            format_data = dateformats[17];
            format = format_data.format[0];
        } else if (value.match(dateformats[32].regex)) {
            format_data = {"format": "YYYYMMDD"};
            format = "YYYYMMDD";
        } else if (value.match(dateformats[33].regex)) {
            format_data = {"format": "YYYYMMDDHH"};
            format = "YYYYMMDDHH";
        } else if (value.match(dateformats[34].regex)) {
            format_data = {"format": "YYYYMMDDHHMM"};
            format = "YYYYMMDDHHMM";
        } else if (value.match(dateformats[35].regex)) {
            format_data = {"format": "YYYYMMDDHHMMSS"};
            format = "YYYYMMDDHHMMSS";
        } else {
            for (var j = 0; j < format_lenth; j++) {
                if (value.match(dateformats[j].regex)) {
                    format_data = dateformats[j];
                    format = format_data.format[0];
                    break;
                } else if (!isNaN(value)) {
                    format_data = {"format": "TimeStamp"};
                    format = "TimeStamp";
                    break;
                }
            }
        }

        ///////////////////////////////////////////////////////
        /*
            Remove the format for YYYY MM after which remove the if condition below....

        */
        //////////////////////////////////////////////////////

        if (format_data &&format_data.format[0] === "YYYY MM") {
            warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format (YYYY MM). Please enter data with valid date format.");
            return {"format":"Invalid format"};
        }
        if (format_data && format_data.format !== "TimeStamp" && format_data.format !== "YYYYMMDD" && format_data.format !== "YYYYMMDDHH" && format_data.format !== "YYYYMMDDHHMM" && format_data.format !== "YYYYMMDDHHMMSS") {
            actual_year =  new Date(value).getFullYear();
            parsed_year = value.match(format_data.regex)[format_data.mapping[0] + 1];

            if (actual_year.toString() !== parsed_year) {
                warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format.Please enter data with valid date format.");
                return {"format":"Invalid format"};
            }
        }

        if(!format_data) {
            warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format.Please enter data with valid date format.");
            return {"format":"Invalid format"};
        }

        return {
            "format_data":format_data,
            "format": format
        };
    };

    /**
    @Function: dateFormatter
    @param {string} format - The directive for the output i.e. the output format
    @param {string} date - Input date in timestamp
    @returns {Number / String / Function} - returns either the formatted date or the function which will convert the date using the specified directive
    @description: Used to change the format of the date while displaying in axis, tooltip etc.
    */
    var dateFormatter = function (format, date) {
        if (format === "multi" && date) {
            return d3.time.format.multi([
                [".%L", function(d) { return d.getMilliseconds(); }],
                [":%S", function(d) { return d.getSeconds(); }],
                ["%I:%M", function(d) { return d.getMinutes(); }],
                ["%I %p", function(d) { return d.getHours(); }],
                ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                ["%b %d", function(d) { return d.getDate() != 1; }],
                ["%b", function(d) { return d.getMonth(); }],
                ["%Y", function() { return true; }]
            ])(date);
        } else if (format === "multi") {
            return d3.time.format.multi([
                [".%L", function(d) { return d.getMilliseconds(); }],
                [":%S", function(d) { return d.getSeconds(); }],
                ["%I:%M", function(d) { return d.getMinutes(); }],
                ["%I %p", function(d) { return d.getHours(); }],
                ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                ["%b %d", function(d) { return d.getDate() != 1; }],
                ["%B", function(d) { return d.getMonth(); }],
                ["%Y", function() { return true; }]
            ]);
        } else if (date) {
            return d3.time.format(format)(date);
        } else {
            return d3.time.format(format);
        }
    };

    TimeSeries.mediator.subscribe("detectDateFormat",detectDateFormat);
    TimeSeries.mediator.subscribe("dateFormatter",dateFormatter);

    return {
        detectDateFormat : detectDateFormat,
        dateFormatter : dateFormatter,
        /* start-test-block */
        dateFormatRegex : dateFormatRegex
        /* end-test-block */
    };

}());

TimeSeries.default.mandatory_configs = {
    "selector": {validate_for: "existsOnDOM", "mandatory": true, validateIf:true},
    // "data": {validate_for: ["string", "array", "object"], "mandatory": true, validateIf:true},
    "dateColumnName": {validate_for: "string", "mandatory": true, validateIf:true},
    "metricsColumnName": {validate_for: "array", "mandatory": true, validateIf:true}
};

TimeSeries.default.chart_options = {
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

    // Data
    "isDataSorted": {value: true,  validateIf:true, validate_for:"boolean"},
    "dataFormat": {value: "smartDefault", validateIf:true, validate_for:"specificValues", specific_values:["json","csv"]},
    "dataSource": {value: "", validateIf: true, validate_for: "string"},
    "gaId": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    "startDate": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    "endDate": {value: "", validateIf:["dataSource",true], validate_for: "string"},
    "accessToken": {value: "", validateIf:["dataSource",true], validate_for: "string"},

    "numberprefix": {value: "",  validateIf:true, validate_for: "string"},
    "numbersuffix": {value: "",  validateIf:true, validate_for: "string"},

    // Simplify Dataset
    "simplifyDataset": {value: true,  validate_for:"boolean", validateIf:true},

    // Data points per pixel
    "dataPointsPerPixel": {value: 0.1, validateIf:true, validate_for: "number"},

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

    "showChartBorder":{value: true,  validateIf:true, validate_for:"boolean"},
    "enableDimensionalAnalysis": {value: true,  validateIf:true, validate_for:"boolean"}
};


TimeSeries.default.mandatory_filter_configs = {
    "selector": {validate_for: "existsOnDOM", "mandatory": true, validateIf:true}
};

TimeSeries.default.filter_configs = {};

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

/**
@author Pykih developers
@module xAxisFunctions
@namespace TimeSeries
*/
TimeSeries.xAxisFunctions = (function() {
    /**
    @Function: xScale
    @description: xScale for setting the domain and range of the x-axis
    */
    var scale = function (domain, range) {
        return d3.time.scale()
            .domain(domain)
            .range(range);
    };
    var createAxisGroup = function(options,svg,x_translate,y_translate){
        var group = svg.append("g")
           .attr({
                "id": "xaxis",
                "class": "x axis",
                "transform":"translate(" + x_translate + "," + y_translate + ")"
            });
        return group;
    };
    /**
    *   @function: axis
    *   @param {Object} options - An object of valid chart configurations.
    *   @param {String} scale - Axis scale.
    *   @returns {Function} A d3 axis function.
    *   @description: It creates a d3 axis.
    */
    var axis = function(options, scale) {
        // console.log(options.xAxisNoOfTicks, "options.xAxisNoOfTicks xaxis");
        var tickValues = validateTickValues(options.selector,options.xAxisTickValues),
            tickIntervalGranularity = intervalGranularity(options.xAxisTickIntervalGranularity),
            tickFormat = TimeSeries.dateFormatFunctions.dateFormatter,
            numberFormatter = TimeSeries.numberFormatFunctions.numberFormatter,
            configXAxisTickValuesFormat = TimeSeries.chart_configs[options.selector].xAxisTickValuesFormat,
            axisFunc = d3.svg.axis()
                .scale(scale)
                .orient(options.xAxisPosition)
                .ticks(options.xAxisNoOfTicks)
                .tickSize(options.xAxisTickSize)
                .tickValues(tickValues)
                .tickPadding(options.xAxisTickPadding)
                .tickFormat(function(d,i){
                    if (configXAxisTickValuesFormat) {
                        return numberFormatter(configXAxisTickValuesFormat,d);
                    } else if(options.xAxisTickValuesFormat.constructor === Function) {
                        return options.xAxisTickValuesFormat(d,i);
                    } else {
                        return tickFormat(options.xAxisTickValuesFormat, d);
                    }
                })
                .outerTickSize(options.xAxisOuterTickSize);

        if(tickIntervalGranularity.d3Time) {
            axisFunc.ticks(tickIntervalGranularity.d3Time,options.xAxisTickInterval);
        }
        return axisFunc;
    };
    /**
    *   @function: setCSSCo nfigs
    *   @param {String} options - An object of valid chart configurations.
    *   @description: It sets the font-size, style, family and color of tick values.
    *   It also sets the color and width of the axis line and the color of the ticks.
    */
    var setCSSConfigs = function(options) {
        //Tick labels
        d3.selectAll("#"+ options.selector + "_svg_group" + " .x.axis text")
            .style({
                "font-size" : options.xAxisTickValueSize + "px",
                "font-weight" : options.xAxisTickValueStyle,
                "font-family" : options.xAxisTickValueFontFamily,
                "fill" : options.xAxisTickValueColor
            });
        //Line
        d3.selectAll("#"+ options.selector + "_svg_group" + " .x.axis path")
          .style({
            "stroke" : options.xAxisLineColor,
            "stroke-width" : options.xAxisLineThickness + "px",
            "opacity": options.xAxisLineOpacity
          });
        //Ticks
        d3.selectAll("#"+ options.selector + "_svg_group" + " .x.axis line")
          .style({
            "stroke" : options.xAxisTickColor,
            "opacity": options.xAxisTickOpacity,
            "stroke-width": options.xAxisTickThickness
          });
    };
    /**
    *   @function: validateTickValues
    *   @param {String} array - An array tick values.
    *   @returns {String} An array with validated tick values or null.
    *   @description: It validates the tick values array (for valid date values) passed by the user.
    */
    var validateTickValues = function (selector,array) {
        if(array === "smartDefault" || array === undefined || array.length === 0){
            return null;
        }
        if (TimeSeries.chart_options[selector] && TimeSeries.chart_options[selector].chartType === "column") {
            return array;
        }
        var i,
            modified_array = [],
            length = array.length,
            date_format;

        for(i=0;i<length;i++) {
            date_format = TimeSeries.mediator.publish("detectDateFormat",selector,[{x:array[i]}],"x");
            if(TimeSeries.validation.dataTypes(array[i],"date") && (date_format.format !== "Invalid format")) {
                modified_array.push(array[i]);
            } else {
                warningHandling(TimeSeries.errors.invalidConfig("xAxisTickValue: "+array[i]+" invalid date type",selector));
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
            tickValues = validateTickValues(options.xAxisTickValues);
        var grid = d3.svg.axis()
                      .scale(scale)
                      .orient(options.xAxisPosition)
                      .ticks(options.xAxisNoOfTicks)
                      .tickSize(-chart_configs.height)
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
                            "id": "xaxis_grid",
                            "class": "x grid",
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
        d3.selectAll("#"+ options.selector + "_svg_group .x.grid line")
          .style({
            "stroke" : options.gridColor,
            "opacity" : options.gridOpacity/100
          });
    };
    /**
    *   @function: intervalGranularity
    *   @param {String} granularity - An object of valid chart configurations.
    *   @returns {Object} An object that has the d3 time property and other property as format.
    *   @description: It retruns an object that has d3.time and format properties.
    */
    var intervalGranularity = function(granularity) {
        switch(granularity) {
            case "second":
                return {
                    d3Time:d3.time.second,
                    format:"%S"
                };
            case "minute":
                return {
                    d3Time:d3.time.minute,
                    format:"%M"
                };
            case "hour":
                return {
                    d3Time:d3.time.hour,
                    format:"%H"
                };
            case "day":
                return {
                    d3Time:d3.time.day,
                    format:"%d"
                };
            case "month":
                return {
                    d3Time:d3.time.month,
                    format:"%b"
                };
            case "year":
                return {
                    d3Time:d3.time.year,
                    format:"%Y"
                };
            default:
                return {
                    d3Time: null,
                    format: null
                };
        }
    };

    return {
        scale: scale,
        createAxisGroup: createAxisGroup,
        axis: axis,
        setCSSConfigs: setCSSConfigs,
        validateTickValues: validateTickValues,
        createGrid: createGrid,
        createGridGroup: createGridGroup,
        setGridCSS: setGridCSS,
        intervalGranularity:intervalGranularity
    };
}());

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
/**
@author Pykih developers
@module columnChartFunctions
@namespace TimeSeries
*/
TimeSeries.columnChartOrdinalFunctions = (function() {
    var renderColumnChart = function(options) {
        var xAxis = TimeSeries.xAxisFunctions,
            yAxis = TimeSeries.yAxisFunctions,
            svg,
            group,
            xGroup,
            yGroup,
            plot_group,
            x_translate = [],
            y_translate = [],
            chart_configs = TimeSeries.chart_configs[options.selector];

        y_translate[0] = (options.yAxisPosition === "right") ? (options.width - options.marginLeft - options.marginRight) : 0; // translate x for y-axis
        y_translate[1] =  0;// translate y for y-axis
        chart_configs.previousGroupsHeight = 0;

        svg = TimeSeries.mediator.publish("createSVG", options); //TimeSeries.svgRendererFunctions.createSVG(options);

        TimeSeries.mediator.publish("addCaption",options,svg);
        TimeSeries.mediator.publish("addSubCaption",options,svg);
        group = TimeSeries.mediator.publish("createGroup", options,svg,options.marginLeft,options.marginTop,(options.selector + "_svg_group"));

        plot_group = TimeSeries.mediator.publish("createGroup",options,group,y_translate[0],y_translate[1],options.selector + "_plot_group");
        if(options.showXAxis) {
            x_translate[0] = 0; // translate x for x-axis
            x_translate[1] = (options.xAxisPosition === "bottom") ? (options.height - options.marginTop - options.marginBottom) : 0; // translate y for x-axis
            xGroup = xAxis.createAxisGroup(options,group,x_translate[0],x_translate[1]); // group to place x-axis
        }

        if(options.showYAxis) {
            yGroup = yAxis.createAxisGroup(options,group,y_translate[0],y_translate[1]);
        }
    };

    var columnChartOrdinal = function(options,data, feature) {
        var x_axis,
            y_axis,
            svg,
            group,
            xAxis = TimeSeries.xAxisFunctions,
            yAxis = TimeSeries.yAxisFunctions,
            height = (options.height - options.marginTop - options.marginBottom),
            width = (options.width - options.marginLeft - options.marginRight),
            x_domain = [],
            y_domain = [],
            xGroup,
            yGroup,
            plot_group,
            overlay,
            column_name = options.metricsColumnName,
            selector = options.selector,
            chart_configs = TimeSeries.chart_configs[options.selector],
            date_column_name = options.dateColumnName,
            metrics_column_name = options.metricsColumnName[0],
            column,
            query_object = {'sort':{'asc':'dataquerykey'}},
            interaction = options.interaction,
            tickFormat = TimeSeries.dateFormatFunctions.dateFormatter,
            no_of_ticks_on_xaxis,
            tick_values = [];

        if (!feature) {
            if (typeof column_name === "object") {
                // TimeSeries.Query.addFilter(selector, column_name.seriesColumnName, [{
                //     "column":column_name.seriesColumnName,
                //     "condition":"Equal",
                //     "values":column_name.seriesName
                // }]);
                query_object.filter = {"column":column_name.seriesColumnName, "condition":"Equal", "values":column_name.seriesName};
                data = TimeSeries.Query.getData(selector, column_name.seriesColumnName, query_object);
                // TimeSeries.Query.removeFilter(options.selector, column_name.metric+"_"+column_name.seriesName, [{"column":column_name.seriesColumnName}]);
            } else {
                data = TimeSeries.Query.getData(selector, column_name, query_object);
            }
        }

        chart_configs.height = height;
        chart_configs.width = width;

        x_domain[0] = d3.min(data, function(d) { return d.key; });
        x_domain[1] = d3.max(data, function(d) { return d.key; });

        y_domain[0] = 0;
        y_domain[1] = d3.max(data, function(d) { return +d.value; });

        chart_configs.svg = svg = d3.select("#" + options.selector + "_svg");
        chart_configs.group = group = d3.select("#" + options.selector + "_svg_group");
        chart_configs.xGroup = xGroup = d3.select("#" + options.selector + "_svg_group #xaxis");
        chart_configs.yGroup = yGroup = d3.select("#" + options.selector + "_svg_group #yaxis");

        chart_configs.xScale = xScale = xAxis.scale(x_domain,[0,width]);
        chart_configs.yScale = yScale = yAxis.scale(y_domain,[height,0]);
        chart_configs.yAxis = y_axis = yAxis.axis(options,yScale);

        var fakeOrdinanalScale = d3.scale.ordinal()
            .domain(data.map(function(d,i) {
                return new Date(d.key);
            }))
            .rangeRoundBands([0, width], 0.1);

        chart_configs.fakeOrdinanalScale = fakeOrdinanalScale;
        chart_configs.xAxis = x_axis = xAxis.axis(options,fakeOrdinanalScale);

        x_axis.tickFormat(function(d,i){
            if(options.xAxisTickValuesFormat.constructor === Function) {
                return options.xAxisTickValuesFormat(d,i);
            } else {
                return tickFormat(options.xAxisTickValuesFormat, d);
            }
        });

        plot_group = d3.select("#" + options.selector + "_plot_group");
        chart_configs.column = column = plot_group.selectAll(".column").data(data);

        column.exit().remove();

        column.enter()
            .append("rect")
            .attr("class", "column");

        column.style("fill", function () {
                if (options.isTimeNavigator) {
                    return "url(#"+selector+"_gradient)";
                } else {
                    return options.chartColor[0];
                }
            })
            .style("stroke-width",options.borderThickness)
            .style("stroke",options.bordercolor)
            .attr("x", function(d) { return fakeOrdinanalScale(new Date(d.key)); })
            .attr("width", fakeOrdinanalScale.rangeBand())
            .transition().duration(options.chartTransitionSpeed*1000)
            .attr("y", function(d) { return !d.value ? 0 : yScale(d.value); })
            .attr("height", function(d) { return !d.value ? 0 : (height - yScale(+d.value)); });

        plot_group.attr("clip-path", "url(#" + options.selector + "_clip)");
        TimeSeries.mediator.publish("createOverlay",plot_group,width,height,options);
        xGroup.call(x_axis);
        yGroup.call(y_axis);
        xAxis.setCSSConfigs(options);
        yAxis.setCSSConfigs(options);
        TimeSeries.mediator.publish("xAxisTitle",options.selector);
        TimeSeries.mediator.publish("yAxisTitle",options.selector);
    };

    TimeSeries.mediator.subscribe("renderColumnChart",renderColumnChart);
    TimeSeries.mediator.subscribe("columnChartOrdinal",columnChartOrdinal);

    return {
        columnChart: columnChartOrdinal,
    };
}());
// Create an immediately invoked functional expression to wrap our code
TimeSeries.modal = (function() {

    // Public Methods
    // Define our constructor
    var dispatch = d3.dispatch("click");
    TimeSeries.clubFeaturesInModal = {
        "edit": ["impactSwitch", "smoothing", "anomalyDetection", "viewRawData", "growthViews"],
        "timeNavigator": ["timeNavigator"],
        "smoothing": ["impactSwitch", "smoothing", "anomalyDetection", "viewRawData", "growthViews"],
        "anomalyDetection": ["impactSwitch", "smoothing", "anomalyDetection", "viewRawData", "growthViews"],
    };
    TimeSeries.featureAlias = {
        "viewRawData": {
            alias: "Chart",
            show_status: false
        },
        "timeNavigator": {
            alias: "Chart",
            show_status: false
        },
        "smoothing": {
            alias: "Reduce Noise",
            show_status: true
        },
        "anomalyDetection": {
            alias: "Detect Anomalies",
            show_status: true
        },
        "impactSwitch": {
            alias: "Filters",
            show_status: true
        },
        "growthViews": {
            alias: "Growth Views",
            show_status: true
        }
    };
    var init = function (options) {
        console.log("modal init");
        // Create global element references
        this.closeButton = null;
        this.modal = null;
        this.overlay = null;

        // Determine proper prefix
        this.transitionEnd = transitionSelect();

        // Define option defaults
        var defaults = {
            autoOpen: false,
            className: 'fade-and-drop',
            closeButton: true,
            content: "",
            overflow: "hidden",
            overlay: true
        };

        if (options.modal_type === "iOS") {
            defaults.minWidth = "80%";
            defaults.maxWidth = "80%";
            defaults.minHeight = "80%";
            defaults.maxHeight = "80%";
            defaults.top = "10%";
            defaults.left = "10%";
        } else {
            defaults.minWidth = "50%";
            defaults.maxWidth = "50%";
            defaults.minHeight = "50%";
            defaults.maxHeight = "50%";
            defaults.top = "25%";
            defaults.left = "25%";
        }

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        // if(this.options.autoOpen === true) this.open();
        open.call(this);
    };
    var close = function (chart_selector, showHighlight) {
        // document.getElementById("help").style.zIndex = 9999;
        var _ = this,
            svg;
        this.modal.className = this.modal.className.replace(" scotch-open", "");
        this.overlay.className = this.overlay.className.replace(" scotch-open","");
        this.modal.addEventListener(this.transitionEnd, function() {
            // console.log(_.modal,_.modal.parentNode)
            _.modal.parentNode.removeChild(_.modal);
        });
        this.overlay.addEventListener(this.transitionEnd, function() {
            if(_.overlay.parentNode) _.overlay.parentNode.removeChild(_.overlay);
        });
        if (chart_selector) {
            svg = document.getElementById(chart_selector+"_svg");
            // svg.setAttribute("width",svg.getAttribute("data-width") + "px");
            // svg.setAttribute("height",svg.getAttribute("data-height") + "px");
            svg.setAttribute("width",TimeSeries.chart_options[chart_selector].width + "px");
            svg.setAttribute("height",TimeSeries.chart_options[chart_selector].height + "px");
            document.getElementById(chart_selector).appendChild(svg);
        }
        // if(typeof chart_selector === "string") {
        if (TimeSeries.chart_configs[chart_selector]) {
            var wasLiveDataPaused = TimeSeries.chart_configs[chart_selector].wasLiveDataPaused;
            if (!wasLiveDataPaused) {
                TimeSeries.mediator.publish("resumeLiveData",chart_selector + "_cfr");
            }
            if (showHighlight) {
                d3.select("#" + chart_selector + "_highlight")
                    .style({
                        "visibility": "visible",
                        "opacity": "0.4"
                    })
                    .transition()
                    .duration(800)
                    .ease("linear")
                    .style({
                        "opacity": "0",
                        //"visibility": "hidden"
                    })
                    .transition()
                    .style({
                        "visibility": "hidden"
                    });
            }
        }
    };

    var open = function () {
        buildOut.call(this);
        this.modal.className = this.modal.className +
            (this.modal.offsetHeight > window.innerHeight ?
            " scotch-open scotch-anchored" : " scotch-open");
        this.overlay.className = this.overlay.className + " scotch-open";

        $(".toggle_form_controls")
            .attr({
                'data-size': 'mini',
                'data-on-color': 'success',
                'data-handle-width': '20px',
                'data-label-width': '2px'
            })
            .bootstrapSwitch();
    };

    // Private Methods...
    var buildOut = function () {

        var content,
            contentHolder,
            docFrag,
            header,
            body,
            buttons,
            apply_button,
            subtitle,
            description,
            clear,
            modal_inner_container;

        /*
         * If content is an HTML string, append the HTML string.
         * If content is a domNode, append its content.
         */

        /*
          Note: At present only appending dom elements is allowed.
                          No innerHTML or strings.
        */

        chart_id = this.options.selector;
        // Create a DocumentFragment to build with
        docFrag = document.createDocumentFragment();

        // Create modal element
        this.modal = document.createElement("div");
        this.modal.className = "scotch-modal " + this.options.className;
        this.modal.style.top = this.options.top;
        this.modal.style.left = this.options.left;
        if(TimeSeries.isMobile) {
            this.modal.style.width = "80%";
        } else {
            this.modal.style.width = "auto";
            this.modal.style.minWidth = this.options.minWidth;
            this.modal.style.maxWidth = this.options.maxWidth;
            this.modal.style.minHeight = this.options.minHeight;
            this.modal.style.maxHeight = this.options.maxHeight;
        }
        this.modal.style.overflow = this.options.overflow;

        // If overlay is true, add one
        if (this.options.overlay === true) {
            this.overlay = document.createElement("div");
            this.overlay.className = "scotch-overlay " + this.options.className;
            this.overlay.addEventListener("click", dispatch.click);
            docFrag.appendChild(this.overlay);
        }

        modal_inner_container = document.createElement('div');
        modal_inner_container.className = 'comcharts-TS-modal-inner-container';
        if (this.options.close_text) {
            chart_settings_close = document.createElement('div');
            chart_settings_close.innerHTML = "<span class='comcharts-TS-modal-close'>" + this.options.close_text + "</span>";
            chart_settings_close.style.textAlign = 'right';
            chart_settings_close.style.right = '0px';
            chart_settings_close.style.position = 'absolute';
            chart_settings_close.style.zIndex = '1002';
            chart_settings_close.style.right = '10px';
            chart_settings_close.style.top = '12px';
            chart_settings_close.addEventListener("click", dispatch.click);
            modal_inner_container.appendChild(chart_settings_close);
        }

        if (this.options.modal_title) {
            var chart_area_title = document.createElement("div");
            chart_area_title.innerHTML = this.options.modal_title;
            chart_area_title.className = 'comcharts-TS-modal-chartarea-title';
            chart_area_title.style.float = "none";
            modal_inner_container.appendChild(chart_area_title);
        }

        switch (this.options.modal_type) {
            case "iOS" :
                var features_sidemenu,
                    feature_container,
                    chart_settings_header,
                    chart_settings_title,
                    chart_settings_close,
                    sidemenu_html = "",
                    tab_content,
                    each_tab_content,
                    which_features_in_modal = TimeSeries.clubFeaturesInModal[this.options.feature_name],
                    which_features_in_modal_length = which_features_in_modal.length,
                    i,
                    feature,
                    class_status = "",
                    alias_enabled,
                    after_apply;

                // chart_settings_header = document.createElement('div');
                // chart_settings_header.className = 'col-sm-12 comcharts-TS-modal-header';

                features_sidemenu = document.createElement("div");
                features_sidemenu.className = "col-sm-2 comcharts-TS-modal-feature-list";

                feature_container = document.createElement("div");
                if (TimeSeries.chart_options[this.options.selector].isTimeNavigator) {
                    this.modal.style.top = "20%";
                    this.modal.style.left = "20%";
                    this.modal.style["min-width"] = "60%";
                    this.modal.style["max-width"] = "60%";
                    this.modal.style["min-height"] = "30%";
                    this.modal.style["max-height"] = "60%";
                    feature_container.className = "col-sm-12 comcharts-TS-feature-container";
                } else {
                    feature_container.className = "col-sm-10 comcharts-TS-feature-container";
                }

                chart_settings_title = document.createElement('div');
                chart_settings_title.innerHTML = 'Settings';
                // <span class="smaller_title">/ ' + options.caption + '</span>';
                chart_settings_title.className = 'comcharts-TS-modal-title';

                sidemenu_html += '<ul id="myTabs" class="nav nav-pills nav-stacked comcharts-TS-modal-feature" role="tablist">';
                tab_content = document.createElement("div");
                tab_content.id = "myTabContent";
                tab_content.className = "tab-content";

                for (i = 0; i < which_features_in_modal_length; i++) {

                    each_feature_in_modal = which_features_in_modal[i];

                    alias = TimeSeries.featureAlias[each_feature_in_modal].alias;

                    if (each_feature_in_modal === "timeNavigator" || ( TimeSeries.chartToFeatureMapping[this.options.selector] && TimeSeries.chartToFeatureMapping[this.options.selector].indexOf(each_feature_in_modal) > -1)) {
                        extendDefaults(this.options, TimeSeries.mediator.publish(each_feature_in_modal+"Modal", this.options.parameters));

                        //Create header
                        content = this.options.content || "";

                        //Create body
                        body = document.createElement("div");
                        body.className = "vm-modal-body";
                        if (typeof content === "string") {
                            body.innerHTML += content;
                        } else {
                            body.appendChild(content);
                        }

                        // Create buttons
                        buttons = document.createElement("div");
                        buttons.className = "vm-modal-buttons";
                        window.opt = this.options;
                        if(this.options.apply_id) {
                            apply_button = document.createElement("div");
                            apply_button.id = this.options.apply_id;
                            apply_button.className = "apply-button deactive";
                            apply_button.appendChild(document.createTextNode("Apply"));
                            apply_button.addEventListener("click", function () {
                                if (opt.callbacks && opt.callbacks.afterApply) {
                                    after_apply = opt.callbacks.afterApply;
                                }
                                TimeSeries.mediator.publish(this.id.split("_apply_")[1] + "OnClick", chart_id, after_apply);
                                TimeSeries.mediator.publish("closeModal", options.selector);
                            });
                            buttons.appendChild(apply_button);
                        }

                        //Create subtitle
                        if(this.options.description && !TimeSeries.isMobile){
                            subtitle = document.createElement("div");
                            subtitle.className = "vm-modal-subtitle";
                            subtitle.appendChild(document.createTextNode(this.options.description));
                        }

                        //Clear float
                        clear = document.createElement("div");
                        clear.style.clear = "both";

                        if (this.options.selected_tab === each_feature_in_modal) {
                            class_status = " active";
                        } else {
                            class_status = "";
                        }
                        // if (this.options.selector) {
                        //     alias_enabled = ;
                        // }
                        if (!TimeSeries.featureAlias[each_feature_in_modal].show_status) {
                            alias_enabled = "";
                        } else {
                            if (TimeSeries.chart_configs[this.options.selector].feature_status[each_feature_in_modal]) {
                                alias_enabled = "On";
                            } else {
                                alias_enabled = "Off";
                            }
                        }

                        sidemenu_html += '<li role="presentation" class="'+class_status+'">' +
                                        '<a href="#'+each_feature_in_modal+'_tab_content"' +
                                            'id="'+each_feature_in_modal+'-tab"' +
                                            'role="tab" data-toggle="tab"' +
                                            'aria-controls="'+each_feature_in_modal+'"' +
                                            'aria-expanded="true">'+alias+
                                                '<span class="feature_status">'+alias_enabled+'</span>' +
                                                // '<span class="feature_status">On</span>' +
                                            '</a>' +
                                        '</li>';

                        each_tab_content = document.createElement("div");
                        each_tab_content.id = each_feature_in_modal+"_tab_content";
                        each_tab_content.className = "tab-pane fade in" + class_status;
                        each_tab_content.role = "tabpanel";
                        each_tab_content['aria-labelledby'] = each_feature_in_modal+"-tab";

                        each_tab_content.appendChild(body);
                        each_tab_content.appendChild(buttons);
                        each_tab_content.appendChild(clear);
                        tab_content.appendChild(each_tab_content);
                    }
                }
                sidemenu_html += '</ul>';

                d3.select(features_sidemenu)
                    .html(sidemenu_html);

                feature_container.appendChild(tab_content);

                // chart_settings_header.appendChild(chart_settings_title);

                // features_sidemenu.insertBefore(chart_settings_title, features_sidemenu.firstChild);
                if (!TimeSeries.chart_options[this.options.selector].isTimeNavigator) {
                    modal_inner_container.appendChild(features_sidemenu);
                }

                modal_inner_container.appendChild(feature_container);

                // this.modal.appendChild(chart_settings_header);
                this.modal.appendChild(modal_inner_container);

                break;
            case "custom":
                var apply_button_text = this.options.apply_text || "Apply";
                //Create header
                header = createTitle(this.options.apply, this.options.apply_on, this.options.help_id ? this.options.help_id:"modal_help",this.options.help_text,this.options.suffix ? this.options.suffix : "", this.options.type);

                content = this.options.content || "";

                //Create body
                body = document.createElement("div");
                body.className = "vm-modal-body";
                if (this.options.modalBodyClassName) {
                    body.className += " " + this.options.modalBodyClassName;
                }
                if (typeof content === "string") {
                    body.innerHTML += content;
                } else {
                    body.appendChild(content);
                }

                // Create buttons
                buttons = document.createElement("div");
                buttons.className = "vm-modal-buttons";
                if (this.options.buttonsClass) {
                    buttons.className += " " + this.options.buttonsClass;
                }

                if(this.options.apply_id) {
                    apply_button = document.createElement("div");
                    apply_button.id = this.options.apply_id;
                    apply_button.className = "apply-button deactive";
                    apply_button.appendChild(document.createTextNode(apply_button_text));
                    buttons.appendChild(apply_button);
                }

                //Create subtitle
                if(this.options.description && !TimeSeries.isMobile){
                    subtitle = document.createElement("div");
                    subtitle.className = "vm-modal-subtitle";
                    subtitle.appendChild(document.createTextNode(this.options.description));
                }

                //Clear float
                clear = document.createElement("div");
                clear.style.clear = "both";

                if (this.options.apply) {
                    modal_inner_container.appendChild(header);
                }

                if(this.options.description && !TimeSeries.isMobile){
                    modal_inner_container.appendChild(subtitle);
                }

                modal_inner_container.appendChild(body);
                modal_inner_container.appendChild(buttons);
                modal_inner_container.appendChild(clear);
                this.modal.appendChild(modal_inner_container);
                break;
        }
        // Append modal to DocumentFragment
        docFrag.appendChild(this.modal);

        // Append DocumentFragment to body
        document.body.appendChild(docFrag);

        if (this.options.modal_type === "iOS") {
            // setChartHeightWidth(chart_id, this.options.feature_name);
            $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
                var feature = e.target.id.split("-")[0];
                setChartHeightWidth(chart_id, feature);
            });
            document.querySelector('.scotch-modal .comcharts-TS-feature-container').style.minHeight = document.querySelector('.scotch-modal').getBoundingClientRect().height + 'px';
            d3.selectAll('.scotch-modal .comcharts-TS-modal-chartarea').style("min-height", document.querySelector('.scotch-modal').getBoundingClientRect().height + 'px');
        }
        if (TimeSeries.chart_options[this.options.selector] && TimeSeries.chart_options[this.options.selector].isTimeNavigator) {
            if ( document.querySelector('.comcharts-TS-modal-non-chartarea.comcharts-TS-modal-non-chartarea-TN') ){
                document.querySelector('.comcharts-TS-modal-non-chartarea.comcharts-TS-modal-non-chartarea-TN').style.height = document.querySelector('.scotch-modal').getBoundingClientRect().height + 'px';
            }
        }
        var calculated_height;
        if (document.getElementById(this.options.selector + "_anomaly_detection_series_div")) {
            calculated_height = (document.querySelector('.scotch-modal').offsetHeight - document.querySelector('.comcharts-TS-content-sub-heading').offsetHeight - document.querySelector('.comcharts-TS-category-modal').offsetHeight - 140);
            document.getElementById(this.options.selector + "_anomaly_detection_series_div").style.height = calculated_height + "px";
        }
        if (document.getElementById(this.options.selector + "_smoothing_series_div")) {
            calculated_height = (document.querySelector('.scotch-modal').offsetHeight - document.querySelector('.comcharts-TS-content-sub-heading').offsetHeight - document.querySelector('.comcharts-TS-category-modal').offsetHeight - 140);
            document.getElementById(this.options.selector + "_smoothing_series_div").style.height = calculated_height + "px";
        }
        if (document.getElementById(this.options.selector + "_TN_series_div")) {
            calculated_height = (document.querySelector('.modal-body-content').offsetHeight - document.querySelector('.comcharts-TS-modal-chartarea-title').offsetHeight - 80);
            document.getElementById(this.options.selector + "_TN_series_div").style.height = calculated_height + "px";
            // document.getElementById(this.options.selector + "_TN_series_div").style.height = "300px";
        }
        render(this.options, this.options.modal_type);

        // if (this.options.selector && this.options.featureName && this.options.featureName !== "edit_modal") {
        //     console.log(featureName, "featureName");
        //     TimeSeries.modalStatus[this.options.selector][this.options.featureName + "_height"] = document.getElementById(this.options.selector + "_" + this.options.featureName + "_modal").getBoundingClientRect().height;
        // }
    };

    var setChartHeightWidth = function(selector, feature) {
        var svg = document.getElementById(selector+"_svg"),
            width,
            height,
            svg_height = parseInt(svg.getAttribute("data-height")),
            svg_width = parseInt(svg.getAttribute("data-width")),
            scotch_modal_height = document.querySelector('.scotch-modal').getBoundingClientRect().height,
            col_sm_6 = document.getElementById(feature+"_modal_chartarea"),
            col_sm_6_offset_width;

        // if (TimeSeries.chart_options[selector].isTimeNavigator) {
        if (scotch_modal_height < svg_height && scotch_modal_height > 0) {
            height = scotch_modal_height;
        } else {
            height = svg_height;
        }

        if (col_sm_6) {
            col_sm_6_offset_width = col_sm_6.offsetWidth;
            console.log(svg_width, col_sm_6_offset_width);
            if (col_sm_6_offset_width < svg_width && col_sm_6_offset_width > 0) {
            // if (TimeSeries.chart_options[selector].isTimeNavigator) {
                width = col_sm_6_offset_width;
            } else {
                width = svg_width;
            }
            // } else {
            //     width = col_sm_6_offset_width;
            // }
            console.log(height, "height");
            svg.setAttribute("width", width + 'px');
            svg.setAttribute("height", height + 'px');
            // svg.setAttribute("viewBox", "0 0 " + width + " " + height);
            // "viewBox": "0 0 " + options.width + " " + options.height
            col_sm_6.appendChild(svg);
        }
    };

    var extendDefaults = function (source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };

    var showHelpText = function(current_obj){
          var modal_body,
              body_content,
              help_content,
              help_div,
              close_modal_help;

          modal_body = document.getElementsByClassName("vm-modal-body")[0];
          help_div = document.getElementsByClassName("modal-help")[0];
          body_content = modal_body.innerHTML;
          help_div.style.display = "none";
          modal_body.innerHTML = '<div class="comcharts-TS-content-sub-heading">'+current_obj.options.description+'</div>';
          modal_body.innerHTML += '<div style="float:right;" class="comcharts-TS-close-modal-help">Back</div>';
          close_modal_help = document.getElementsByClassName("comcharts-TS-close-modal-help")[0];
          close_modal_help.onclick = function(){
                closeHelp(modal_body,body_content,help_div);
          };
    };

    var closeHelp = function(modal_body,body_content,help_div){
          modal_body.innerHTML = body_content;
          help_div.style.display = "block";
    };

    var render = function (options, modal_type) {
        var that;

        // TimeSeries.mediator.publish("openModal");
        if (options.callbacks && options.callbacks.afterOpen) {
            options.callbacks.afterOpen(options.selector);
        }

        dispatch.on("click.modal-close", function () {
            if (modal_type === "iOS") {
                TimeSeries.mediator.publish("closeModal", options.selector || options.parameters.selector);
            } else {
                TimeSeries.mediator.publish("closeModal");
            }
            // if (options.resumeLiveData) {
            //     TimeSeries.mediator.publish("resumeLiveData",options.selector + "_cfr");
            // }
            if (options.callbacks && options.callbacks.afterClose) {
                options.callbacks.afterClose(options.selector);
            }
        });


        // this.closeButton = document.getElementsByClassName("modal-close")[0];
        // if (this.closeButton) {
        //     this.closeButton.addEventListener('click', dispatch.click);
        // }

        // this.helpButton = document.getElementsByClassName("modal-help")[0];
        // if(this.helpButton){
        //     that = this;
        //     this.helpButton.onclick = function(){
        //       showHelpText(that);
        //     };
        // }

        document.onkeydown = function(evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                dispatch.click();
            }
        };

        // var modal = document.querySelector(".scotch-modal"),
        //     window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        // if(modal.getBoundingClientRect().height > window_height) {
        //     modal.style.height = "90%";
        // }
    };
    var transitionSelect = function () {
        var el = document.createElement("div");
        if (el.style.WebkitTransition) return "webkitTransitionEnd";
        if (el.style.OTransition) return "oTransitionEnd";
        return 'transitionend';
    };
    var createTitle = function(apply, apply_on, help_id, help_text, suffix_text, type) {
        var title = document.createElement("div"),
            close;

        title.className = "vm-modal-heading";
        // title.innerHTML = "<div style='width:100%;'><span id ='" + close_id + "_close' class='modal-close'>" + close_text + "</span>";
        title.innerHTML = "<div class='comcharts-TS-vm-modal-heading-div'>";

        if(TimeSeries.isMobile && typeof help_text !== 'undefined'){
            title.innerHTML += "<span id ='" + help_id + "' class='modal-help'>" + help_text + "</span>";
        }

        title.innerHTML +=  "</div><div></div>"+ "<span class='modal-title-bold'>" + apply + "</span>";

        if (apply_on) {
            if(!TimeSeries.isMobile && type === 'feature'){
                title.innerHTML += "<span class='for'> for </span>" +
                          "<span class='for'>" + apply_on + "</span>";
            }
            else if(type === 'feature'){
                title.innerHTML += "<div class='for'> for " +
                          apply_on + "</div>";
            }
            else if(type === 'help_individual'){
                title.innerHTML +=   "<span class='for'>" + apply_on + "</span><span class='for'>"+ suffix_text +"</span>";
            }

        }
        return title;
    };

    var createLoader = function(text, width, height) {
        var loader = document.createElement("div");
        loader.className = "when-loading";
        loader.innerHTML = "<div class='loader-div'><div id='preloader_1'>" +
                            "<span></span><span></span><span></span>" +
                            "<span></span><span></span></div><br>" +
                            "<div class='applying-text'>" + text + "</div></div>";
        loader.style.width = width + "px";
        loader.style.height = height + "px";
        return loader;
    };

    TimeSeries.mediator.subscribe("initModal",init);
    TimeSeries.mediator.subscribe("renderModal",render);
    TimeSeries.mediator.subscribe("openModal",open);
    TimeSeries.mediator.subscribe("closeModal",close);
    TimeSeries.mediator.subscribe("createLoader",createLoader);
    TimeSeries.mediator.subscribe("extendDefaults",extendDefaults);

    return {
        init: init,
        open: open,
        close: close
    };

}());

Date.prototype.getWeek = function() {
var onejan = new Date(this.getFullYear(),0,1);
return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
};
/**
@author Pykih developers
@module dimensionAnalysis
@namespace TimeSeries
*/
TimeSeries.dimensionalAnalysis = (function(){
    var granular_data = {},
        selected_metric,
        window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        filtered_data,
        granularities = [
            {
                "granularity": "year"
            },
            {
                "granularity": "quarter",
                "length": 4
            },
            {
                "granularity": "month",
                length: 12
            },
            {
                "granularity": "week",
                "length": 53
            },
            {
                "granularity": "day",
                 length: 31
            },
            {
                "granularity": "weekday",
                "length": 7
            },
            {
                "granularity": "hour",
                "hour": 24
            }
        ],
        granularity_order = ["year", "quarter", "month", "week", "day", "weekday", "hour"],
        panel_count = 4,
        clone_data = {},
        no_of_horizontal_charts = 1,
        previous_click_granularity,
        clicked_object = [undefined],
        retain_click,
        da_chart_color = '#42A5F5',
        da_hover_color = '#F44336';

    var createGranularity = function (options, data){
        var dateColumnName = options.dateColumnName,
            column_name = 'country';

        TimeSeries.Query.setQuery(options.selector,"dimensionFilterDatesQuery",{"dimension":[{'dates':function(d){
            return d[dateColumnName];
        }}]});
    };

    var conditionFunction = function(config) {
        var expression,
            value;
        for(var prop in config) {
            if(config[prop] !== null) {
                value = config[prop][0];
                switch(prop) {
                    case'year':
                        expression = function(d) {
                            return new Date(d).getFullYear() == value;
                        };
                    break;
                    case'month':
                        expression = function(d) {
                            // return d3.time.format('%m')(new Date(d)) == value;
                            return new Date(d).getMonth() == value;
                        };
                    break;
                    case'day':
                        expression = function(d) {
                            // return d3.time.format('%d')(new Date(d)) == value;
                            return new Date(d).getDate() == value;
                        };
                    break;
                    case'week':
                        expression = function(d) {
                            // return d3.time.format('%U')(new Date(d)) == value;
                            return new Date(d).getWeek() == value;
                        };
                    break;
                    case'hour':
                        expression = function(d) {
                            // return d3.time.format('%H')(new Date(d)) == value;
                            return new Date(d).getHours() == value;

                        };
                    break;
                    case'weekday':
                        expression = function(d) {
                            // return d3.time.format('%w')(new Date(d)) == value;
                            return new Date(d).getDay() == value;
                        };
                    break;
                    case'quarter':
                        expression = function(d) {
                            // return parseInt((+d3.time.format('%m')(new Date(d))-1)/3)+1 == value;
                            return parseInt((new Date(d).getMonth())/3)+1 == value;
                        };
                    break;
                    default:
                }
            }
        }
        return expression;
    };

    var createFilterFunction = function(config) {
        /*jslint evil: true */
        return conditionFunction(config);
    };

    var filterDataq = function (filter_config, options) {
        TimeSeries.Query.addFilter(options.selector,"dimensionFilterDatesQuery",[{"column":"dates","condition":"Eval","values":createFilterFunction(filter_config)}]);
    };

    var removeGranularityFilterq = function(options) {
        TimeSeries.Query.removeFilter(options.selector,"dimensionFilterDatesQuery",[{"column":"dates"}]);
    };

    // config example {year:null,month:null,day:null,hour:06,minute:06,second:null}
    var createConfigFilterq =  function (config){
        var keys = Object.keys(config),
            len = keys.length,
            value;
        for (i = 0; i < len; i++) {
            if (config[keys[i]] == -1) config[keys[i]] = null;
            if (config[keys[i]]) {
                value = [];
                value.push(config[keys[i]]);
                value.push(config[keys[i]]);
                config[keys[i]] = value;
            }
        }
        return config;
    };

    var initConfig = function(options, callbacks, feature) {
        var i,
            length,
            chart_to_dataset,
            chart_to_dataset_length,
            dataset_load_status,
            datasets_array = [],
            temp_object,
            dataset,
            raw_data,
            date_field,
            date_format;

        if(options.isGlobalData) {
            chart_to_dataset = TimeSeries.gChart_to_data_set_mapping[options.selector];
            chart_to_dataset_length = chart_to_dataset.length;
            for (i = 0; i < chart_to_dataset_length; i++) {
                if (TimeSeries.data_load_status[chart_to_dataset[i]].status !== "complete") {
                    return;
                }
            }
            length = chart_to_dataset.length;
        }


        var parameters = {},
            series_length,
            series,
            featuresApplied,
            dimension_metrics_validation,
            chart_configs,
            chart_div;

        callbacks = callbacks || [];

        TimeSeries.chart_configs[options.selector] = TimeSeries.chart_configs[options.selector] || {};
        TimeSeries.chart_configs[options.selector].feature_status = {};

        chart_configs = TimeSeries.chart_configs[options.selector];
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.mandatory_configs);
        if(!options) {
            return;
        }
        d3.select("#" + options.selector)[0][0].className += " chart-div";
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.chart_features);
        options = TimeSeries.mediator.publish("validate", options, TimeSeries.default.chart_options);
        TimeSeries.chart_options[options.selector] = {};
        TimeSeries.chart_options[options.selector] = options;
        TimeSeries.chart_status[options.selector] = TimeSeries.chart_status[options.selector] || {status:false, onComplete:[] };

        //Done for managing features applied on a series.
        featuresApplied = TimeSeries.chart_configs[options.selector].featuresApplied = {};

        //darpan code
        series = options.metricsColumnName;
        series_length = series.length;
        for (i = 0; i < series_length ;i++) {
            featuresApplied[series[i].replace(/[\(\)\!\@\#\$\%\^\&\*\+\=\[\]\{\}\;\'\:\"\|, \.]*/gi,"")] = [];
        }

        parameters.options = options;
        chart_div = document.getElementById(options.selector);
        chart_div.style.outline = "none";
        if (!options.isGlobalData) {
            TimeSeries.mediator.publish("parseData", options.data, "dimensionalAnalysisConfigCallback", parameters, callbacks, feature);//[{function_name:"initializeLiveData",attribute:[parameters]}]);
        } else {
            TimeSeries.chart_status[options.selector].status = "inprogress";
            TimeSeries.mediator.publish("dimensionalAnalysisConfigCallback", {"options": options}, JSON.parse(JSON.stringify(options.globalData)), callbacks, feature);
            TimeSeries.chart_options[options.selector].globalData = null;
            options.globalData = null;
        }
    };

    var dimensionalAnalysisConfigCallback = function (parameters, data, callbacks, feature) {
        var selector = parameters.options.selector,
            table_name = selector + "_cfr",
            options = parameters.options,
            date_field_name,
            chart_configs = TimeSeries.chart_configs[selector],
            load_status = TimeSeries.chart_status[selector].status,
            dimension_metrics_validation,
            raw_data,
            data_array;

        data = data || TimeSeries.Query.getData(table_name,"query_cfr");
        dimension_metrics_validation = validateDimensionMetrics(options, data[0]);
        if(!dimension_metrics_validation) {
            return;
        }

        console.time(options.selector+"dimensionalAnalysisConfigCallback");

        if (!chart_configs.refresh_process_initiated) {
            chart_configs.live_data_length = 0;
            date_field_name = options.dateColumnName;

            var processMissingDataPoint = options.processMissingDataPoint,
                date_format = TimeSeries.mediator.publish("detectDateFormat",selector,data, date_field_name),
                format_data = date_format.format_data,
                format = date_format.format,
                d;

            options.inputDateFormat = date_format;

            chart_configs.data_processed = TimeSeries.mediator.publish("dataProcessing", data, date_field_name, format_data, format, options);
            TimeSeries.Query.init(table_name,chart_configs.data_processed.data);
            TimeSeries.Query.setQuery(table_name,"query_cfr",{"dimension":[date_field_name]});
            TimeSeries.Query.init(selector,chart_configs.data_processed.data);

            queryInitializer(options, feature);
            raw_data = TimeSeries.Query.getData(table_name,"query_cfr");
        }

        console.timeEnd(options.selector+"dimensionalAnalysisConfigCallback");

        chart_configs.all_data_length = data.length;
        TimeSeries.mediator.publishToAll(callbacks);

        if(load_status === "inprogress") {
            TimeSeries.chart_status[selector].status = "completed";
            TimeSeries.mediator.publish("executeOnComplete",selector,"chart");
        }
    };

    var createOverlay = function(group, width, height, options) {
        if(!document.querySelector("#" + options.selector + "_overlay")) {
            group.append('rect')
                .attr('id',options.selector + '_overlay')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height);
        }
    };

    var queryInitializer = function (options, feature) {
        var metricObj,
            dataImpactObj,
            selector = options.selector,
            date_field_name = options.dateColumnName,
            table_name = selector + "_cfr",
            metricsColumnName = options.metricsColumnName,
            len = metricsColumnName.length,
            i,
            column_name,
            newMetricsColumn = options.newMetricsColumn;

        for (i = 0; i < len; i++) {
            column_name = metricsColumnName[i];
            if (typeof column_name === "object") {
                TimeSeries.Query.deleteQuery(selector, column_name.seriesColumnName);
            } else {
                TimeSeries.Query.deleteQuery(selector, newMetricsColumn[i]);
            }
        }

        for (i = 0; i < len; i++) {
            column_name = metricsColumnName[i];
            metricObj = {};
            dataImpactObj = {};
            dataImpactObj[table_name] = "query_cfr";
            if (typeof column_name === "object") {
                var temp_column_name = JSON.parse(JSON.stringify(column_name));
                metricObj[temp_column_name.metric] = "sum";
                if (!TimeSeries.query_data[selector][temp_column_name.seriesColumnName]) {
                    TimeSeries.Query.setQuery(selector, temp_column_name.seriesColumnName, {
                    "dimension":[{date_field_name:function(d){
                        return d[date_field_name]+"||"+d[temp_column_name.seriesColumnName]; }}],
                    "metric":[metricObj],
                    "data_impacted_by": [dataImpactObj]
                    });
                }
            } else {
                metricObj[column_name] = "sum";
                TimeSeries.Query.setQuery(selector, newMetricsColumn[i], {
                    "metric":[metricObj],
                    "dimension":[date_field_name],
                    "data_impacted_by": [dataImpactObj]
                });
            }
        }

    };

    var executeOnComplete = function (selector,of_what, data) {
        console.time("onComplete");
        var on_complete_callbacks,
            i;
        switch(of_what) {
            case "chart":
                on_complete_callbacks = TimeSeries.chart_status[selector].onComplete;
                break;
            case "data":
                on_complete_callbacks = TimeSeries.data_load_status[selector].onComplete;
                for (i = 0; i < on_complete_callbacks.length; i++) {
                    on_complete_callbacks[i].attribute[0].globalData = data;
                }
                break;
        }

        TimeSeries.mediator.publishToAll(on_complete_callbacks);
        console.timeEnd("onComplete");
    };

    // var init = function(options,metricsColumnName,aggregation_fun) {
    var init = function(options) {
        var chart_selector = options.selector,
            target_selector = options.selector,
            chart_options = TimeSeries.chart_options[chart_selector],
            chart_configs = TimeSeries.chart_configs[chart_selector],
            modal_div = document.createElement("div"),
            series_div = document.createElement("div"),
            chart_holder = document.createElement("div"),
            radio_button,
            label,
            // chart_colors = chart_options.chartColor,
            span,
            radio_button_holder,
            metrics = chart_options.metricsColumnName,
            metrics_length = metrics.length,
            i,
            data = TimeSeries.Query.getData(chart_options.selector + "_cfr","query_cfr",{filter:{"column":"isRawData","condition":"Equal","values":true}}),
            window_height,
            new_metrics = chart_options.newMetricsColumn,
            list_holder,
            tooltip_options;

        tooltip_options = {
            tooltipBgBodyOpacity: 100,
            tooltipBgBodyColor: "white"
        };

        TimeSeries.mediator.publish("createTooltip", tooltip_options, "dimensional_analysis_chart_tooltip");

        daOnDrop(target_selector, chart_selector);

        reset_all_button = createResetAllButton();
        document.getElementById("DA_highlight_view").appendChild(reset_all_button);
        document.getElementById("dimensional_analysis_chart_tooltip").style["z-index"] = 10200;
    };


    //Creating in general select boxes.
    var createChartSelectBox = function (chart_id, series_id, chart_selector, count, mode) {
        var dashboards_list = document.createElement('div'),
            chart_list = document.createElement("div"),
            series_list = document.createElement("div"),
            list_holder = document.createElement("div"),
            allCharts = TimeSeries.allCharts,
            i;

        var heading_container = document.createElement("div"),
            heading = document.createElement("div"),
            chart_name_label = document.createElement("div"),
            series_name_label = document.createElement("h3"),
            remove_panel = document.createElement("div"),
            clearfix = document.createElement("div");

        heading_container.id = "panel_header_container";
        heading_container.className = "comcharts-TS-da-header-container";

        heading.id = "chart_header";
        remove_panel.innerHTML = "x";
        remove_panel.id = "remove_panel";

        remove_panel.addEventListener("click", function () {
            main_DA_container = document.getElementById("dimensionalAnalysis");
            panel = document.createElement("div");

            panel.id = "DA_panel_"+count;
            panel.className = "col-sm-4 comcharts-TS-da-tab";
            main_DA_container.insertBefore(panel, document.getElementById("comchart_TS_clearfix"));

            document.getElementById(panel.id).innerHTML = "";
            renderDA(panel.id, false, chart_id);
        });

        clearfix.className = "comcharts-TS-clearfix";

        dashboards_list.id = "panel_DA_dashboard_"+ count + "_select_box";
        dashboards_list.className = "comcharts-TS-da-dashboard-box";
        dashboards_list.innerHTML = (TimeSeries.chart_options[chart_id].caption || "Filter by time");

        list_holder = document.createElement("div");
        list_holder.appendChild(dashboards_list);
        heading.appendChild(list_holder);
        var new_metrics = TimeSeries.chart_options[chart_id].newMetricsColumn,
            display_metrics = TimeSeries.chart_options[chart_id].displayMetricsColumn;

        series_list.id = "panel_DA_series_" + count + "_select_box";
        series_list.className = "comcharts-TS-da-series-box";
        series_list.style["max-width"] = "100%";
        series_list.setAttribute("panel-id", count);
        series_list.innerHTML = display_metrics[new_metrics.indexOf(series_id)];
        series_list.addEventListener("click", function () {
            panel_body = modalElements(chart_selector);
            TimeSeries.mediator.publish("initModal",{
                content: panel_body,
                modal_title: 'Select a series to "Roll-up by time"',
                close_text: "x",
                close_id: "DA_close_select_series",
                modal_type: "custom",
                selected_tab: "DA_panel_"+count,
                maxHeight: "65%",
                top:"20%"
            });
        });

        list_holder.appendChild(series_list);
        heading.appendChild(list_holder);
        heading_container.appendChild(heading);
        heading_container.appendChild(remove_panel);
        heading_container.appendChild(clearfix);

        return heading_container;
    };

    var createDimensionCharts = function (chart_id, series_id, chart_selector, count, series_attributes) {
        var div_id = "DA_panel_" + count;
        seeDimensionalAnalysis(chart_id, series_id, chart_selector, div_id, count, series_attributes);
    };

    var seeDimensionalAnalysis = function (chart_id, series_id, chart_selector, div_id, panel_no, series_attributes) {
        var user_div = document.getElementById(div_id),
            chart_options = TimeSeries.chart_options[chart_selector],
            chart_holder,
            len,
            data = TimeSeries.Query.getData(chart_selector + "_cfr","query_cfr",{filter:{"column":"isRawData","condition":"Equal","values":true}}),
            highlight_view,
            panel_2,
            panel_3,
            main_DA_container,
            reset_all_button;

        if(user_div && !document.getElementById(div_id + "_dimensional_analysis_holder")) {
            chart_holder = document.createElement("div");
            chart_holder.id = div_id + "_" + chart_selector + "_dimensional_analysis_holder";
            if(panel_no == 1 && !document.getElementById("DA_panel_2")) {
                main_DA_container = document.getElementById("dimensionalAnalysis");
                panel_2 = document.createElement("div");
                panel_2.id = "DA_panel_2";
                panel_2.className = "col-sm-4 comcharts-TS-da-tab";
                main_DA_container.insertBefore(panel_2, document.getElementById("comchart_TS_clearfix"));
                renderDA("DA_panel_2",false, chart_selector);
            } else if(panel_no == 2 && !document.getElementById("DA_panel_3")) {
                main_DA_container = document.getElementById("dimensionalAnalysis");
                panel_3 = document.createElement("div");
                panel_3.id = "DA_panel_3";
                panel_3.className = "col-sm-4 comcharts-TS-da-tab";
                main_DA_container.insertBefore(panel_3, document.getElementById("comchart_TS_clearfix"));
                renderDA("DA_panel_3",false, chart_selector);
            }
            chart_holder.id = div_id + "_dimensional_analysis_holder";
            user_div.appendChild(chart_holder);
        }
        updateChart(chart_id, series_id, chart_selector, div_id, data, series_attributes);
        createGranularity({selector: chart_selector+"_DA",dateColumnName: chart_options.dateColumnName },data);
    };

    var updateChart = function (chart_id, series_id, chart_selector, div_id, data, series_attributes) {
        var chart_options = TimeSeries.chart_options[chart_selector];
        data = data || TimeSeries.Query.getData(chart_selector + "_cfr","query_cfr",{filter:{"column":"isRawData","condition":"Equal","values":true}});
        document.getElementById(div_id + "_dimensional_analysis_holder").innerHTML = "";
        createData(chart_options, data, series_id, "sum", series_attributes);
        createCharts(chart_id, series_id, chart_options, div_id, series_attributes);
    };

    var createData = function(options, data, selected_series, aggregation_fun, series_attributes) {
        console.time("metric+dimnsion");
        var series =  {},
            query = TimeSeries.Query,
/*            table,
            da_year_query,
            da_month_query,
            da_day_query,
            da_hour_query,
            da_weekday_query,
            da_week_query,
            da_quarter_query,*/
            date_column_name = options.dateColumnName;

        if(series_attributes.metric) {
            series[series_attributes.metric] = aggregation_fun;
        } else {
            var metric = options.metricsColumnName[options.newMetricsColumn.indexOf(selected_series)];
            series[metric] = aggregation_fun;
        }

        query.init(options.selector+"_DA",data);

/*        table = ActiveQuery.createTable(options.selector+"_DA", "InBrowser", data);
        da_year_query = ActiveQuery.createQuery("da_year_query");
        da_month_query = ActiveQuery.createQuery("da_month_query");
        da_day_query = ActiveQuery.createQuery("da_day_query");
        da_hour_query = ActiveQuery.createQuery("da_hour_query");
        da_weekday_query = ActiveQuery.createQuery("da_weekday_query");
        da_week_query = ActiveQuery.createQuery("da_week_query");
        da_quarter_query = ActiveQuery.createQuery("da_quarter_query");

        da_year_query.Select({'year': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).year}, series).From(options.selector+"_DA").Group();
        da_month_query.Select({'month': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).month}, series).From(options.selector+"_DA").Group();
        da_day_query.Select({'day': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).day}, series).From(options.selector+"_DA").Group();
        da_hour_query.Select({'hour': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).hour}, series).From(options.selector+"_DA").Group();
        da_weekday_query.Select({'weekday': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).weekday}, series).From(options.selector+"_DA").Group();
        da_week_query.Select({'week': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).week}, series).From(options.selector+"_DA").Group();
        da_quarter_query.Select({'quarter': ActiveQueryHelpers.DateTimeHelpers.field(date_column_name).quarter}, series).From(options.selector+"_DA").Group();

        var output = {};
        output.year = da_year_query.Exec();
        output.month = da_month_query.Exec();
        output.day = da_day_query.Exec();
        output.hour = da_hour_query.Exec();
        output.weekday = da_weekday_query.Exec();
        output.week = da_week_query.Exec();
        output.quarter = da_quarter_query.Exec();*/

        // if(typeof selected_series != 'object') {
            query.setQuery(options.selector+"_DA","DA_year",{"dimension":[{'year':function(d){
                // return +d3.time.format('%Y')(new Date(d[date_column_name]));
                 return typeof selected_series == 'object'? new Date(+d[date_column_name]).getFullYear()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getFullYear();
                // return new Date(+d[date_column_name]).getFullYear();
            }}]});


            query.setQuery(options.selector+"_DA","DA_month",{"dimension":[{'month':function(d){
                // return +d3.time.format('%m')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+ d[date_column_name]).getMonth()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getMonth();
                // return new Date(+d[date_column_name]).getMonth();
            }}]});

            query.setQuery(options.selector+"_DA","DA_day",{"dimension":[{'day':function(d){
                // return +d3.time.format('%d')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getDate()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getDate();
                // return new Date(+d[date_column_name]).getDate();
            }}]});

            query.setQuery(options.selector+"_DA","DA_hour",{"dimension":[{'hour':function(d){
                // return +d3.time.format('%H')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getHours()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getHours();
                // return new Date(+d[date_column_name]).getHours();

            }}]});

            query.setQuery(options.selector+"_DA","DA_weekday",{"dimension":[{'weekday':function(d){
                // return +d3.time.format('%w')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getDay()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getDay();
                // return new Date(+d[date_column_name]).getDay();
            }}]});

            query.setQuery(options.selector+"_DA","DA_week",{"dimension":[{'week':function(d){
                // return +d3.time.format('%U')(new Date(d[date_column_name]));
                return typeof selected_series == 'object'? new Date(+d[date_column_name]).getWeek()+"||"+d[selected_series.seriesColumnName] :new Date(+d[date_column_name]).getWeek();
                // return new Date(+d[date_column_name]).getWeek();
            }}]});

            query.setQuery(options.selector+"_DA","DA_quarter",{"dimension":[{'quarter':function(d){
                // return parseInt((+d3.time.format('%m')(new Date(d[date_column_name]))-1)/3)+1;
                return typeof selected_series == 'object'? parseInt((new Date(+d[date_column_name]).getMonth())/3)+1 +"||"+d[selected_series.seriesColumnName] :parseInt((new Date(+d[date_column_name]).getMonth())/3)+1;
                // return parseInt((new Date(+d[date_column_name]).getMonth())/3)+1;
            }}]});

            console.timeEnd("metric+dimnsion");
            console.time("metric");
             //console.log(series)
            query.createMetric(options.selector+"_DA","DA_year",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_month",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_day",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_hour",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_weekday",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_week",{"metric":[series]});
            query.createMetric(options.selector+"_DA","DA_quarter",{"metric":[series]});
            console.timeEnd("metric");
            getGroupData(options,"kokok", selected_series, series_attributes);
    };

    var getGroupData = function(options,query_name,series_object,series_id, series_attributes) {
        // query_name is same as metric column name
        // option contain table name and column name
        // metric by default is sum
        var output = {},
                output1 = {},
                dateColumnName = options.dateColumnName,
                config = options.aggregation,
                obj = {},
                metric =[];
        if(typeof series_object == 'string') {
            granular_data.year = TimeSeries.Query.getData(options.selector+"_DA","DA_year");
            granular_data.month = TimeSeries.Query.getData(options.selector+"_DA","DA_month");
            granular_data.day = TimeSeries.Query.getData(options.selector+"_DA","DA_day");
            granular_data.hour = TimeSeries.Query.getData(options.selector+"_DA","DA_hour");
            granular_data.weekday = TimeSeries.Query.getData(options.selector+"_DA","DA_weekday");
            granular_data.week = TimeSeries.Query.getData(options.selector+"_DA","DA_week");
            granular_data.quarter = TimeSeries.Query.getData(options.selector+"_DA","DA_quarter");
        } else if(typeof series_object == 'object') {
            TimeSeries.Query.setQuery(options.selector+"_DA", series_object.seriesColumnName, {
                        "dimension":[series_object.seriesColumnName],
                        // "data_impacted_by": [dataImpactObj]
                });
            granular_data.year = TimeSeries.Query.getData(options.selector+"_DA","DA_year",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.month = TimeSeries.Query.getData(options.selector+"_DA","DA_month",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.day = TimeSeries.Query.getData(options.selector+"_DA","DA_day",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.hour = TimeSeries.Query.getData(options.selector+"_DA","DA_hour",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.weekday = TimeSeries.Query.getData(options.selector+"_DA","DA_weekday",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.week = TimeSeries.Query.getData(options.selector+"_DA","DA_week",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
            granular_data.quarter = TimeSeries.Query.getData(options.selector+"_DA","DA_quarter",{filter:{"column":"key","condition":"Equal","values":series_object.seriesName}});
        } else if(typeof options.series_id == 'object') {
            // if(config === "") { config = 'sum';}
            obj[query_name] = config;
            metric = [obj];
            output.year = TimeSeries.Query.getData(options.selector,"DA_year",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.month = TimeSeries.Query.getData(options.selector,"DA_month",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.day = TimeSeries.Query.getData(options.selector,"DA_day",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.hour = TimeSeries.Query.getData(options.selector,"DA_hour",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.weekday = TimeSeries.Query.getData(options.selector,"DA_weekday",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.week = TimeSeries.Query.getData(options.selector,"DA_week",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            output.quarter = TimeSeries.Query.getData(options.selector,"DA_quarter",{filter:{"column":"key","condition":"Equal","values":options.series_id.seriesName}});
            return output;
        } else if( typeof options.series_id == 'string' ) {
            // if(config === "") { config = 'sum';}
            obj[query_name] = config;
            metric = [obj];
            output.year = TimeSeries.Query.getData(options.selector,"DA_year");
            output.month = TimeSeries.Query.getData(options.selector,"DA_month");
            output.day = TimeSeries.Query.getData(options.selector,"DA_day");
            output.hour = TimeSeries.Query.getData(options.selector,"DA_hour");
            output.weekday = TimeSeries.Query.getData(options.selector,"DA_weekday");
            output.week = TimeSeries.Query.getData(options.selector,"DA_week");
            output.quarter = TimeSeries.Query.getData(options.selector,"DA_quarter");
            return output;
        }
    };

    var returnFilterValue = function(getvalue,options,parent_id){
        var filtervalue_array = [],
            selector;
        resetChartSelection(parent_id);
        for (var i = 0; i < clone_data[parent_id].length; i++) {
            var key_array =[],
                sort_len;
            switch(getvalue) {
                case 'top':
                    key_array.push(clone_data[parent_id][i][0].key);
                    filtervalue_array.push(key_array);
                break;
                case 'bottom':
                    key_array.push(clone_data[parent_id][i].reverse()[0].key);
                    filtervalue_array.push(key_array);
                    clone_data[parent_id][i].reverse();
                break;
                case 'topfew':
                    sort_len = Math.round(clone_data[parent_id][i].length/4);
                    clone_data[parent_id][i].slice(0,sort_len).map(function(a){
                        key_array.push(a.key);
                        return a;
                    });
                    filtervalue_array.push(key_array);
                break;
                case 'bottomfew':
                    sort_len = Math.round(clone_data[parent_id][i].length/4);
                    clone_data[parent_id][i].reverse().slice(0,sort_len).map(function(a){
                        key_array.push(a.key);
                        return a;
                    });
                    clone_data[parent_id][i].reverse();
                    filtervalue_array.push(key_array);
                break;
                default:
            }
            selector = parent_id + "_dimension_" + granularity_order[i];
                d3.selectAll("#" + selector + "_plot_group .column")
                    .style({
                        fill: function(d,k){
                            if(filtervalue_array[i].indexOf(+this.getAttribute("granularity_value")) > -1) {
                                return "orange";
                            } else {
                                return da_chart_color;

                            }
                        }
                    });
        }
    };

    var createCharts = function(chart_id, series_id, options, parent_id, series_attributes) {
        var parent_container =  document.getElementById(parent_id + "_dimensional_analysis_holder"),
            overlay,
            chart_caption = ["Year", "Quarter", "Month", "Week Number", "Day", "Weekday", "Hour"],
            granularity,
            no_of_charts = 0,
            chart_width,
            window_height,
            tooltip = document.getElementById("dimensional_analysis_chart_tooltip"),
            count = parseInt(parent_id.split("DA_panel_")[1]),
            i,
            len,
            parent_div = document.getElementById(parent_id),
            render_da = false;

        clone_data[parent_id] =[];
        clicked_object.push(undefined);
        for(i = 0,len = granularities.length;i < len; i++) {
            granularity = granularities[i].granularity;
            if(granular_data[granularity].length > 1) {
                no_of_charts += 1;
            }
        }

        d3.selectAll(".dimension_filter")
            .on("click", function(){
                event.stopPropagation();
            })
            .on('change',function(){
                retain_click = clicked_object.slice();
                var i,
                    reset_button ;
                if(this.value !== "none") {
                    for (i = 1; i < panel_count; i++) {
                        if(document.getElementById("DA_panel_" + i + "_dimensional_analysis_holder")) {
                            reset_button = document.getElementById("DA_panel_" + i + "_reset_button");
                            if(reset_button && reset_button.style.visibility === "visible") {
                                reset_button.style.visibility = "hidden";
                            }
                            returnFilterValue(this.value,options, "DA_panel_" + i);
                        }
                    }
                } else {
                    for (i = 1; i < panel_count; i++) {
                        if(document.getElementById("DA_panel_" + i + "_dimensional_analysis_holder")) {
                            reset_button = document.getElementById("DA_panel_" + i + "_reset_button");
                            if(reset_button && reset_button.style.visibility === "visible") {
                                reset_button.style.visibility = "hidden";
                            }
                            resetChartSelection("DA_panel_" + i);
                        }
                    }
                }
        });
        // parent_div.setAttribute("data-dashboard", dashboard_id);
        parent_div.setAttribute("data-chart", chart_id);
        parent_div.setAttribute("data-series", series_id);

        var panel_id = parent_id.split("DA_panel_")[1],
            list_holder = createChartSelectBox(chart_id, series_id, parent_id, panel_id, "charts");
        if (document.querySelector("#" + parent_id + " #suggestions_div")) {
            document.querySelector("#" + parent_id + " #suggestions_div").remove();
        } else if (document.querySelector("#" + parent_id + " #panel_header_container")) {
            document.querySelector("#" + parent_id + " #panel_header_container").remove();
        }
        document.querySelector("#" + parent_id).insertBefore(list_holder,document.getElementById(parent_id + "_dimensional_analysis_holder"));
            for(i=0,len = granularities.length;i<len;i++) {
                granularity = granularities[i].granularity;
                clone_data[parent_id].push(JSON.parse(JSON.stringify(granular_data[granularity])));
                // if(granular_data[granularity].length > 1) {
                    var div = document.createElement("div"),
                        data = JSON.parse(JSON.stringify(granular_data[granularity])),
                        selector = parent_id + "_dimension_" + granularity,
                        granularity_obj,
                        map_function,
                        tickValues = [],
                        missing_data;
                        TimeSeries.chart_configs[selector] = {};
                        TimeSeries.chart_options[selector] = {};
                        granularity_obj = mapFunction(granularity, data);
                        map_function = granularity_obj.func;

                    render_da = true;
                    // console.log(granularity,data);

                    data.sort(function(a,b){
                        return a.key - b.key;
                    });

                    for (var j = 0, length = granularities[i].length || data.length; j < length; j++) {
                        if(!data[j] && granularity !== "year") {
                            data[j] = {
                                key: j + granularity_obj.additionFactor,
                                value: 0
                            };
                        } else if(data[j].key !== (j+granularity_obj.additionFactor) && granularity !== "year") {
                            missing_data = {
                                key: j + granularity_obj.additionFactor,
                                value: 0
                            };
                            data.splice(j,0,missing_data);
                        }
                        data[j].original_key = data[j].key;
                        data[j].granularity = granularity;
                        data[j].key = map_function(data[j].key);
                        if(granularity_obj.xAxisTickInterval && ((j % granularity_obj.xAxisTickInterval === 0) || (j ===  length-1))) {
                            tickValues.push(data[j].key);
                        } else if(!granularity_obj.xAxisTickInterval) {
                            tickValues.push(data[j].key);
                        }
                    }

                    chart_width = parseInt(document.getElementById(parent_id).style.width);
                    div.id = selector;
                    div.style.float = "left";
                    // div.style["margin-bottom"] = "5px";
                    div.style.padding = "3px";

                    parent_container.className = "comcharts-TS-DA-column-charts-container";
                    parent_container.appendChild(div);
                    // console.log(document.getElementById(options.selector).clientWidth * (100/100))

                    var get_computed_style = window.getComputedStyle(document.getElementById(parent_id), null),
                        width = document.getElementById(parent_id).clientWidth - parseFloat(get_computed_style.getPropertyValue("padding-left")) - parseFloat(get_computed_style.getPropertyValue("padding-right"));

                    var config = {
                        width: TimeSeries.isMobile ? 346 : width,
                        height: TimeSeries.isMobile ? 246 : 100,
                        data: data,
                        selector: selector,
                        chartType: "column",
                        marginLeft: 20,
                        marginTop: 30,
                        marginRight: 5,
                        marginBottom: 30,
                        "dateColumnName": "key",
                        "metricsColumnName": ["value"],
                        chartColor: [da_chart_color],
                        xAxisTickValues: tickValues,
                        xAxisTickValuesFormat: granularity_obj.format,
                        xAxisTickInterval: granularity_obj.xAxisTickInterval,
                        xAxisTickIntervalGranularity: granularity_obj.xAxisTickIntervalGranularity,
                        caption: chart_caption[i],
                        showCaption: true,
                        captionFontWeight: "bold",
                        captionFontSize: TimeSeries.isMobile ? 17 : 12,
                        captionAlign: "left",
                        captionMargin: 0,
                        yAxisNoOfTicks: 3,
                        yAxisTickFormat:"s",
                        yAxisLineOpacity: 0,
                        dimensionalAnalysisHighlightColor: options.dimensionalAnalysisHighlightColor,
                        borderThickness: 1,
                        bordercolor: "white",
                        // bgColor: "#f3f3f3"
                    };

                    config = TimeSeries.mediator.publish("validate", config, TimeSeries.default.chart_features);
                    config = TimeSeries.mediator.publish("validate",config,TimeSeries.default.chart_options);
                    TimeSeries.chart_options[config.selector] = config;
                    TimeSeries.mediator.publish("renderColumnChart",config);
                    TimeSeries.mediator.publish("columnChartOrdinal",config,data,"DA");
                    TimeSeries.mediator.publish("createColumnChart", config, data, 0);
                    overlay = document.getElementById(selector + "_overlay");
                    overlay.parentNode.removeChild(overlay);
                    d3.selectAll("#" + selector + "_plot_group .column")
                        .attr("granularity_value",function(d,i){
                            return d.original_key;
                        })
                        .attr("id",function(d,i){
                            return "DA_" + d.original_key;
                        })
                        .style("cursor", "pointer")
                        .on("click", function(d, i) {
                            // console.log("nkdsjfsdkfdsnjdsfnjk", d, i);
                            var no_of_resets_active = 0,
                                panel_id = this.parentNode.id.split("_")[2],
                                k,
                                width = d3.select("#" + this.parentNode.parentNode.parentNode.id)[0][0].offsetWidth,
                                reset = document.getElementById("DA_panel_" + count + "_reset_button");
                            if (reset) {
                                reset.parentNode.parentNode.removeChild(reset.parentNode);
                            }
                            d3.select("#" + this.parentNode.parentNode.parentNode.id)
                                .append("foreignObject")
                                .append("xhtml:span")
                                .attr({
                                    id: "DA_panel_" + count + "_reset_button"
                                })
                                .style({
                                    "cursor": "pointer",
                                    "position": "relative",
                                    "margin-right": "5px",
                                    left: width - 35 + "px",
                                    "font-size": "0.8em",
                                    color: "#5388ee",
                                    opacity: 0.8
                                })
                                .text("Reset")
                                .on("click",function () {
                                    d3.selectAll('.x-axis-selected-value').text('');
                                    this.style.visibility = "hidden";
                                    resetChartSelection("DA_panel_" + count);
                                    var no_of_resets_active = 0,
                                        k;
                                    for (k = 1; k < panel_count; k++) {
                                        if (document.getElementById("DA_panel_" + k + "_reset_button") && document.getElementById("DA_panel_" + k + "_reset_button").style.visibility === "visible") {
                                            no_of_resets_active++;
                                        }
                                    }
                                    if (no_of_resets_active > 1) {
                                        document.getElementById("DA_reset_all_button").style.visibility = "visible";
                                    } else {
                                        document.getElementById("DA_reset_all_button").style.visibility = "hidden";
                                    }
                                    this.parentNode.parentNode.removeChild(this.parentNode);
                                });
                            document.getElementById("DA_panel_" + panel_id + "_reset_button").style.visibility = "visible";
                            for (k = 1; k < panel_count; k++) {
                                if (document.getElementById("DA_panel_" + k + "_reset_button") && document.getElementById("DA_panel_" + k + "_reset_button").style.visibility === "visible") {
                                    no_of_resets_active++;
                                }
                            }
                            if ((panel_count - 1) > 1 && no_of_resets_active > 1 && document.getElementById("DA_reset_all_button")) {
                                document.getElementById("DA_reset_all_button").style.visibility = "visible";
                            } else if(document.getElementById("DA_reset_all_button")){
                                document.getElementById("DA_reset_all_button").style.visibility = "hidden";
                            }
                            d3.event.stopPropagation();
                            d3.selectAll("#" + parent_id + "_dimensional_analysis_holder rect.column")
                                .style({
                                    "fill": da_chart_color,
                                    "stroke": "white",
                                    "stroke-dasharray": function(d,i) {
                                        return "0,0";
                                    }
                                });
                            mouseoutFunction(parent_id);
                            d3.select(this).style({
                                fill: da_hover_color
                            });
                            previous_click_granularity = clicked_object[+panel_id];
                            clicked_object[+panel_id] = d;
                            interactions(d.granularity, d, options, parent_id, series_id);
                            updateTooltip(chart_id, series_id, options, clicked_object[+panel_id], d, tooltip, this, granular_data, count);
                            var next_empty_panel,
                                nep;
                            for (nep = 2; nep <= 4; nep++) {
                                if (document.querySelector("#DA_panel_" + nep + " #suggestions_div")) {
                                    next_empty_panel = nep;
                                    break;
                                }
                            }
                            if (next_empty_panel) {
                                var compare_suggestions = document.querySelector("#DA_panel_" + next_empty_panel + " #suggestions_div #compare_suggestion"),
                                    chart_name = TimeSeries.chart_options[document.getElementById("DA_panel_" + panel_id).dataset.chart].caption || "Filter by time",
                                    series_name = document.getElementById("DA_panel_" + panel_id).dataset,
                                    clicked_object_granularity = clicked_object[+panel_id].granularity,
                                    original_key = clicked_object[+panel_id].original_key;                                        series_name = series_name.series;
                                switch (clicked_object_granularity) {
                                    case "month":
                                        original_key = TimeSeries.dataManipulationFunctions.mmmm_array[original_key];
                                        break;
                                    case "hour":
                                        original_key++;
                                        break;
                                    case "weekday":
                                        original_key = TimeSeries.dataManipulationFunctions.week_day_array[original_key];
                                        break;
                                }

                                var selected_chart_title = document.querySelector('#'+this.parentNode.parentNode.parentNode.id+' tspan').innerHTML,
                                    x_selected;
                                if (!document.querySelector('#'+this.parentNode.parentNode.parentNode.id+' tspan.x-axis-selected-value')) {
                                    x_selected = d3.select('#'+this.parentNode.parentNode.parentNode.id+' text').append('tspan');
                                    x_selected.attr('class', 'x-axis-selected-value');
                                } else {
                                    d3.selectAll('.x-axis-selected-value').text('');
                                    x_selected = d3.select('#'+this.parentNode.parentNode.parentNode.id+' tspan.x-axis-selected-value');
                                }
                                if (selected_chart_title == 'Quarter') {
                                    x_selected.text(' [Q' + original_key + ']');
                                } else {
                                    x_selected.text(' [' + original_key + ']');
                                }

                                if (!document.querySelector("#DA_panel_" + next_empty_panel + " #" + chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion")) {
                                    if (previous_click_granularity) {
                                        var previous_span = document.querySelector("#DA_panel_" + next_empty_panel + " #" + chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion");
                                        if (previous_span) {
                                            previous_span.remove();
                                        }
                                    }
                                    var span = document.createElement("span"),
                                        desc_span = document.createElement("span");

                                    desc_span.id = "suggestion_desc";
                                    span.id = series_name.replace(/ /g,"_") + "_suggestion";
                                    span.className = 'suggestion_div';
                                    or_span = document.createElement("span");
                                    or_span.className = 'or_span';
                                    or_span.innerHTML = "<br><br>OR<br><br>";
                                    span.appendChild(or_span);
                                    desc_span.innerHTML = "Do you want to compare how <b>" + series_name + "</b> of <b>" + chart_name + "</b> in <b>" + capitalizeFirstLetter(clicked_object_granularity) + " " + original_key + "</b> performing against another <b>" + capitalizeFirstLetter(clicked_object_granularity) + "</b>?";
                                    desc_span.style.color = "#5388ee";
                                    desc_span.style.cursor = "pointer";

                                    span.addEventListener("click",function() {
                                        var p = this.parentNode,
                                            pnext_empty_panel;
                                        for (nep = +panel_id; nep < panel_count; nep++) {
                                            if (document.querySelector("#DA_panel_" + nep + " #suggestions_div")) {
                                                pnext_empty_panel = nep;
                                                break;
                                            }
                                        }
                                        if (pnext_empty_panel) {
                                            var childrens = p.childNodes;
                                            for (var c = 0; c < childrens.length; c++) {
                                                document.querySelector("#DA_panel_" + pnext_empty_panel + " #suggestions_div #compare_suggestion").appendChild(childrens[c]);
                                            }
                                        }
                                        createDimensionCharts(chart_id, series_id, chart_id, next_empty_panel, series_attributes);
                                        // TimeSeries.mediator.publish("setDashboardHeight");
                                    });
                                    span.appendChild(desc_span);

                                    while (compare_suggestions.firstChild) {
                                        compare_suggestions.removeChild(compare_suggestions.firstChild);
                                    }

                                    compare_suggestions.appendChild(span);
                                } else {
                                    document.querySelector("#DA_panel_" + next_empty_panel + " #" + chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion #suggestion_desc").innerHTML = "Do you want to compare how <b>" + series_name + "</b> of <b>" + chart_name + "</b> in <b>" + capitalizeFirstLetter(clicked_object_granularity) + " " + original_key + "</b> performing against another <b>" + capitalizeFirstLetter(clicked_object_granularity) + "</b>?";
                                }
                            }
                        })
                        .on("mousemove",function(d,i){
                            var panel_id = this.parentNode.id.split("_")[2];
                            updateTooltip(chart_id, series_id, options, clicked_object[+panel_id], d, tooltip, this, granular_data, count);
                        })
                        .on("mouseover",function(d,i){
                            var yourSelect = document.querySelector(".dimension_filter"),
                                panel_id;
                            panel_id = this.parentNode.id.split("_")[2];
                            updateTooltip(chart_id, series_id, options, clicked_object[+panel_id], d, tooltip, this, granular_data, count);
                            if(!clicked_object[+panel_id]) {
                                if(yourSelect.options[yourSelect.selectedIndex].value !== "none") {
                                    for (var l = 1; l < panel_count; l++) {
                                        if(!clicked_object[l]) {
                                            resetChartSelection("DA_panel_" + l);
                                            if(retain_click[l]) {
                                                var changeEvent = new Event("click");
                                                document.querySelector("#DA_panel_" + l + "_dimensional_analysis_holder #DA_" + retain_click[l].original_key).dispatchEvent(changeEvent);
                                            }
                                        }
                                    }
                                    yourSelect.value = "none";
                                }
                                if(!clicked_object[+panel_id]) {
                                    d3.event.stopPropagation();
                                    d3.select(this).style({
                                        fill: da_hover_color
                                    });
                                    interactions(granularity,d,options,parent_id,series_id);
                                    yourSelect.value = "none";
                                }
                                retain_click = [undefined];
                            }
                        })
                        .on("mouseout",function(){
                            var panel_id = this.parentNode.id.split("_")[2];
                            tooltip.style.display = "none";
                            if(!clicked_object[+panel_id]) {
                                resetChartSelection(parent_id);
                            }
                        });
            }

            if(!render_da) {
                var span = document.createElement("span");
                span.innerHTML = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";
                document.querySelector("#" + parent_id).appendChild(span);
            }
    };

    var resetChartSelection = function (parent_id) {
        d3.selectAll("#" + parent_id + " rect.column")
            .style({
                "fill": da_chart_color,
                "stroke": "white",
                "stroke-dasharray": function(d,i) {
                    return "0,0";
                }
            });
        d3.selectAll("#" + parent_id + " .comcharts-TS-highlight-column")
            .attr({
                height: 0
            });

        var panel_id = parent_id.split("DA_panel_")[1];

        if (clicked_object[+panel_id]) {
            var chart_name = TimeSeries.chart_options[document.getElementById("DA_panel_" + panel_id).dataset.chart].caption || "Filter by time",
                series_name = document.getElementById("DA_panel_" + panel_id).dataset.series,
                suggestion;

            suggestion = document.getElementById(chart_name.replace(/ /g,"_") + "_" + series_name.replace(/ /g,"_") + "_suggestion");
            if (suggestion) {
                suggestion.remove();
            }
        }

        clicked_object[+panel_id] = null;
    };

    var createResetAllButton = function() {
        var reset_all_button = document.createElement("span");
        reset_all_button.id = "DA_reset_all_button";
        reset_all_button.className = "modal-close";
        reset_all_button.innerHTML = "Reset all";
        reset_all_button.addEventListener("click", function () {
            this.style.visibility = "hidden";
            for (var i = 1; i < panel_count; i++) {
                if (document.getElementById("DA_panel_" + i + "_reset_button")) {
                    document.getElementById("DA_panel_" + i + "_reset_button").style.visibility = "hidden";
                }
                resetChartSelection("DA_panel_" + i);
            }
        });

        return reset_all_button;
    };

    var updateTooltip = function(chart_id, series_id, options, clicked_object, hovered_object, tooltip, rect, data, count) {
        var tooltip_text = createTooltipText(chart_id, series_id, options, data, clicked_object, hovered_object, count),
            // dimensions = rect.getBoundingClientRect(),
            mouseX,
            mouseY;

        TimeSeries.mediator.publish("renderTooltipContent","dimensional_analysis_chart_tooltip",tooltip_text);
        tooltip.style.display = "block";

        mouseX = d3.event.pageX + 15;
        mouseY = d3.event.pageY - 15;

        tooltip.style.top = mouseY + "px";
        tooltip.style.left = mouseX  + "px";
    };

    var createTooltipText = function(chart_id, series_id, options, data, clicked_object, hovered_object, count) {
        var hovered_granularity = hovered_object.granularity,
            clicked_granularity,
            granularity_array,
            percentage,
            formatter,
            hovered_key,
            clicked_key,
            color,
            tooltip_text,
            map_object,
            filtered_value,
            total = 0,
            output_number_format = options.outputNumberFormat,
            number_formatter = d3.format(output_number_format),
            granularities = ["year", "quarter", "month", "week", "day", "weekday", "hour"],
            first_value,
            second_value;

        map_object = mapFunction(hovered_granularity, data);
        formatter = createTooltipFormatter(hovered_granularity, data);
        hovered_key = formatter(map_object.func(hovered_object.original_key), hovered_object.original_key);

        if(!clicked_object) {
            granularity_array = data[hovered_granularity];
        } else {
            clicked_granularity = clicked_object.granularity;
            map_object = mapFunction(clicked_granularity, data);
            formatter = createTooltipFormatter(clicked_granularity, data);
            clicked_key = formatter(map_object.func(clicked_object.original_key), clicked_object.original_key);
            if(clicked_object.granularity === hovered_granularity) {
                granularity_array = data[hovered_granularity];
            } else {
                granularity_array = filtered_data[hovered_granularity];
            }
        }

        for (var i = 0, length = granularity_array.length; i < length; i++) {
            total += granularity_array[i].value;
            if(hovered_object.original_key === granularity_array[i].key) {
                filtered_value = granularity_array[i].value;
            }
        }
        percentage = (( filtered_value / total) * 100).toFixed(2);

        if(!clicked_object || clicked_object.granularity === hovered_granularity) {
            color = da_chart_color;
            if(!clicked_object || clicked_object.original_key === hovered_object.original_key) {
                color = da_hover_color;
            }

            tooltip_text = "<table class='hovered_clicked_granularity_eq'><tr class='first_row'><td><span>" +
                            hovered_key + "</span> contributes</td></tr>";
            tooltip_text += "<tr class='second_row'><td style='color:" + color + ";'>" +
                            number_formatter(filtered_value) + " (" + percentage + "%)</td></tr>";
            tooltip_text += "<tr class='third_row'><td>to the total <b>" +
                            series_id + "</b></td></tr>";
            tooltip_text += "<tr class='fourth_row'><td><span class='first_span'>" +
                            number_formatter(total) + "</span> across all the <span class='second_span'>" +
                            hovered_granularity + "s</span></td></tr></table>";
        } else {
            if(granularities.indexOf(clicked_granularity) > granularities.indexOf(hovered_granularity)) {
                first_value = clicked_key;
                second_value = hovered_key;
            } else {
                first_value = hovered_key;
                second_value = clicked_key;
            }

            tooltip_text = "<table class='hovered_clicked_granularity_uneq'><tr class='first_row'><td><span>" +
                            hovered_key + "</span> contributes</td><tr>";
            tooltip_text += "<tr class='second_row'><td>" +
                            number_formatter(filtered_value) + " (" + percentage + "%)</td><tr>";
            tooltip_text += "<tr class='third_row'><td>to the total <b>" +
                            series_id + "</b></td><tr>";
            tooltip_text += "<tr class='fourth_row'><td><span class='first_span'>" +
                            number_formatter(total) + "</span> in <span class='second_span'>" +
                            clicked_key + "</span></td><tr></table>";
        }
        return tooltip_text;
    };

    var createTooltipFormatter = function(granularity, data) {
        switch(granularity) {
            case "month":
                return d3.time.format("%B");
            case "weekday":
                return d3.time.format("%A");
            case "quarter":
                var quarter_name = ["Quarter 1", "Quarter 2", "Quarter 3","Quarter 4"],
                    format = function(date, key) {
                        return quarter_name[key - 1];
                    };
                return format;
            case "week":
                return function(date, key) {
                    return "Week " + key;
                };
            case "hour":
                return function(date, key) {
                    return "Hour " + key;
                };
            case "day":
                return function(date, key) {
                    return "Day " + key;
                };
            default:
                return d3.time.format(mapFunction(granularity, data).format);
        }
    };

    var mapFunction = function(granularity, data) {
        var granularity_obj = {};
        switch(granularity) {
            case "year":
                var interval = 4;
                if (data.length < 4) {
                    interval = data.length;
                }
                granularity_obj = {
                    func: function(date) {
                        return new Date(date,0);
                    },
                    format: '%Y',
                    xAxisTickInterval: interval
                };
                return granularity_obj;
            case "month":
                granularity_obj = {
                    func: function(date) {
                        return new Date(new Date().getFullYear(),date);
                    },
                    format: '%b',
                    xAxisTickInterval: 4,
                    additionFactor: 0
                };
                return granularity_obj;
            case "hour":
                granularity_obj = {
                    func: function(date) {
                        var setHour = new Date(new Date().getFullYear() + "/01/01").setHours(date);
                        return new Date(setHour);
                    },
                    format: '%H',
                    xAxisTickInterval: 4,
                    additionFactor: 0
                };
                return granularity_obj;
            case "weekday":
                granularity_obj = {
                    func: function(date) {
                        var d, daytoset; // given: a Date object and a integer representing the week day
                        d = new Date("1/1/2014");
                        daytoset = date;
                        currentDay = d.getDay();
                        distance = daytoset - currentDay;
                        d.setDate(d.getDate() + distance);
                        return new Date(d);
                    },
                    format: '%a',
                    xAxisTickInterval: 2,
                    additionFactor: 0
                };
                return granularity_obj;
            case "week":
                granularity_obj = {
                    func: function(date) {
                        var year = 2012,
                            week = date,
                            d = new Date(year, 0, 1),
                            offset = d.getTimezoneOffset();
                        // ISO: week 1 is the one with the year's first Thursday
                        // so nearest Thursday: current date + 4 - current day number
                        // Sunday is converted from 0 to 7
                        d.setDate(d.getDate() + 4 - (d.getDay() || 7));

                        // 7 days * (week - overlapping first week)
                        d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000 * (week + (year == d.getFullYear() ? -1 : 0 )));

                        // daylight savings fix
                        d.setTime(d.getTime() + (d.getTimezoneOffset() - offset) * 60 * 1000);

                        // back to Monday (from Thursday)
                        d.setDate(d.getDate() - 3);
                        return d;
                    },
                    format: '%U',
                    xAxisTickInterval: 26,
                    additionFactor: 1
                };
                return granularity_obj;
            case "quarter":
                var quater_name = ["Q1", "Q2", "Q3","Q4"];
                granularity_obj = {
                    func: function(date) {
                        var quater_dates = [new Date("1/1/2000"), new Date("4/1/2000"), new Date("7/1/2000"),new Date("10/1/2000")];
                        return quater_dates[date - 1];
                    },
                    format: function(d,i){
                        return quater_name[i];
                    },
                    xAxisTickInterval: 0,
                    additionFactor: 1
                };
                return granularity_obj;
            case "day":
                granularity_obj = {
                    func: function(date) {
                        return new Date("1/" + date + "/2014");
                    },
                    format: "%d",
                    xAxisTickInterval: 3,
                    additionFactor: 1
                };
                return granularity_obj;
        }
    };

    var interactions = function(granularity,data,options, parent_id,series_id) {
        var config = {
            "year": null,
            "month": null,
            "hour": null,
            "day": null,
            "week":null,
            'weekday':null,
            'quarter':null
        },
        table_name = options.selector + "_DA",
        map_function,
        new_data,
       /* missing_data,*/
        granularity_obj;
        // removeGranularityFilterq({selector: table_name});
        switch(data.granularity) {
            case "year":
                granularity = "%Y";
                break;
            case "month":
                granularity = "%m";
                break;
            case "hour":
                granularity = "%H";
                break;
            case "day":
                granularity = "%d";
                break;
            case "weekday":
                granularity = "%w";
                break;
            case "week":
                granularity = "%U";
                break;
            case "quarter":
                granularity = "%m";
                break;
        }

        config[data.granularity] = [data.original_key, data.original_key];
        console.time("filter time");
        filterDataq(config, {selector: table_name});
        filtered_data = getGroupData({selector: table_name, granularity: granularity, aggregation: "sum",dateColumnName: options.dateColumnName,series_id:series_id}, selected_metric);
        for (var i in filtered_data) {
            if(i !== data.granularity && TimeSeries.chart_options[parent_id + "_dimension_" + i]) {
                filtered_data[i].sort(function(a,b){
                    return a.key - b.key;
                });
                new_data = JSON.parse(JSON.stringify(filtered_data[i]));
                granularity_obj = mapFunction(i, data);
                map_function = granularity_obj.func;
                var missing_data;

                for (var j = 0, length = granularities[granularity_order.indexOf(i)].length || new_data.length; j < length; j++) {
                    if(!new_data[j] && i !== "year") {
                        new_data[j] = {
                            key: j + granularity_obj.additionFactor,
                            value: 0
                        };
                    } else if(new_data[j].key !== (j + granularity_obj.additionFactor)  && i !== "year") {
                        missing_data = {
                            key: j + granularity_obj.additionFactor,
                            value: 0
                        };
                        new_data.splice(j,0,missing_data);
                    }
                    new_data[j].key = map_function(new_data[j].key);
                }

                createColumnChart(TimeSeries.chart_options[parent_id + "_dimension_" + i] ,new_data);

                d3.selectAll("#" + (parent_id + "_dimension_" + i) + "_plot_group rect.column")
                    .style("fill",function(d,i){
                        // if(new_data[i].value !== 0) {
                        return "#ECECEC";
                        // }
                        // return "steelblue";
                    });
            }
        }
    };

    var mouseoutFunction = function(parent_id) {
        d3.selectAll("#" + parent_id + "_dimensional_analysis_holder .comcharts-TS-highlight-column")
            .attr("height",0);
    };

    var createColumnChart =  function(options,data, value) {
        var plot_group = d3.select("#" + options.selector + "_plot_group"),
            column,
            chart_configs = TimeSeries.chart_configs[options.selector],
            fakeOrdinanalScale = chart_configs.fakeOrdinanalScale,
            height = chart_configs.height,
            width = chart_configs.width,
            xAxis = TimeSeries.xAxisFunctions,
            yAxis = TimeSeries.yAxisFunctions,
            xGroup = d3.select("#" + options.selector + "_svg_group #xaxis"),
            yGroup = d3.select("#" + options.selector + "_svg_group #yaxis"),
            yScale = chart_configs.yScale;

        column = plot_group.selectAll(".comcharts-TS-highlight-column")
            .data(data);

        column.enter()
            .append("rect")
            .attr("class", "comcharts-TS-highlight-column")
            .style("pointer-events", "none");

        column.style({
                "fill": options.chartColor[0],
                "stroke-width": options.borderThickness,
                "stroke": options.bordercolor
            })
            .attr({
                x: function(d) { return fakeOrdinanalScale(new Date(d.key)); },
                width: fakeOrdinanalScale.rangeBand(),
                y: function(d) { return !d.value ? 0 : yScale(value === 0 ? 0 : d.value); },
                height: function(d) { return !d.value ? 0 : (height - yScale(value === 0 ? 0 : d.value)); }
            });

        column.exit().remove();
    };

    var renderDA = function (chart_id, render, chart, series) {
// Suggestions:Do you want to compare how Week 54 of <<__>> is performing against another week? OR Select another chart > and series >
            var panel_body,
                suggestions_div = document.createElement("div"),
                count = chart_id.split("DA_panel_")[1],
                span;

            // panel_body.className = "panel-body";

            span = document.createElement("span");
            span.className = "comcharts-TS-DA-analyze-series";
            if (render) {
                span.innerHTML = "Analyze a series";
            } else {
                span.innerHTML = "Analyze another series";
            }

            suggestions_div.id = "suggestions_div";
            suggestions_div.className = 'suggestions_div';
            suggestions_div.appendChild(span);
            // document.getElementById(chart_id).appendChild(panel_body);
            panel_body = modalElements(chart_id, chart);

            span.style.cursor = "pointer";
            span.addEventListener("click", function () {
                TimeSeries.mediator.publish("initModal",{
                    content: panel_body,
                    modal_title: 'Select a series to "Roll-up by time"',
                    close_text: "x",
                    close_id: "DA_close_select_series",
                    modal_type: "custom",
                    selected_tab: "DA_panel_"+count,
                    maxHeight: "65%",
                    top:"20%"
                });
            });
            if (count == 1 && render) {
                TimeSeries.mediator.publish("initModal",{
                    content: panel_body,
                    modal_title: 'Select a series to "Roll-up by time"',
                    close_text: "x",
                    close_id: "DA_close_select_series",
                    modal_type: "custom",
                    selected_tab: "DA_panel_1",
                    maxHeight: "65%",
                    top:"20%"
                });
            }
            if (document.querySelector(".scotch-modal")) {
                var calculated_height = (document.querySelector('.scotch-modal').offsetHeight - document.querySelector('.comcharts-TS-modal-chartarea-title').offsetHeight - document.querySelector('.comcharts-TS-help').offsetHeight - 50);
                d3.selectAll(".comcharts-TS-DA-modal-selection-list-box").style("height", calculated_height + "px");
            }

            span = document.createElement("span");
            span.id = "compare_suggestion";
            suggestions_div.appendChild(span);
            document.getElementById(chart_id).appendChild(suggestions_div);
        // }
    };

    var modalElements = function (chart_id, chart_selector) {
        var modal_container = document.createElement('div'),
            chart_option,
            series_list = document.createElement("ul"),
            series_div = document.createElement('div'),
            count = chart_id.split("DA_panel_")[1],
            panel_body = document.createElement("div"),
            dashboard_span = document.createElement("div"),
            chart_span = document.createElement("div"),
            series_span = document.createElement("div"),
            span;

        modal_container.className = 'comcharts-TS-sidebar comcharts-TS-DA-modal-container';
        modal_container.style.width = '100%';
        var helptext_div = document.createElement('div');
        helptext_div.className = 'comcharts-TS-help';
        helptext_div.innerHTML = "Roll-up by time gives you histograms by various units of time e.g. year, quarter, month, week number, day of the week, etc. These pre-built visual histograms allow you to explore interesting insights about each series, visually determine contributions and compare each series against another.";
        modal_container.appendChild(helptext_div);

        var chart_options = TimeSeries.chart_options[chart_selector],
            metric_columns = chart_options.metricsColumnName,
            new_metrics = chart_options.newMetricsColumn,
            display_metrics = chart_options.displayMetricsColumn,
            metric_columns_length = metric_columns.length;

            for (var k = 0; k < metric_columns_length; k++) {
                series_options = document.createElement("li");
                series_options.className = 'comcharts-TS-sub-category-feature-modal';
                series_options.dataset.value = new_metrics[k];
                series_options.innerHTML = display_metrics[k];
                series_options.dataset.chart = chart_selector;
                series_list.appendChild(series_options);
            }

        series_span.className = 'suggestions-div-title';
        span = document.createElement("span");
        span.className = 'comcharts-TS-content-sub-heading comcharts-TS-suggestions-div-select-dashboard';
        span.innerHTML = 'Series';
        series_span.appendChild(span);

        series_list.id = "panel_DA_series_" + count + "_select_box";
        series_list.setAttribute("panel-id",count);
        series_list.className = 'comcharts-TS-sidebar-ul comcharts-TS-card-effect';

        //mimicking the behaviour of a drop down.......
        series_list.onfocus = function () { this.options[0].style.display = "none";};
        series_list.onblur = function () { this.options[0].style.display = "block";};
        series_div.className = "comcharts-TS-DA-modal-selection-list-box thick comcharts-background-lightgray";
        series_div.id = "comcharts_TS_DA_modal_series_selection";
        series_div.style.width = "100%";
        series_div.appendChild(series_span);
        series_div.appendChild(series_list);

        series_list.addEventListener("click",function () {
            var current_highlight = document.querySelector(".dimension_filter"),
                current_highlight_value = current_highlight.options[current_highlight.selectedIndex].value;
            var chart_id = event.srcElement.dataset.chart,
                series_id,// = event.srcElement.dataset,
                series_attributes = event.srcElement.dataset,
                selected_chart = event.srcElement.innerHTML;

            series_id = series_attributes.value;
            d3.selectAll("#panel_DA_series_"+count+"_select_box li").classed('active', false);
            d3.select(event.srcElement).classed('active', true);
            createDimensionCharts(chart_id, series_id, chart_id, count, series_attributes);
            TimeSeries.mediator.publish("closeModal");
            // TimeSeries.mediator.publish("setDashboardHeight");
            if(current_highlight_value !== "none") {
                returnFilterValue(current_highlight_value,options, "DA_panel_" + this.getAttribute("panel-id"));
            }
        });

        modal_container.appendChild(series_div);
        panel_body.appendChild(modal_container);
        return panel_body;
    };

    var daOnDrop = function (target_selector, chart_selector) {
        var main_DA_container = document.createElement("div"),
            panel_1 = document.createElement("div"),
            panel_2 = document.createElement("div"),
            panel_3 = document.createElement("div"),
            panel_4 = document.createElement("div"),
            highlight_view_div,
            description_div = document.createElement("div"),
            clearfix = document.createElement("div");

        main_DA_container.id = "dimensionalAnalysis";
        main_DA_container.innerHTML = '<div class="col-sm-12 comcharts-TS-content-sub-heading" style="padding:0px;"><div id="DA_highlight_view" class="col-sm-12 comcharts-TS-da-tab" style="border:none;"></div></div>';

        panel_1.id = "DA_panel_1";
        panel_1.className = "col-sm-4 comcharts-TS-da-tab";

        clearfix.id = "comchart_TS_clearfix";
        clearfix.className = "comcharts-TS-clearfix";

        main_DA_container.appendChild(panel_1);
        main_DA_container.appendChild(clearfix);

        document.querySelector("#" + target_selector).appendChild(main_DA_container);
        var helptext_div = document.createElement('div');
        helptext_div.className = 'comcharts-TS-help';
        helptext_div.id = "roll_up_help_text";
        helptext_div.innerHTML = "Roll-up by time gives you histograms by various units of time e.g. year, quarter, month, week number, day of the week, etc. These pre-built visual histograms allow you to explore interesting insights about each series, visually determine contributions and compare each series against another.";

        if(!document.getElementById('roll_up_help_text')) {
            document.querySelector("#" + target_selector).appendChild(helptext_div);
        }


        highlight_view_div = document.getElementById("DA_highlight_view");
        highlight_view_div.innerHTML = "<span class='comcharts-TS-da-chart-name comcharts-TS-da-drop-down-title'>Highlight</span>";
        create_selectbox = document.createElement("select");
        create_selectbox.setAttribute('class','dimension_filter');
        option_value = ['none','top','bottom','topfew','bottomfew'];
        option_text = ['None','Top','Bottom','Top Few','Last Few'];
        len = option_value.length;
        create_selectbox.id =/* div_id + */"_DA_agg";
        create_selectbox.setAttribute("parent_id","div");

        for(var i = 0;i<len;i++) {
            option = document.createElement("option");
            option.value = option_value[i];
            option.text = option_text[i];
            create_selectbox.appendChild(option);
        }

        highlight_view_div.appendChild(create_selectbox);
        if (!document.getElementById(/*div_id + */"_DA_agg")) {
            user_div.appendChild(highlight_view_div);
        }

        renderDA("DA_panel_1", true, chart_selector, "Surface Pressure");
    };
    TimeSeries.mediator.subscribe("configureDimensionalAnalysis",initConfig);
    TimeSeries.mediator.subscribe("initDimensionalAnalysis",init);
    TimeSeries.mediator.subscribe("createDimensionData",createData);
    TimeSeries.mediator.subscribe("createDimensionCharts",createCharts);
    TimeSeries.mediator.subscribe("createColumnChart",createColumnChart);
    TimeSeries.mediator.subscribe("seeDimensionalAnalysis",seeDimensionalAnalysis);
    TimeSeries.mediator.subscribe("updateDimensionalAnalysis",updateChart);
    TimeSeries.mediator.subscribe("createOverlay",createOverlay);
    TimeSeries.mediator.subscribe("dimensionalAnalysisConfigCallback",dimensionalAnalysisConfigCallback);
    TimeSeries.mediator.subscribe("createOverlay",createOverlay);
    TimeSeries.mediator.subscribe("queryInitializer",queryInitializer);
    TimeSeries.mediator.subscribe("executeOnComplete",executeOnComplete);

    return {
        init : init,
        createData: createData,
        createCharts: createCharts,
        mapFunction: mapFunction,
        createOverlay: createOverlay
    };
})();
var check = false;
(function(a) {
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
        check = true;
    }
})(navigator.userAgent||navigator.vendor||window.opera);
TimeSeries.isMobile = check;
console.log("isMobile", TimeSeries.isMobile);

check = false;
(function(a){
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|pprox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
        check = true;
    }
})(navigator.userAgent||navigator.vendor||window.opera);
TimeSeries.isMobileOrTablet = check;
console.log("isMobileOrTablet", TimeSeries.isMobileOrTablet);

var seeDimensionalAnalysis = function (options, parent_id) {
    TimeSeries.mediator.publish("createChart", options, parent_id);
};

var updateDimensionalAnalysis = function (chart_selector,series) {
    TimeSeries.mediator.publish("updateDimensionalAnalysis",chart_selector,series);
};

var createMenuBar = function (options) {
    var menu_bar_status;
    TimeSeries.status_for_menu_bar = TimeSeries.status_for_menu_bar || {
        on_load_count: 0,
        on_complete_count: 0,
        onComplete: []
    };
    menu_bar_status = TimeSeries.status_for_menu_bar;

    if (options.menubarLocation === "side") {
        TimeSeries.status_for_menu_bar.onComplete.push({function_name:"initSideBar", attribute:[options]});
    } else {
        TimeSeries.status_for_menu_bar.onComplete.push({function_name:"initMenuBar", attribute:[options]});
    }
};

var loadData = function (datasets) {
    var i,
        data_for,
        data_for_length,// = data_for.length,
        id;
    TimeSeries.global_data_sets = datasets;

    for (id in datasets) {
        TimeSeries.data_load_status[id] = {status:false, onComplete:[] };
        data_for = datasets[id].dataFor;
        data_for_length = data_for.length;

        for (i = 0; i < data_for_length; i++) {
            TimeSeries.chart_options[data_for[i]] = {};
            TimeSeries.chart_options[data_for[i]].data = id;
            TimeSeries.gChart_to_data_set_mapping[data_for[i]] = TimeSeries.gChart_to_data_set_mapping[data_for[i]] || [];
            TimeSeries.gChart_to_data_set_mapping[data_for[i]].push(id);

            TimeSeries.data_aliases[data_for[i]] = TimeSeries.data_aliases[data_for[i]] || {"alias": {}};
            TimeSeries.data_aliases[data_for[i]].alias = TimeSeries.mediator.publish("extendDefaults", TimeSeries.data_aliases[data_for[i]].alias, TimeSeries.global_data_sets[id].alias);
        }
    }

    for (id in datasets) {
        TimeSeries.mediator.publish("parseGlobalData", datasets[id].data, "executeOnComplete", id);

        if (datasets[id].enableLiveData) {
            TimeSeries.data_load_status[id].onComplete.push({function_name:"liveDataRefresh",attribute:[datasets[id], id]});
        }
    }
};

var createChart = function (options, parent_id) {
    var i = 0,
        data_for,
        data_for_length,// = data_for.length,
        id = 1,
        datasets = {
            "1": {
                data: options.data,
                dataFormat: options.dataFormat,
                dataSource: options.dataSource,
                dataFor: [options.selector],
                dataName: options.dataName,
                dataDescription: options.dataDescription
            }
        };

    TimeSeries.global_data_sets = datasets;
    TimeSeries.data_load_status[id] = {status:false, onComplete:[] };
    data_for = datasets[id].dataFor;
    data_for_length = data_for.length;
    TimeSeries.chart_options[data_for[i]] = {};
    TimeSeries.chart_options[data_for[i]].data = id;
    TimeSeries.gChart_to_data_set_mapping[data_for[i]] = TimeSeries.gChart_to_data_set_mapping[data_for[i]] || [];
    TimeSeries.gChart_to_data_set_mapping[data_for[i]].push(id);

    TimeSeries.data_aliases[data_for[i]] = TimeSeries.data_aliases[data_for[i]] || {"alias": {}};
    TimeSeries.data_aliases[data_for[i]].alias = TimeSeries.mediator.publish("extendDefaults", TimeSeries.data_aliases[data_for[i]].alias, TimeSeries.global_data_sets[id].alias);

    var selector = options.selector,
        on_complete_length;

    TimeSeries.chart_status[selector] = {status:false, onComplete:[] };
    TimeSeries.status_for_menu_bar = TimeSeries.status_for_menu_bar || {
        on_load_count: 0,
        on_complete_count: 0,
        onComplete: []
    };

    TimeSeries.status_for_menu_bar.on_load_count += 1;

    //All chart mapping.
    TimeSeries.allCharts.push(options.selector);

    if (/*!options.data && */TimeSeries.chart_options[selector]) {
        options.data = TimeSeries.chart_options[selector].data;
        options.isGlobalData = true;

        TimeSeries.gData_set_to_chart_mapping[options.data] = TimeSeries.gData_set_to_chart_mapping[options.data] || [];
        TimeSeries.gData_set_to_chart_mapping[options.data].push(selector);
        if (TimeSeries.data_load_status[options.data].status !== "completed") {
            TimeSeries.data_load_status[options.data].onComplete.push({function_name:"configureDimensionalAnalysis",attribute:[options]});
            TimeSeries.data_load_status[options.data].onComplete.push({function_name:"initDimensionalAnalysis",attribute:[options, parent_id]});
            TimeSeries.mediator.publish("parseGlobalData", datasets[id].data, "executeOnComplete", id);

            return;
        }
    }
};

TimeSeries.mediator.subscribe("createChart", createChart);
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
