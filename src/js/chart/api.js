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
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) {
        check = true;
    }
})(navigator.userAgent||navigator.vendor||window.opera);
TimeSeries.isMobileOrTablet = check;
console.log("isMobileOrTablet", TimeSeries.isMobileOrTablet);

var seeDimensionalAnalysis = function (options, parent_id) {
    TimeSeries.mediator.publish("initDimensionalAnalysis",options, parent_id);
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

var createChart = function (options) {
    if(options.parent) {
        TimeSeries.viewDivFunctions.createDiv({
                'container_id':options.parent,
                'div_id':options.selector,
                'height':options.height ,
                'width':options.width,
                'is_deletable':false,
                'delete_html':''
            });
        options.width = "100%";//(parseInt(document.getElementById(options.selector).getBoundingClientRect().width) / TimeSeries.view.container_obj[options.parent].width * 100) + "%";
        options.height = "100%";//(parseInt(document.getElementById(options.selector).getBoundingClientRect().height) / TimeSeries.view.container_obj[options.parent].height * 100) + "%";
    }

    var selector = options.selector,
        on_complete_length;

    TimeSeries.chart_status[selector] = {status:false, onComplete:[] };
    TimeSeries.status_for_menu_bar = TimeSeries.status_for_menu_bar || {
        on_load_count: 0,
        on_complete_count: 0,
        onComplete: []
    };

    TimeSeries.status_for_menu_bar.on_load_count += 1;
    TimeSeries.chart_status[selector].onComplete.push({function_name:"updateStatus", attribute:["menuBar"]});

    //All chart mapping.
    TimeSeries.allCharts.push(options.selector);

    if (!options.data && TimeSeries.chart_options[selector]) {
        options.data = TimeSeries.chart_options[selector].data;
        options.isGlobalData = true;

        TimeSeries.gData_set_to_chart_mapping[options.data] = TimeSeries.gData_set_to_chart_mapping[options.data] || [];
        TimeSeries.gData_set_to_chart_mapping[options.data].push(selector);

        if (TimeSeries.chart_options[selector].enableLiveData) {
            options.enableLiveData = true;
            options.refreshFrequency = TimeSeries.chart_options[selector].refreshFrequency;
            options.inputDataRange = TimeSeries.chart_options[selector].inputDataRange;
            options.dataBucketSize = TimeSeries.chart_options[selector].dataBucketSize;

            if (TimeSeries.data_load_status[options.data].status !== "completed") {
                on_complete_length = TimeSeries.data_load_status[options.data].onComplete.length;
                switch(options.chartType) {
                    case "line":
                        TimeSeries.data_load_status[options.data].onComplete.splice((on_complete_length-1), 0, {
                            function_name:"initializeLineChart",
                            attribute:[options]
                        });
                        //TimeSeries.mediator.publish("initializeLineChart",options);
                    break;
                    case "column":
                        TimeSeries.data_load_status[options.data].onComplete.splice((on_complete_length-1), 0, {
                            function_name:"initializeColumnChart",
                            attribute:[options]
                        });
                        //TimeSeries.mediator.publish("initializeColumnChart",options);
                    break;
                }
            }
            return;
        } else {
            if (TimeSeries.data_load_status[options.data].status !== "completed") {
                switch(options.chartType) {
                    case "line":
                        TimeSeries.data_load_status[options.data].onComplete.push({function_name:"initializeLineChart",attribute:[options]});
                    break;
                    case "column":
                        TimeSeries.data_load_status[options.data].onComplete.push({function_name:"initializeColumnChart",attribute:[options]});
                    break;
                }
                return;
            }
        }
    }

    switch(options.chartType) {
        case "line":
            TimeSeries.mediator.publish("initializeLineChart",options);
            break;
        case "column":
            TimeSeries.mediator.publish("initializeColumnChart",options);
            break;
    }
};