var comCharts = (function() {
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

        console.log(data,callBack,dataset);
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
