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