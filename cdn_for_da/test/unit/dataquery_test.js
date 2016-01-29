Papa.parse("../examples/data/data_500_years.csv", {
    download: true,
    header:true,
    // fastMode:false,
    complete:function(obj) {
        var data = obj.data,
            data1 = [
                {date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab"},
                {date: "2011-11-14T16:20:19Z", quantity: 2, total: 190, tip: 100, type: "tab"},
                {date: "2011-11-14T16:53:41Z", quantity: 2, total: 90, tip: 0, type: "tab"},
                {date: "2011-11-14T16:54:06Z", quantity: 1, total: 100, tip: 0, type: "cash"},
                {date: "2011-11-14T16:58:03Z", quantity: 2, total: -21, tip: 0, type: "tab"},
                {date: "2011-11-14T17:07:21Z", quantity: 2, total: 90, tip: 0, type: "tab"},
                {date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 200, type: "visa"},
                {date: "2011-11-14T16:30:43Z", quantity: 2, total: 90, tip: 0, type: "tab"},
                {date: "2011-11-14T16:48:46Z", quantity: 2, total: 90, tip: 0, type: "tab"},
                {date: "2011-11-14T17:22:59Z", quantity: 2, total: 90, tip: 0, type: "tab"},
                {date: "2011-11-14T17:25:45Z", quantity: 2, total: 200, tip: 0, type: "cash"},
                {date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 100, type: "visa"}
            ],
            data2 = [
                {date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab"}
            ];
        TimeSeries.Query.init("table",data1);
        TimeSeries.Query.init("table1",data);
        TimeSeries.Query.init("table3",data);
        TimeSeries.Query.init("table10",data);
        TimeSeries.Query.init("tm",data);
        TimeSeries.Query.init("tablemin",data);
        TimeSeries.Query.init("tt",data2);
        TimeSeries.Query.init("tsd",data);

        module('Query test');

        // test('initilize', function() {
        //     var query_init = Query.init("table1",[{'a':1,'b':2},{'c':4,'d':5}]);
        //     equal(query_init, true, "test");
        // });
        // {   "dimension":["date","quantity"],
        //     "metric":[{'abc':function(){}}]

        // }

        test('setQuery method on passing connectorName, nodeName and query config updates the JSON config', function() {
            var validate = {"query_config":{"dimension":["total"]}};
            TimeSeries.Query.setQuery("table","query1",{"dimension":["total"]});
            deepEqual(TimeSeries.query_data.table.query1, validate, "setQuery updates JSON config");
        });

        test('createDimension on passing function or aggregate method creates metrics and updates it to JSON config', function() {
            var validate = [{ "China": "11.77","India": "94.14","Japan": "11.72","x": "9972009000000"}];
            TimeSeries.Query.init("table212",data);
            TimeSeries.Query.setQuery("table212","query3",{"dimension":["x","India"]});
            deepEqual(TimeSeries.query_data.table212.query3_dimension_.top(1), validate, "createDimension updates JSON config");
        });

        test('create dimension with custom function',function(){
            var validate = [{"China": "19.33","India": "44.35","Japan": "37.89","x": "11739148200000"}];
            TimeSeries.Query.init("table100",data);
            TimeSeries.Query.setQuery("table100","query4",{"dimension":[{'abc':function(d){return d; }}]});
            deepEqual(TimeSeries.query_data.table100.query4_dimension_.top(1), validate, "createDimension updates JSON config");
        });

        test('createMetric on passing custom function,creates metrics on the connector and updates the JSON config',function(){
            var validate = [{"key": "a","value": 94.9}];
            TimeSeries.Query.init("table100",data);
            TimeSeries.Query.setQuery("table100","querys",{"metric":[{"India":function (d) { return +d.India; }}]});
            deepEqual(TimeSeries.query_data.table100.querys_metric_.top(1), validate, "createMetric updates JSON config");
        });

        test('mertic on passing aggregation functions with groupBy returns grouped aggregated values',function(){
            TimeSeries.Query.setQuery("tm","qs",{  "dimension":["x"],
                                        "metric":[{"India":"sum"}],
                                    });
            var validate = [{"key": "4102425000000","value": 99.81}];
            deepEqual(TimeSeries.query_data.tm.qs_metric_.top(1), validate, "createMetric applies group and aggregation and updates JSON config");
        });

        test('mertic on passing aggregation function of min without groupBy returns minimum value for entire dimension',function(){
            TimeSeries.Query.setQuery("tablemin","qf",{"metric":[{"India":'min'}]
                                    });
            var validate = [{"key": "a","value": 10.49}];
            deepEqual(TimeSeries.Query.getData("tablemin","qf"), validate, "createMetric applies aggregation and updates JSON config");
        });

        test('mertic on passing aggregation function of max with groupBy returns minimum value for entire dimension',function(){
            TimeSeries.Query.setQuery("tm","qf1",{
                                        "metric":[{"Japan":'max'}],
                                    });
            var validate = [{ "key": "a", "value": 99.91}];
            deepEqual(TimeSeries.query_data.tm.qf1_metric_.top(1), validate, "createMetric applies aggregation and updates JSON config");
        });

        test('mertic on passing aggregation functions such as sum without groupBy returns aggregated values for entire dimension',function(){
            TimeSeries.Query.setQuery("tm","qf3",{
                                        "metric":[{"Japan":'median'}]
                                    });
            deepEqual(TimeSeries.Query.getData("tm","qf3")[0].value.val,54.72, "createMetric applies aggregation and updates JSON config");
        });

        test('statistic function in metric',function(){
            TimeSeries.Query.init("table50",data);
            TimeSeries.Query.setQuery("table50","qm",{ "metric":[{"Japan":'sum'}],
            });
            var validate2 = [{"key": "a","value": 26871.980000000007}]
            deepEqual(TimeSeries.query_data.table50.qm_metric_.top(1),validate2, "createMetric updates JSON config");
        });

        test('applyFilter on passing config applies ------filters on dimension and updates the JSON config',function(){
            var validate = { "China": "26.59","India": "88.94","Japan": "97.71","x": "10035081000000"};
            TimeSeries.Query.setQuery("table1","query",{"dimension":["x"],"filter":[{"column":"Japan","condition":"GreaterThan","values":65}]});
            deepEqual(TimeSeries.Query.getData("table1",'query')[0], validate, "applyFilter filters data and updates JSON config");
        });

        test('addFilter on passing config applies filters on dimension and updates the JSON config',function(){
            var validate = [{"date": "2011-11-14T16:20:19Z","quantity": 2,"tip": 100,"total": 190,"type": "tab"}];
            TimeSeries.Query.setQuery("table","query",{"dimension":["date"],"filter":[{"column":"total","condition":"GreaterThan","values":100},{"column":"type","condition":"Equal","values":"tab"}]});
            TimeSeries.Query.addFilter("table","query",[{"column":"quantity","condition":"Equal","values":1}]);
            deepEqual(TimeSeries.query_data.table.query_dimension_.top(1), [], "addFilter adds filters on existing data and updates JSON config");
        });

        test('removeFilter on passing config removes filters on dimension and updates the JSON config',function(){
            var validate = [ {"China": "22.4","India": "77.11", "Japan": "21.1","x": "1388514600000"}];
            TimeSeries.Query.setQuery("table3","query8",{"dimension":["x"]});
            TimeSeries.Query.addFilter("table3","query8",[{"column":"India","condition":"Equal","values":'77.11'}]);
            TimeSeries.Query.addFilter("table3","query8",[{"column":"Japan","condition":"Equal","values":'21.1'}]);
            deepEqual(TimeSeries.Query.getData("table3","query8"), validate, "addFilter adds filters on existing data and updates JSON config");
            TimeSeries.Query.removeFilter("table3","query8",[{"column":"India"}]);
            deepEqual(TimeSeries.Query.getData("table3","query8").length, 1, "removeFilter removes all filters on specified dimension and updates JSON config");
            TimeSeries.Query.removeFilter("table3","query8",[{"column":"Japan"}]);
            deepEqual(TimeSeries.Query.getData("table3","query8").length,500, "removeFilter removes all filters on specified dimension and updates JSON config");
        });

        test('propogateFilter applies filters on affected nodes and updates the JSON config',function(){
            TimeSeries.Query.init("table52",data1);
            var validate_filter_propogation_set_query = [{"date": "2011-11-14T17:29:52Z","quantity": 1,"tip": 100,"total": 200,"type": "visa"}],
                validate_filter_propogation_add_filter = [{date: "2011-11-14T16:28:54Z", quantity: 1, total: 300, tip: 200, type: "visa"},
                                                        {date: "2011-11-14T17:29:52Z", quantity: 1, total: 200, tip: 100, type: "visa"}],
                validate_filter_propogation_remove_filter = [
                                                                {"date": "2011-11-14T16:17:54Z","quantity": 2,"tip": 100,"total": 190,"type": "tab"},
                                                                {"date": "2011-11-14T16:20:19Z","quantity": 2,"tip": 100,"total": 190,"type": "tab"},
                                                                {"date": "2011-11-14T16:28:54Z","quantity": 1,"tip": 200,"total": 300,"type": "visa"},
                                                                {"date": "2011-11-14T17:25:45Z","quantity": 2,"tip": 0,"total": 200,"type": "cash"},
                                                                {"date": "2011-11-14T17:29:52Z","quantity": 1,"tip": 100,"total": 200,"type": "visa"}
                                                            ];
            TimeSeries.Query.setQuery("table","query",{"dimension":["date"],"filter":[{"column":"total","condition":"GreaterThan","values":100}]});
            TimeSeries.Query.setQuery("table52","qm",{"dimension":["date"],"filter_impacted_by":[{"table":"query"}]});
            deepEqual(TimeSeries.query_data.table52.qm_dimension_.top(1), validate_filter_propogation_set_query, "filters propogated on setQuery call");
            TimeSeries.Query.addFilter("table","query",[{"column":"quantity","condition":"Equal","values":1}]);
            deepEqual(TimeSeries.Query.getData("table52","qm"), validate_filter_propogation_add_filter, "filters propogated on addFilter call");
            TimeSeries.Query.removeFilter("table","query",[{"column":"quantity","condition":"Equal","values":1}]);
            deepEqual(TimeSeries.Query.getData("table52","qm"), validate_filter_propogation_remove_filter, "filters propogated on removeFilter call");
        });

        test('propogateData updates data of affected connector and updates the JSON config',function(){
            var validate = [{"date": "2011-11-14T17:29:52Z","quantity": 1,"tip": 100,"total": 200,"type": "visa"}];
            TimeSeries.Query.init("t1",data1);
            TimeSeries.Query.init("t2",data1);
            TimeSeries.Query.init("t3",[{date: "2011-11-14T16:17:54Z", quantity: 2, total: 190, tip: 100, type: "tab"}]);
            TimeSeries.Query.setQuery("t1","q1",{"dimension":["date"],"filter":[{"column":"total","condition":"GreaterThan","values":100}]});
            TimeSeries.Query.setQuery("t2","q2",{"dimension":["date"],"data_impacted_by":[{"t1":"q1"}]});
            TimeSeries.Query.setQuery("t3","q3",{"dimension":["date"],"data_impacted_by":[{"t2":"q2"}]});
            var d = TimeSeries.Query.getData("t1","q1");
            deepEqual(TimeSeries.Query.getData("t3","q3").length, 5, "data propogated on getData call");
        });

        // TimeSeries.Query.setQuery("tsd","qq1",{"metric":[{"total":"sum"}],'group':'type'});
        // TimeSeries.Query.addFilter("tsd","qq1",[{"column":"total","condition":"GreaterThan","values":100}]);
        // console.log(TimeSeries.Query.getData("tsd","qq2",{"metric":"type",'sort':{'desc':'key'}}));
        // TimeSeries.Query.removeFilter("tsd","qq2",[{"column":"total"}]);
        test('Fiter key or value after metric is applyed on query from the getData function',function(){
            var validate = [{"key": "a","value": 27567.71}];
            TimeSeries.Query.setQuery("table10","query",{'metric':[{"India":'sum'}]});
            deepEqual(TimeSeries.Query.getData("table10","query",{'filter':{"column":"value","condition":"GreaterThan","values":20}}),validate, "Fitler data");
        });


        // var xy = x_y.group().reduce(function(d) { return d; },function(d) { return d; },function(d) { return d; });
        // console.log(xy.top(Infinity));

            // { year:2010,month:null,day:null,hour:06,minute:06,second:null }
        test('mertic on passing aggregation function standard without groupBy returns aggregated values for entire dimension',function(){
            TimeSeries.Query.setQuery("tsd","qsd3",{"metric":[{"Japan":"std"}]});
            deepEqual(TimeSeries.Query.getData("tsd","qsd3")[0].value.std,25.982227562670605, "createMetric applies aggregation and updates JSON config");
        });

        test('updateData on passing all as parameter for updateAll,updates the entire dataset in crossfilter',function(){
            TimeSeries.Query.setQuery("tsd","qsd1",{"metric":[{"India":"std"}]});
            deepEqual(TimeSeries.Query.getData("tsd","qsd1")[0].value.std,24.55959931317285, "createMetric applies aggregation and updates JSON config");
            TimeSeries.Query.updateData("tsd",[],"all");
            TimeSeries.Query.setQuery("tsd","qsd2",{"dimension":["date"]});
            deepEqual(TimeSeries.Query.getData("tsd","qsd2"),[], "updateData updates entire dataset");
        });

        test('getData on passing config parameter with bottom return the last N records',function(){
            TimeSeries.Query.init("bottom",data);
            TimeSeries.Query.setQuery("bottom","q",{"dimension":["x"]});
            deepEqual(TimeSeries.Query.getData("bottom","q",{bottom:1}), [{"China": "11.77","India": "94.14","Japan": "11.72","x": "9972009000000"}], "returns bottom 1 element");
        });

        test('delete Query on passing the table name and query name',function(){
            TimeSeries.Query.init("deleteTable",data);
            TimeSeries.Query.setQuery("deleteTable","query",{"dimension":["x"],"metric":[{'Japan':'sum'}]});
            TimeSeries.Query.deleteQuery("deleteTable","query");
            deepEqual(TimeSeries.Query.getData("deleteTable","query"),false, "Query doesnot exit");
        });

        test('filter data from the getData function ',function(){
            var validate = [
                {
                    "China": "57.13",
                    "India": "77.12",
                    "Japan": "75.37",
                    "x": "1293820200000"
                }
            ];
            TimeSeries.Query.init("filterTable",data);
            TimeSeries.Query.setQuery("filterTable","query",{"dimension":["x"]});
            deepEqual(TimeSeries.Query.getData("filterTable","query",{'filter':{"column":"India","condition":"Equal","values":'77.12'}}),validate, "Filter the key value pair");
        });

}});
