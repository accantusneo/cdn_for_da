
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

        // console.log(data,callBack,dataset);
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