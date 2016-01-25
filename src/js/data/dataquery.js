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
