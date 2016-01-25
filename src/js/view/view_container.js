TimeSeries.viewContainerFunctions = (function() {
    var default_cell_size = 45, // Default dimension of the cell.
        default_inter_cell_spacing = 6; // Default gap between two cells.
    var containers = {
        /**
        *   @function: containerHtmlString
        *   @param {String} container_obj - An object that should contain container_id, width and height of the div to render.
        *   @returns {String} A valid html <div> string.
        *   @description: It internally checks if user has set the overflow-y as true if so then div string has that style else its ignored.
        */
        containerHtmlString: function (container_obj) {
            var scroll_string = "overflow-y:";
            scroll_string+= container_obj.scroll_enable ? "scroll;'" : "hidden;'";
            //var string = "<div id='" + container_obj.container_id + "' class='comcharts-TS-dashboard' style='width:"+ container_obj.width + "px;height:" + container_obj.height + "px;"+scroll_string+"></div>";
            var string = "<div id='" + container_obj.container_id + "' class='comcharts-TS-dashboard' style='width:"+ container_obj.width + "px;height:" + container_obj.height + "px;'></div>";
            return string;
        },
        createContainer: function(configurations) {
            var parent_id = document.getElementById(configurations.parent_id), // The parent in which the container is to be placed
                container_id = document.getElementById(configurations.container_id),
                cell_size = configurations.cell_size,
                inter_cell_spacing = configurations.inter_cell_spacing, // The space between two cells
                width = configurations.width,
                height = configurations.height,
                message;

            // Check if the element with parent id exists.
            if(!parent_id) {
                message = TimeSeries.errors.idNotFoundOnDom(configurations.parent_id,"createContainer");
                errorHandling(message);
                return message;
            }
            //Check if container is alreay present.
            if(container_id) {
                 message = TimeSeries.errors.idAlreadyExistsOnDom(configurations.container_id,"createContainer");
                errorHandling(message);
                return message;
            }
            // Check the data type of width
            if(!TimeSeries.validation.dataTypes(width,"number")) {
                message = TimeSeries.errors.invalidConfig('width','createContainer');
                errorHandling(message);
                return message;
            }

            // Check the data type of height
            if(!TimeSeries.validation.dataTypes(height,"number")) {
                message = TimeSeries.errors.invalidConfig('height','createContainer');
                errorHandling(message);
                return message;
            }
            //check if height is present or not.
            if(!configurations.height) {
                message = TimeSeries.errors.fieldNotFound('height','createContainer');
                errorHandling(message);
                return message;
            }
            //check if width is present or not.
            if(!configurations.width) {
                message = TimeSeries.errors.fieldNotFound('width','createContainer');
                errorHandling(message);
                return message;
            }

            // Check if cell size and inter_cell_spacing is entered. If yes, then validate the data type or else set default size
            configurations.cell_size = (TimeSeries.validation.dataTypes(cell_size,"number") && cell_size) || default_cell_size;
            configurations.inter_cell_spacing = (TimeSeries.validation.dataTypes(inter_cell_spacing,"number") && inter_cell_spacing) || default_inter_cell_spacing;
            TimeSeries.mediator.publish('addContainer',configurations);
            //this.addContainer(configurations);
        },
        /** @function addContainer
        *   @param {String} config - A container configuration that includes container width, height, container_id and parent_id.
        *   @description  This method calculates properties such as row and columns are calculated as per the formula.
        *   It also adds a div before adding a container if a container is added directly over a container (i.e if the
        *   the parent_id is a container then add a div first and then add the container on that div.)
        *   It internally calls the method to createHtmlString and the method to render that string (i.e. addElement())
        */
        addContainer: function(config) {
            var container_html_string,
                width = config.width,
                height = config.height,
                id = config.container_id,
                parent_id = config.parent_id;

            if (TimeSeries.view.container_obj[parent_id]) {
                //If container's parent_id is a container_id then add a div first and then add the container.
                var div_config = {
                    'is_deletable':false,
                    'delete_html':''
                };
                var parent_container = TimeSeries.view.container_obj[parent_id];

                div_config.height =  Math.ceil(height / (parent_container.cell_size + parent_container.inter_cell_spacing));
                div_config.width = Math.ceil(width / (parent_container.cell_size + parent_container.inter_cell_spacing));
                div_config.container_id=parent_container.container_id;
                div_config.div_id="div_"+id;

                TimeSeries.mediator.publish("addDiv",div_config);//Calling addDiv.
                //TimeSeries.viewDivFunctions.createDiv(div_config);
                config.parent_id = div_config.div_id;//Change the parent_id to id of the div.
                TimeSeries.mediator.publish("addContainer",config); //call the method to the addContainer.
                //this.createContainer(config);//call the method to the createContainer.
                return;
            }

            config.rows = Math.floor(height / (config.cell_size + config.inter_cell_spacing)); // Number of rows that can fit in the container
            config.columns = Math.floor(width / (config.cell_size + config.inter_cell_spacing)); // Number of columns that can fit in the

            container_html_string = TimeSeries.mediator.publish("containerHtmlString",config);
            //container_html_string = this.containerHtmlString(config);

            config.div_order_array = [];

            delete config.container_id;
            TimeSeries.view.container_obj[id] = config;
            config.container_id = id;
            config.current_row = 0;
            config.min_height = [];

            TimeSeries.mediator.publish("createCellObject",config.container_id, 0);
            //TimeSeries.cellFunctions.createCellObject(config.container_id, 0);
            TimeSeries.mediator.publish("addElement",container_html_string, parent_id);
            //TimeSeries.domModule.addElement(container_html_string,parent_id);
        },
        /** @function removeContainer
        *   @param {String} config - A container configuration that includes container width, height, container_id and parent_id.
        *   @description  This method checks if the container is not present on DOM it consoles and returns a error. It also validates
        *   if the container_id exists in container_obj if so the error is returned along with console logs.
        *   If the above validation is passed then the deleteContainer() is called.
        */
        removeContainer: function(container_id) {

            var container = document.getElementById(container_id);
            if(!container) { //Handling the case when container is not present on DOM.
                errorHandling("The element with id '" + container_id + "' does not exist on DOM. Please pass correct id.");
                return {error:"The element with id '" + container_id  + "' does not exist on DOM. Please pass correct id."};
            }
            if (!(TimeSeries.view.container_obj[container_id])) { //Handling the case when container is not present in the internal container object.
                errorHandling("The container with id '" + container_id + "' does not exist. Please pass correct id.");
                return {error:"The container with id '" + container_id  + "' does not exist. Please pass correct id."};
            }
            TimeSeries.mediator.publish("deleteContainer",container_id); //Calling the core method deleteContainer to actually perform the deletion.
            //this.deleteContainer(container_id);
        },
        /** @function deleteContainer
        *   @param {String} config - A container configuration that includes container width, height, container_id and parent_id.
        *   @description  This method deletes the container div from the DOM. It also updates the cell object and container object to reflect
        *   the change.
        */
        deleteContainer: function(container_id) {
            var div_array = TimeSeries.view.container_obj[container_id].div_order_array, // List of all the divs in the container
                element = document.getElementById(container_id);
            for(var i = 0, length = div_array; i < length; i++) {
                TimeSeries.mediator.publish("deleteDiv",div_array[i]); // Call the function to delete all the divs on the DOM
                //TimeSeries.viewDivFunctions.removeDiv(div_array[i]);
            }
            delete TimeSeries.view.cell_obj[container_id]; // Remove the cell object for given container
            delete TimeSeries.view.container_obj[container_id]; // Remove the container object of given container
            element.parentNode.removeChild(element); // Remove the container from DOM
        }
    };

    TimeSeries.mediator.subscribe('containerHtmlString',containers.containerHtmlString);
    TimeSeries.mediator.subscribe('addContainer',containers.addContainer);
    TimeSeries.mediator.subscribe('deleteContainer',containers.deleteContainer);
    return containers;
}());
