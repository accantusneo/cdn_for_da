/**
@author Pykih developers
@module chartMenu
@namespace TimeSeries
*/

TimeSeries.sideBar = (function () {
    var sideBar_list,
        sideBar_subCategories,
        sideBar_categories,
        sideBar_content,
        ul,
        content_super_heading,
        content_heading,
        content_sub_heading,
        content_secondry_heading,
        content_secondry_sub_heading,
        all_dashboards,
        sidebar_tooltip;

    var switchOptions = function (selected,id) {
        selected_query = '.comcharts-TS-sidebar-content.'+selected;
        var previous_selected = document.querySelector('.comcharts-TS-sidebar-content.show'),
            split,
            chart_selector;
        if (previous_selected.classList.contains("custom-data-sets")) {
            split = previous_selected.id.split("_data_content");
            if (TimeSeries.chart_options[split[0]]) {
                chart_selector = split[0];
                svg = document.getElementById(chart_selector+"_svg");
                svg.setAttribute("width",TimeSeries.chart_options[chart_selector].width + "px");
                svg.setAttribute("height",TimeSeries.chart_options[chart_selector].height + "px");
                document.getElementById(chart_selector).appendChild(svg);
            } else {
                var data_id = split[0].split("globaldataset_")[1],
                    data_set = TimeSeries.global_data_sets[+data_id];
                for (var i = 0; i < data_set.dataFor.length; i++) {
                    chart_selector = data_set.dataFor[i];
                    svg = document.getElementById(chart_selector+"_svg");
                    svg.setAttribute("width",TimeSeries.chart_options[chart_selector].width + "px");
                    svg.setAttribute("height",TimeSeries.chart_options[chart_selector].height + "px");
                    document.getElementById(chart_selector).appendChild(svg);
                }
            }
        }
        d3.selectAll('.comcharts-TS-sidebar-content').classed('show', false);
        if (selected === "custom-data-sets") {
            d3.select("#" + id + "_content").classed('show', true);
        } else {
            d3.select(selected_query).classed('show', true);
        }

        switch (selected) {
            case 'dimensional-analysis':
                d3.select(".comcharts-TS-sidebar-content.dimensional-analysis #dimensionalAnalysis").remove();

                TimeSeries.mediator.publish('initDimensionalAnalysis','chart1', selected_query, all_dashboards);
                break;

            case 'lead-lag-analysis':
                d3.select(".comcharts-TS-sidebar-content.lead-lag-analysis #timeShift").remove();
                TimeSeries.mediator.publish('initTimeShift','chart1', selected_query, all_dashboards);
                break;

            case 'custom-data-sets':
                var chart_id,
                    dataset_id;
                split = id.split("_");
                if (split.indexOf("globaldataset") > -1) {
                    dataset_id = id.split("_data")[0].split("globaldataset_")[1];
                    chart_id = TimeSeries.global_data_sets[+dataset_id].dataFor[0];
                    TimeSeries.mediator.publish("showDataAndCharts", chart_id, id, true);
                } else {
                    chart_id = id.split("_data")[0];
                    TimeSeries.mediator.publish("showDataAndCharts", chart_id, id, false);
                }
                break;

            case 'trend-searcher':
                d3.select(".comcharts-TS-sidebar-content.trend-searcher #timeSearcher").remove();
                TimeSeries.mediator.publish('initTSCOnLoad', selected_query, all_dashboards, "normal");
                break;
        }
        setDashboardHeight();
    };

    var createSideBarTooltip = function () {
        sidebar_tooltip = document.createElement('div');
        sidebar_tooltip.className = 'comcharts-TS-tooltip_div comcharts-TS-sidebar-tooltip';
        document.body.appendChild(sidebar_tooltip);
    };

    /**
    *   @function: init
    *   @description: Initialize and render the side-bar
    */
    var init = function (options) {
        TimeSeries.chart_options.menu = options;
        createFeaturesSideBar(options);
        createSideBarTooltip();

        var sideBar_subCategories = document.querySelectorAll('.comcharts-TS-sidebar .comcharts-TS-sub-category');

        for (var i=0, len=sideBar_subCategories.length ; i<len ; i++) {
            sideBar_subCategories[i].addEventListener('click', function() {
                var activeClass = "active";

                switchOptions(this.classList[1],this.id);

                d3.selectAll(".comcharts-TS-sidebar .comcharts-TS-sub-category").classed(activeClass, false);
                d3.select(this).classed(activeClass, true);
            });
            sideBar_subCategories[i].addEventListener('mousemove', function(e) {
                var tooltip_text = '';
                switch (this.classList[1]) {
                    case 'dimensional-analysis':
                        tooltip_text = 'Roll-up by time gives you histograms by various units of time e.g. year, quarter, month, week number, day of the week, etc. These pre-built visual histograms allow you to explore interesting insights about each series, visually determine contributions and compare each series against another.';
                        break;
                    default:
                        tooltip_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
                        break;
                }
                sidebar_tooltip.innerHTML = tooltip_text;
                sidebar_tooltip.style.left = (e.clientX+15)+'px';
                sidebar_tooltip.style.top = (e.clientY+15)+'px';
                sidebar_tooltip.style.display = 'block';
            });
            sideBar_subCategories[i].addEventListener('mouseout', function(e) {
                sidebar_tooltip.style.display = 'none';
            });
        }
    };

    var addFeatureCategory = function (className, categoryText, id) {
        sideBar_categories = document.createElement('li');
        sideBar_categories.className = 'comcharts-TS-category '+className;
        sideBar_categories.innerHTML = categoryText;

        if (id) {
            sideBar_categories.id = id;
        }

        return sideBar_categories;
    };

    var addFeatureSubCategory = function (className, subCategoryText, id) {
        sideBar_subCategories = document.createElement('li');
        sideBar_subCategories.className = 'comcharts-TS-sub-category '+className;
        sideBar_subCategories.innerHTML = subCategoryText;

        if (id) {
            sideBar_subCategories.id = id;
        }

        return sideBar_subCategories;
    };

    var addContentSubHeading = function (displayText) {
        var content_sub_heading = document.createElement('div');
        content_sub_heading.className = 'comcharts-TS-content-sub-heading';
        content_sub_heading.innerHTML = (displayText !== undefined) ? displayText : 'Content sub-heading';

        return content_sub_heading;
    };

    var addContentHeading = function (displayText, additionalClassName) {
        var content_heading = document.createElement('div');
        content_heading.className = 'comcharts-TS-content-'+additionalClassName;
        content_heading.innerHTML = (displayText !== undefined) ? displayText : 'Content heading';

        return content_heading;
    };

    var addContentSuperHeading = function () {
        var content_super_heading = document.createElement('div');
        content_super_heading.className = 'comcharts-TS-content-super-heading';

        return content_super_heading;
    };

    var addSideBarContent = function (className, id) {
        sideBar_content = document.createElement('div');
        sideBar_content.className = 'comcharts-TS-sidebar-content '+className;
        // sideBar_content.style.minHeight = window.innerHeight * 0.9 + "px"; // DO NOT DELETE THIS LINE

        if (id) {
            sideBar_content.id = id;
        }

        return sideBar_content;
    };

    var createCustomFeaturesSideBar = function (op) {
        var each_custom_feature_cat,
            each_custom_feature_sub_cat,
            all_dashboards = [];

        /*** Custom Features List ***/
        for (var i=0,len_i=op.dashboards.length ; i<len_i ; i++) {
            each_custom_feature_cat = op.dashboards[i];

            sideBar_categories = addFeatureCategory(each_custom_feature_cat.className, each_custom_feature_cat.categoryDisplayText);
            ul.appendChild(sideBar_categories);

            for (var j in each_custom_feature_cat.list) {
                each_custom_feature_sub_cat = each_custom_feature_cat.list[j];

                all_dashboards.push(j);

                sideBar_subCategories = addFeatureSubCategory(each_custom_feature_sub_cat.className, each_custom_feature_sub_cat.subCategoryText);
                ul.appendChild(sideBar_subCategories);
            }

            sideBar_list.appendChild(ul);
            document.getElementById(op.selector).appendChild(sideBar_list);
        }

        return all_dashboards;
    };

    var createCustomFeaturesContent = function (op) {
        var each_custom_feature_cat,
            each_custom_feature_sub_cat,
            chart_svg_cut_paste,
            clearfix_div;

        for (var i=0,len_i=op.dashboards.length ; i<len_i ; i++) {
            each_custom_feature_cat = op.dashboards[i];

            for (var j in each_custom_feature_cat.list) {
                each_custom_feature_sub_cat=each_custom_feature_cat.list[j];
                clearfix_div = document.createElement('div');
                clearfix_div.className = 'comcharts-TS-clearfix';

                content_sub_heading = addContentSubHeading(each_custom_feature_sub_cat.subHeading);
                content_heading = addContentHeading(each_custom_feature_sub_cat.heading, 'heading');
                content_heading.appendChild(content_sub_heading);

                content_secondary_sub_heading = addContentSubHeading(each_custom_feature_sub_cat.secondarySubHeading);
                content_secondary_heading = addContentHeading(each_custom_feature_sub_cat.secondaryHeading,'secondary-heading');
                content_secondary_heading.appendChild(content_secondary_sub_heading);

                content_super_heading = addContentSuperHeading();
                content_super_heading.appendChild(content_heading);
                content_super_heading.appendChild(content_secondary_heading);

                sideBar_content = addSideBarContent(each_custom_feature_sub_cat.className);
                sideBar_content.appendChild(content_super_heading);

                if (document.getElementById(j)) {
                    chart_svg_cut_paste = document.getElementById(j);
                    sideBar_content.appendChild(clearfix_div);
                    sideBar_content.appendChild(chart_svg_cut_paste);
                }

                document.getElementById(op.selector).appendChild(sideBar_content);
            }
        }
    };

    /**
    *   @function: createFeaturesSideBar
    *   @description: render the side-bar with the generic features and the configurable dashboards
    */
    var createFeaturesSideBar = function (op) {
        document.getElementById(op.selector).className = 'comcharts-TS-container';

        var user_selection,
            charts_list,
            series_list,
            select_dashboard,
            select_chart,
            select_series,
            datasets,
            charts,
            chart_options,
            html_text,
            count,
            i,
            k;

        ul = document.createElement('ul');
        ul.className = 'comcharts-TS-sidebar-ul';

        sideBar_list = document.createElement('div');
        sideBar_list.className = 'comcharts-TS-sidebar';
        // sideBar_list.style.minHeight = window.innerHeight * 0.9 + "px"; // DO NOT DELETE THIS LINE


        /*** Features List ***/
        /** Custom Features **/
        if (op.dashboards) {
            all_dashboards = createCustomFeaturesSideBar(op);
        }
        /** "Analysis Tools" features **/
        if (op.enableTimeShift || op.enableDimensionalAnalysis || op.enableTimeSearcher) {
            sideBar_categories = addFeatureCategory('analyse','Analysis Tools');
            ul.appendChild(sideBar_categories);

            if (op.enableDimensionalAnalysis) {
                sideBar_subCategories = addFeatureSubCategory('dimensional-analysis','Roll-up by time');
                ul.appendChild(sideBar_subCategories);
            }
            if (op.enableTimeSearcher) {
                html_text = "<span>Trend Searcher</span> <span id='time_searcher_counter' class='comcharts-TS-counter' style='display:none;'></span>";
                sideBar_subCategories = addFeatureSubCategory('trend-searcher',html_text);
                ul.appendChild(sideBar_subCategories);
            }
            if (op.enableTimeShift) {
                sideBar_subCategories = addFeatureSubCategory('lead-lag-analysis','Lead Lag Analysis');
                ul.appendChild(sideBar_subCategories);
            }

            sideBar_list.appendChild(ul);
            document.getElementById(op.selector).appendChild(sideBar_list);
        }
        /** "Data Sets" features **/
        sideBar_categories = addFeatureCategory('data-sets','Data Sets');
        ul.appendChild(sideBar_categories);
        if (TimeSeries.global_data_sets) {
            datasets = Object.keys(TimeSeries.global_data_sets);
            for (i = 0; i < datasets.length; i++) {
                count = TimeSeries.global_data_sets[datasets[i]].dataFor.length;
                html_text = "<span>" + TimeSeries.global_data_sets[datasets[i]].dataName + "</span> <span id='datasets_counter' class='comcharts-TS-counter'>" + count + "</span>";
                sideBar_subCategories = addFeatureSubCategory('custom-data-sets',html_text,"globaldataset_" + datasets[i] + "_data");
                ul.appendChild(sideBar_subCategories);
            }
        }
        charts = Object.keys(TimeSeries.chart_options);
        for (k = 0; k < charts.length; k++) {
            chart_options = TimeSeries.chart_options[charts[k]];
            if (chart_options.data && chart_options.dataName && chart_options.dataDescription) {
                count = 1;
                html_text = "<span>" + chart_options.dataName + "</span> <span id='datasets_counter' class='comcharts-TS-counter'>" + count + "</span>";
                sideBar_subCategories = addFeatureSubCategory('custom-data-sets', html_text, charts[k] + "_data");
                ul.appendChild(sideBar_subCategories);
            }
        }
        if (document.querySelectorAll('#'+op.selector+' .comcharts-TS-sub-category')) {
            document.querySelectorAll('#'+op.selector+' .comcharts-TS-sub-category')[0].className += ' active';
        }

        /*** Features Content ***/
        /** Custom Features Content **/
        if (op.dashboards) {
            createCustomFeaturesContent(op);
        }
        if (op.enableDimensionalAnalysis) {
            content_heading = addContentHeading('Roll-up by time','heading');

            content_super_heading = addContentSuperHeading();
            content_super_heading.appendChild(content_heading);

            sideBar_content = addSideBarContent('dimensional-analysis');
            sideBar_content.appendChild(content_super_heading);

            clearfix_div = document.createElement('div');
            clearfix_div.className = 'comcharts-TS-clearfix';
            sideBar_content.appendChild(clearfix_div);

            user_selection = document.createElement('div');
            user_selection.className = 'comcharts-TS-suggestions-div-select-dashboard';

            document.getElementById(op.selector).appendChild(sideBar_content);
        }
        if (op.enableTimeSearcher) {
            content_heading = addContentHeading('Trend Searcher','heading');

            content_super_heading = addContentSuperHeading();
            content_super_heading.appendChild(content_heading);

            sideBar_content = addSideBarContent('trend-searcher');
            sideBar_content.appendChild(content_super_heading);

            clearfix_div = document.createElement('div');
            clearfix_div.className = 'comcharts-TS-clearfix';
            sideBar_content.appendChild(clearfix_div);

            document.getElementById(op.selector).appendChild(sideBar_content);
        }
        if (op.enableTimeShift) {
            content_heading = addContentHeading('Lead Lag Analysis','heading');

            content_super_heading = addContentSuperHeading();
            content_super_heading.appendChild(content_heading);

            sideBar_content = addSideBarContent('lead-lag-analysis');
            sideBar_content.appendChild(content_super_heading);

            clearfix_div = document.createElement('div');
            clearfix_div.className = 'comcharts-TS-clearfix';
            sideBar_content.appendChild(clearfix_div);

            document.getElementById(op.selector).appendChild(sideBar_content);
        }
        /** Data Sets Features Content **/
        if (TimeSeries.global_data_sets) {
            datasets = Object.keys(TimeSeries.global_data_sets);
            for (i = 0; i < datasets.length; i++) {
                content_super_heading = addContentSuperHeading();
                content_super_heading.appendChild(content_sub_heading);

                sideBar_content = addSideBarContent('custom-data-sets',"globaldataset_" + datasets[i] + "_data_content");
                sideBar_content.appendChild(content_super_heading);

                document.getElementById(op.selector).appendChild(sideBar_content);
            }
        }
        charts = Object.keys(TimeSeries.chart_options);
        for (k = 0; k < charts.length; k++) {
            chart_options = TimeSeries.chart_options[charts[k]];
            if (chart_options.data && chart_options.dataName && chart_options.dataDescription) {
                content_super_heading = addContentSuperHeading();
                content_super_heading.appendChild(content_sub_heading);

                sideBar_content = addSideBarContent('custom-data-sets',charts[k] + "_data_content");
                sideBar_content.appendChild(content_super_heading);

                clearfix_div = document.createElement('div');
                clearfix_div.className = 'comcharts-TS-clearfix';
                sideBar_content.appendChild(clearfix_div);

                document.getElementById(op.selector).appendChild(sideBar_content);
            }
        }

        if (document.querySelectorAll('#'+op.selector+' .comcharts-TS-sidebar-content')) {
            document.querySelectorAll('#'+op.selector+' .comcharts-TS-sidebar-content')[0].className += ' show';
        }
        setDashboardHeight();
    };

    var setDashboardHeight = function () {
        var sidebar = document.querySelector(".comcharts-TS-sidebar"),
            main_container = document.querySelector(".comcharts-TS-sidebar-content.show"),
            sidebar_height = sidebar.offsetHeight,
            main_container_height = main_container.offsetHeight;
            new_main_container_height = main_container_height;
        if (main_container.style.height) {
            main_container.style.height = "100%";
            new_main_container_height = main_container.offsetHeight;
            if (new_main_container_height >= main_container_height) {
                sidebar.style.height = new_main_container_height + "px";
                main_container.style.height = new_main_container_height + "px";
            } else {
                sidebar.style.height = main_container_height + "px";
                main_container.style.height = main_container_height + "px";
            }
        } else if (sidebar_height > main_container_height) {
            sidebar.style.height = sidebar_height + "px";
            main_container.style.height = sidebar_height + "px";
        } else {
            sidebar.style.height = main_container_height + "px";
            main_container.style.height = main_container_height + "px";
        }
    };

    TimeSeries.mediator.subscribe("initSideBar", init);
    TimeSeries.mediator.subscribe("setDashboardHeight", setDashboardHeight);
    TimeSeries.mediator.subscribe("switchOptions", switchOptions);
})();
