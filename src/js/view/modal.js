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
