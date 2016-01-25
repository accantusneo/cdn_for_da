/**
@author Pykih developers
@module viewDivFunctions
@namespace TimeSeries
*/
TimeSeries.viewDivFunctions = (function() {
    var div = {
        /**
        @Function: getCellObject
        @description: getCell to find the index containing the passed attributes
        */
        getCellObject: function(array,container_id,parameter_name) {
            for (var i = 0,len = array.length; i < len; i++) {
                if(array[i][parameter_name] === container_id) {
                    return i;
                }
            }
        },
        /*
        @Function: findSpace.
        @description: findSpace to find the if there is space in the passed container id to place a new div. if there is space return the index of the cell where it can be placed or else return false.
        */
        findSpace: function(container_id,rows,columns) {
            var cell_array = TimeSeries.view.cell_obj,
                cell_obj,
                cell_obj_index,
                container_array  = TimeSeries.view.container_obj,
                container_obj,
                no_of_rows,
                no_of_columns,
                tile_obj,
                i = 0,
                tile_obj_length,
                height;

            container_obj = container_array[container_id];
            cell_obj = cell_array[container_id];
            tile_obj = cell_obj.cell_object_array;
            no_of_columns = container_obj.columns;
            no_of_rows = container_obj.rows;
            tile_obj_length = tile_obj.length;
            current_row =  container_obj.current_row;
            height =  container_obj.min_height;


            if(columns > no_of_columns) { // First check if the no of the columns required by the div is greater than the columns of the container.
                return false;
            }

            // if(rows > no_of_rows) { // First check if the no of rows or the columns required by the div is greater than the rows and columns of the container.
            //     return false;
            // }

            i = current_row * no_of_columns;
            // console.log(i,"i");
            while(i < tile_obj_length) {
                // console.log(i,"i",container_id,rows,columns);
                if(!tile_obj[i].div_id) {
                    if( i+columns <= (no_of_columns*(Math.floor(i/no_of_columns) + 1)) && (Math.floor(i/no_of_columns)+rows <= no_of_rows) && !tile_obj[i+columns].card_obj && !tile_obj[i+rows].card_obj && !tile_obj[i+ columns + rows-1].card_obj) {
                        //height.push(rows);
                        return i;
                    } else {
                        min_height = Math.max.apply(Math, height);
                        current_row = current_row + min_height;
                        i = current_row * no_of_columns;
                        //height = [];
                    }
                } else {
                    i++;
                }
            }
            return false;
        },
        getDivPosition: function(container_id, div_id, rows, columns, from_column_no, from_row_no, flag) {
            var cell_array = TimeSeries.view.cell_obj,
                cell_obj,
                div_obj,
                container_array = TimeSeries.view.container_obj,
                container_obj,
                no_of_columns,
                no_of_rows,
                tile_obj,
                i,
                j,
                k,
                length,
                row_number = null,
                cell_id,
                temp_div_id,
                temp_div_obj;

            container_obj = container_array[container_id];
            cell_obj = cell_array[container_id];
            tile_obj = cell_obj.cell_object_array;
            no_of_columns = container_obj.columns;
            no_of_rows = container_obj.rows;
            current_row =  container_obj.current_row;
            // console.log("flag", flag, div_id);
            if(flag) {
                for(i = from_row_no - 1; i >= 0; i--) {
                    cell_id =  no_of_columns * i + from_column_no;
                    for(j = cell_id, length = (cell_id + columns); j < length; j++) {
                        if(tile_obj[j].div_id) {
                            return row_number;
                        }
                    }
                    row_number = i;
                }
                return row_number;
            } else {
                // console.log("rows", rows);
                length = from_column_no + columns;
                for(i = from_row_no; ; i++) {
                    flag = true;
                    if((i + rows) > no_of_rows) {
                        TimeSeries.mediator.publish('createCellObject', container_id, tile_obj.length, 1);
                    }
                    for(j = i; j < (i + rows); j++) {
                        for(k = from_column_no; k < length; k++) {
                            cell_id =  no_of_columns * j + k;
                            temp_div_id = tile_obj[cell_id].div_id;
                            if(temp_div_id !== null && temp_div_id != div_id) {
                                // flag = false;
                                // break;
                                div_obj = TimeSeries.view.div_obj[div_id];
                                temp_div_obj = TimeSeries.view.div_obj[temp_div_id];
                                //if(div_obj.from_row_no < temp_div_obj.from_row_no) {// || (div_obj.from_column_no < temp_div_obj.from_column_no && div_obj.from_row_no == temp_div_obj.from_row_no)) {
                                //    return TimeSeries.view.div_obj[div_id].from_row_no;
                                //} else {
                                    // console.log("temp_div_id", temp_div_id);
                                    return TimeSeries.view.div_obj[temp_div_id].to_row_no + 1;
                                //}
                            }
                        }
                        // if(!flag) {
                        //     break;
                        // }
                    }
                    // if(flag) {
                        return i;
                    // }
                }
            }

        },
        /*
        @Function: createDiv.
        @description validates the parameters passed in the configuration object and returns an error if any.
        */
        createDiv: function(configurations){
            //If configuration is undefined then return an error
        	if(typeof configurations === 'undefined' || configurations === null){
        		errorHandling("TimeSeries.viewDivFunctions: configuration object is not set");
                return;
        	}
        	else{
                //Getting element id for container
        		var parent_id = document.getElementById(configurations.container_id),
        		  div_id = configurations.div_id,//div_id for div
        		  height = configurations.height,//get height
        		  width = configurations.width,//
        		  is_deletable = configurations.is_deletable,
        		  delete_html = configurations.delete_html;

        		var is_container_id_present = false;
        		var container_details = {};
        		var is_div_id_present = (document.getElementById(configurations.div_id)!==undefined && document.getElementById(configurations.div_id)!== null);

                //Check parent_id
        		if(!parent_id){
        			errorHandling("TimeSeries.viewDivFunctions: createDiv: The element with container_id '" + configurations.parent_id + "' does not exist. Please pass correct id.");
                    return {error : "TimeSeries.viewDivFunctions: createDiv: The element with container_id '" + configurations.parent_id + "' does not exist. Please pass correct id."};
                }

                //Check if container is present
                if(TimeSeries.view.container_obj[configurations.container_id]){
                    is_container_id_present = true;
                }
                else{
                    is_container_id_present = false;
                }
        		if(!is_container_id_present){
        			errorHandling("TimeSeries.viewDivFunctions: createDiv: The element with container_id '" + configurations.parent_id + "' does not exist in container_array. Please pass correct id.");
        			return {error : "TimeSeries.viewDivFunctions: createDiv: The element with container_id '" + configurations.parent_id + "' does not exist in container_array. Please pass correct id."};
        		}
        		else if(!div_id){ //Check if div is present
        			errorHandling("TimeSeries.viewDivFunctions: createDiv: The element with div_id '" + configurations.div_id + "' does not exist. Please pass correct div_id.");
        			return {error : "TimeSeries.viewDivFunctions: createDiv: The element with div_id '" + configurations.div_id + "' does not exist. Please pass correct div_id."};
        		}
        		else if(is_div_id_present){ //check if div is on DOM
        			errorHandling("TimeSeries.viewDivFunctions: createDiv: The element with div_id '" + configurations.div_id + "' is already rendered on the DOM.Please pass new div_id.");
        			return {error : "TimeSeries.viewDivFunctions: createDiv: The element with div_id '" + configurations.div_id + "' is already rendered on the DOM.Please pass new div_id."};
        		}
				else if(!height || !(TimeSeries.validation.dataTypes(height,"number"))){
                    //Check if height is number
        			errorHandling("TimeSeries.viewDivFunctions: createDiv: Enter a valid height for ' " + configurations.div_id +"' .");
                    return {error : "TimeSeries.viewDivFunctions: createDiv: Enter a valid height for ' " + configurations.div_id +"' ."};
        		}
        		else if(!width || !(TimeSeries.validation.dataTypes(width,"number"))){
                    //Check if width is number
        			errorHandling("TimeSeries.viewDivFunctions: createDiv: Enter a valid width for ' " + configurations.div_id +"' .");
        			return {error : "TimeSeries.viewDivFunctions: createDiv: Enter a valid width for ' " + configurations.div_id +"' ."};
        		}
        		else if(typeof configurations.is_deletable === 'undefined' || !TimeSeries.validation.dataTypes(configurations.is_deletable,"boolean")){
                    configurations.is_deletable =  TimeSeries.default.is_deletable;
        		}
                configurations.delete_html = delete_html || TimeSeries.default.delete_html;

                return TimeSeries.mediator.publish("addDiv",configurations);
                //return this.addDiv(configurations);
        	}
        },
        /**
        @Function: addDiv
        @Description: Core functionality for adding div on the UI
        */
        addDiv: function(configurations){
            var container_id = configurations.container_id,
                div_id = configurations.div_id,
                container_obj,
                cell_obj_index,
                index,
                indexrow,
                indexcol,
                positionrows,
                positioncols,
                length,
                container_row,
                container_col,
                from_row_no,
                from_column_no,
                to_row_no,
                to_column_no,
                width_px,
                height_px,
                domHTML,
                cell_array,
                cell_size,
                inter_cell_spacing,
                outer_div,
                inner_div,
                delete_button,
                resize_button,
                first_cell_index, // index of first cell to be occupied by the div
                first_cell, // Fetching the first cell object
                drag_x,
                drag_y,
                cell_id;

            //Get the index for the position of the card
            var position = TimeSeries.mediator.publish("findSpace",
                                            container_id,
                                            configurations.height,
                                            configurations.width);
            // var position = this.findSpace(configurations.container_id,
            //                                 configurations.height,
            //                                 configurations.width);
            cell_size = TimeSeries.view.cell_obj[container_id].cell_size;
            inter_cell_spacing = TimeSeries.view.cell_obj[container_id].inter_cell_spacing;

            //Test if the postion got is a number
            if(TimeSeries.validation.dataTypes(position,"number")){

                //Get all the rows for the container
                container_row = TimeSeries.view.container_obj[container_id].rows;
                //Get all the columns for the contaner
                container_col = TimeSeries.view.container_obj[container_id].columns;

                cell_array = TimeSeries.view.cell_obj[container_id].cell_object_array;

                length = position + configurations.width;

                for(indexrow = position;indexrow < length; indexrow++){
                    for(indexcol = 0;indexcol < configurations.height; indexcol++){
                        cell_array[indexrow + (indexcol * container_col)].div_id = div_id;
                    }
                }

                width_px = (cell_size * configurations.width) + (inter_cell_spacing * (configurations.width - 1));
                height_px = (cell_size * configurations.height) + (inter_cell_spacing * (configurations.height - 1));

                var obj = {
                    'height_px':height_px,
                    'width_px':width_px,
                    'from_row_no':cell_array[position].row_number,
                    'to_row_no':cell_array[position].row_number + configurations.height - 1,
                    'from_column_no':cell_array[position].column_number,
                    'to_column_no':cell_array[position].column_number + configurations.width - 1,
                    'is_deletable':configurations.is_deletable,
                    'delete_html':configurations.delete_html,
                    "parent_id": configurations.container_id
                };

                TimeSeries.view.container_obj[container_id].div_order_array.push(div_id);

                TimeSeries.view.div_obj[div_id]= obj;

                first_cell_index = (obj.from_row_no * TimeSeries.view.container_obj[container_id].columns + obj.from_column_no); // index of first cell to be occupied by the div
                first_cell = TimeSeries.view.cell_obj[container_id].cell_object_array[first_cell_index];

                outer_div = document.createElement("div");
                outer_div.className = "div_parent";
                outer_div.style.width = width_px + "px";
                outer_div.style.height = height_px + "px";
                outer_div.style.left = first_cell.x + "px";
                outer_div.style.top = first_cell.y + "px";

                delete_button = document.createElement("img");
                delete_button.className = "delete-button";
                delete_button.src = "../../src/img/delete.png";

                resize_button = document.createElement("img");
                resize_button.className = "resize-button";
                resize_button.src = "../../src/img/resize.png";

                inner_div = document.createElement("div");
                inner_div.id = div_id;
                inner_div.className = "div_inner";
                inner_div.style.width = width_px + "px";
                inner_div.style.height = height_px + "px";

                document.getElementById(container_id).appendChild(outer_div);
                outer_div.appendChild(delete_button);
                outer_div.appendChild(inner_div);
                inner_div.appendChild(resize_button);

                if(configurations.is_deletable === true){
                    outer_div.onmouseover = function(event) {
                        delete_button.style.display = "block";
                    };
                    outer_div.onmouseout = function(event) {
                        delete_button.style.display = "none";
                    };
                    delete_button.onclick = function(event) {
                        div.deleteDiv(div_id);
                    };
                }

                inner_div.onmouseover = function(event) {
                    resize_button.style.display = "block";
                };
                inner_div.onmouseout = function(event) {
                    resize_button.style.display = "none";
                };

                d3.select(inner_div).call(
                    d3.behavior.drag()
                    .on("dragstart", function() {
                        var coordinates = d3.mouse(this);
                        drag_x = coordinates[0];
                        drag_y = coordinates[1];
                        // console.log("dragstart", this.getBoundingClientRect().top, this.getBoundingClientRect().left);
                        TimeSeries.divDrag = true;
                    })
                    .on("drag", function() {
                        this.style.cursor =  "grabbing";
                        this.style.cursor =  "-moz-grabbing";
                        this.style.cursor =  "-webkit-grabbing";
                        var coordinates = d3.mouse(this),
                            x_diff = coordinates[0] - drag_x,
                            y_diff = coordinates[1] - drag_y;
                        div.move(container_id, div_id, x_diff, y_diff, d3.event.dy);
                    })
                    .on("dragend",function(){
                        this.style.cursor =  "grab";
                        this.style.cursor =  "-moz-grab";
                        this.style.cursor =  "-webkit-grab";
                        div.endMove(container_id, div_id);
                        TimeSeries.divDrag = false;
                    })
                );

                d3.select(resize_button).call(
                    d3.behavior.drag()
                    .on("dragstart", function() {
                        d3.event.sourceEvent.stopPropagation();
                    })
                    .on("drag", function() {
                        div.resize(container_id, div_id);
                    })
                    .on("dragend",function(){
                        div.endResize(div_id);
                    })
                );

                TimeSeries.mediator.publish("setMinHeight",container_id);
            }
            else{
                var i,
                    j,
                    unfilled_rows = 0,
                    flag = false;
                container_obj = TimeSeries.view.container_obj[container_id];
                container_row = container_obj.rows;
                container_col = container_obj.columns;
                cell_array = TimeSeries.view.cell_obj[container_id].cell_object_array;
                // console.log("columns", container_col, "rows", container_row)
                for(i = container_row - 1; i >= 0; i--) {
                    for(j = 0; j < container_col; j++) {
                        cell_id = i * container_col + j;
                        if(cell_array[cell_id].div_id) {
                            flag = true;
                            break;
                        }
                    }
                    if(flag) {
                        break;
                    }
                    unfilled_rows++;
                }
                // console.log("unfilled_rows", unfilled_rows, configurations.height);
                if(unfilled_rows < configurations.height) {
                    TimeSeries.mediator.publish('createCellObject', container_id, cell_array.length, configurations.height - unfilled_rows);
                }
                // console.log("rows", container_obj.rows);
                TimeSeries.mediator.publish("addDiv",configurations);
                container_row = container_obj.rows;
                document.getElementById(container_id).style.height = container_row * (cell_size + inter_cell_spacing) + "px";
            }
        },
        move: function(container_id, div_id, x_diff, y_diff, dy) {
            var div_element = document.getElementById(div_id),
                div_parent = div_element.parentNode,
                container = document.getElementById(container_id),
                div_objects = TimeSeries.view.div_obj,
                div_obj = div_objects[div_id],
                rows = div_obj.to_row_no - div_obj.from_row_no + 1,
                columns = div_obj.to_column_no - div_obj.from_column_no + 1,
                div_dimensions = div_element.getBoundingClientRect(),
                container_dimensions = container.getBoundingClientRect(),
                container_obj = TimeSeries.view.container_obj[container_id],
                total_columns = container_obj.columns,
                cell_obj_array = TimeSeries.view.cell_obj[container_id].cell_object_array,
                cell_obj,
                cell_size = container_obj.cell_size,
                inter_cell_spacing = container_obj.inter_cell_spacing,
                top,
                left,
                x,
                y,
                row_number,
                column_number,
                i,
                i_length,
                j,
                j_length,
                k,
                k_length,
                cell_id,
                div_order_array = container_obj.div_order_array,
                index = div_order_array.indexOf(div_id),
                flag = false,
                temp_row_number = null,
                temp_div_id,
                temp_div_obj,
                last_rows = [],
                greatest_row_number = 0,
                temp_div_element,
                temp_div_parent,
                temp_cell_obj;
            div_parent.style["background-color"] = "lightgrey";
            top = div_dimensions.top + y_diff;
            left = div_dimensions.left + x_diff;
            if(left < container_dimensions.left) {
                left = container_dimensions.left;
            }
            if(top < container_dimensions.top) {
                top = container_dimensions.top;
            }
            if((left + div_dimensions.width) > cell_obj_array[total_columns - 1].x + cell_size + container_dimensions.left) {
                left = cell_obj_array[total_columns - 1].x + cell_size + container_dimensions.left - div_dimensions.width;
            }
            if((top + div_dimensions.height) > cell_obj_array[total_columns * (container_obj.rows - 1)].y + cell_size + container_dimensions.top) {
                top = cell_obj_array[total_columns * (container_obj.rows - 1)].y + cell_size + container_dimensions.top - div_dimensions.height;
            }
            y = top - container_dimensions.top;
            x = left - container_dimensions.left;
            row_number = Math.floor((y + inter_cell_spacing) / (cell_size + inter_cell_spacing));
            column_number = Math.floor((x + inter_cell_spacing) / (cell_size + inter_cell_spacing));
            cell_obj = cell_obj_array[total_columns * row_number + column_number];
            div_element.style.top = y - parseInt(div_parent.style.top) + "px";
            div_element.style.left = x - parseInt(div_parent.style.left) + "px";
            div_element.style.zIndex = 10;
            // console.log(div_obj.from_row_no, row_number, div_obj.from_column_no, column_number);
            if(div_obj.from_row_no != row_number || div_obj.from_column_no != column_number) {
                if(dy <= 0) {
                    // console.log("up");
                    for(i = row_number - 1; i >= 0 ; i--) {
                        // console.log("row_number", row_number, i);
                        for(j = column_number, j_length = column_number + columns; j < j_length; j++) {
                            temp_div_id = cell_obj_array[i * total_columns + j].div_id;
                            //console.log("temp_div_id", temp_div_id)
                            if(temp_div_id !== null && temp_div_id !== div_id) {
                                break;
                            }
                        }
                        if(j == j_length) {
                            // console.log("i", i);
                            temp_row_number = i;
                        } else {
                            // console.log('break')
                            break;
                        }
                    }
                    if(temp_row_number !== null) {
                        for(i = temp_row_number, i_length = temp_row_number + rows; i < i_length ; i++) {
                            for(j = column_number, j_length = column_number + columns; j < j_length; j++) {
                                temp_div_id = cell_obj_array[i * total_columns + j].div_id;
                                if(temp_div_id && temp_div_id !== div_id) {
                                    break;
                                }
                            }
                            if(j != j_length) {
                                temp_row_number = null;
                                break;
                            }
                        }
                        if(i == i_length) {
                            flag = true;
                        }
                    }
                    if(!flag) {
                        for(i = column_number, i_length = column_number + columns; i < i_length; i++) {
                            cell_id = row_number * total_columns + i;
                            temp_div_id = cell_obj_array[cell_id].div_id;
                            if(temp_div_id) {
                                if(div_objects[temp_div_id].from_row_no != row_number) {
                                    break;
                                }
                            }
                        }
                        if(i == i_length) {
                            flag = true;
                            temp_row_number = row_number;
                        }
                    }
                }
                if(dy > 0) {
                    // console.log("down");
                    for(i = column_number, i_length = column_number + columns; i < i_length; i++) {
                        cell_id = row_number * total_columns + i;
                        temp_div_id = cell_obj_array[cell_id].div_id;
                        if(temp_div_id && temp_div_id != div_id && div_objects[temp_div_id].to_row_no == row_number) {
                            if(last_rows.indexOf(temp_div_id) == -1) {
                                last_rows.push(temp_div_id);
                            }
                        }
                    }
                    // console.log("last_rows", last_rows);
                    for(k = 0, k_length = last_rows.length; k < k_length; k++) {
                        // console.log("last_rows", last_rows,last_rows[k]);
                        temp_div_obj = div_objects[last_rows[k]];
                        temp_row_number = temp_div_obj.from_row_no;
                        for(i = temp_row_number - 1; i >= 0 ; i--) {
                            for(j = temp_div_obj.from_column_no, j_length = temp_div_obj.to_column_no + 1; j <  j_length; j++) {
                                temp_div_id = cell_obj_array[i * total_columns + j].div_id;
                                if(temp_div_id !== null && temp_div_id !== div_id) {
                                    break;
                                }
                            }
                            if(j == j_length) {
                                temp_row_number = i;
                            } else {
                                break;
                            }
                        }
                        temp_div_obj.to_row_no = temp_row_number + temp_div_obj.to_row_no - temp_div_obj.from_row_no;
                        temp_div_obj.from_row_no = temp_row_number;
                        temp_div_element = document.getElementById(last_rows[k]);
                        temp_div_parent = temp_div_element.parentNode;
                        temp_div_element.style.top = "0px";
                        temp_div_element.style.left = "0px";
                        temp_cell_obj = cell_obj_array[total_columns * temp_row_number + temp_div_obj.from_column_no];
                        temp_div_parent.style.top = temp_cell_obj.y + "px";
                        temp_div_parent.style.left = temp_cell_obj.x + "px";
                        // d3.select(temp_div_parent)
                        // .transition()
                        // .style({
                        //     top: temp_cell_obj.y + "px",
                        //     left: temp_cell_obj.x + "px"
                        // })
                        greatest_row_number = greatest_row_number < temp_div_obj.to_row_no ? temp_div_obj.to_row_no : greatest_row_number;
                        // console.log(last_rows[k], temp_div_obj.from_row_no, temp_div_obj.to_row_no)
                        TimeSeries.mediator.publish("updateCellObject",last_rows[k],container_id);
                        for(i = temp_row_number, i_length = temp_div_obj.to_row_no; i <= i_length; i++) {
                            for(j = temp_div_obj.from_column_no, j_length = temp_div_obj.to_column_no; j <= j_length; j++) {
                                cell_id = i * total_columns + j;
                                cell_obj_array[cell_id].div_id = last_rows[k];
                            }
                        }
                    }
                    if(last_rows.length) {
                        flag = true;
                        temp_row_number = greatest_row_number + 1;
                    }
                }
                if(flag) {
                    cell_obj = cell_obj_array[total_columns * temp_row_number + column_number];
                    div_parent.style.top = cell_obj.y + "px";
                    div_parent.style.left = cell_obj.x + "px";
                    // d3.select(div_parent)
                    //     .transition()
                    //     .style({
                    //         top: cell_obj.y + "px",
                    //         left: cell_obj.x + "px"
                    //     })
                    div_obj.from_column_no = column_number;
                    div_obj.to_column_no = column_number + columns - 1;
                    div_obj.from_row_no = temp_row_number;
                    div_obj.to_row_no = temp_row_number + rows - 1;
                    TimeSeries.mediator.publish("updateCellObject",div_id,container_id);
                    for(i = temp_row_number, i_length = temp_row_number + rows; i < i_length; i++) {
                        for(j = column_number, j_length = column_number + columns; j < j_length; j++) {
                            cell_id = i * total_columns + j;
                            cell_obj_array[cell_id].div_id = div_id;
                        }
                    }
                    TimeSeries.mediator.publish("rearrangement",div_id,container_id,index);
                }
                // if(div_order_array[k] != div_id && temp_div_obj.from_row_no == row_number && temp_div_obj.from_column_no == column_number) {
                //     // console.log("in if");
                //     div_parent.style.top = cell_obj.y + "px";
                //     div_parent.style.left = cell_obj.x + "px";
                //     div_obj.from_column_no = column_number;
                //     div_obj.to_column_no = column_number + columns - 1;
                //     div_obj.from_row_no = row_number;
                //     div_obj.to_row_no = row_number + rows - 1;
                //     TimeSeries.mediator.publish("updateCellObject",div_id,container_id);
                //     for(i = row_number, i_length = row_number + rows; i < i_length; i++) {
                //         for(j = column_number, j_length = column_number + columns; j < j_length; j++) {
                //             cell_id = i * total_columns + j;
                //             cell_obj_array[cell_id].div_id = div_id;
                //         }
                //     }
                //     TimeSeries.mediator.publish("rearrangement",div_id,container_id,index);
                //     break;
                // }
            }
        },
        endMove: function(container_id, div_id) {
            var div_element = document.getElementById(div_id);
            div_element.style.top = "0px";
            div_element.style.left = "0px";
            div_element.style.zIndex = 5;
        },
        resize: function(container_id, div_id) {
            var container_obj = TimeSeries.view.container_obj[container_id],
                div_obj = TimeSeries.view.div_obj[div_id],
                cell_obj_array = TimeSeries.view.cell_obj[container_id].cell_object_array,
                rows = div_obj.to_row_no - div_obj.from_row_no + 1,
                columns = div_obj.to_column_no - div_obj.from_column_no + 1,
                new_rows,
                new_columns,
                div_element = document.getElementById(div_id),
                div_parent = div_element.parentNode,
                div_dimensions = div_element.getBoundingClientRect(),
                container_dimensions = document.getElementById(container_id).getBoundingClientRect(),
                event_obj = d3.event,
                resize_button = document.querySelector("#" + div_id + " .resize-button"),
                cell_size = container_obj.cell_size,
                inter_cell_spacing = container_obj.inter_cell_spacing,
                new_row_number,
                new_column_number,
                i,
                length,
                index = container_obj.div_order_array.indexOf(div_id),
                new_height,
                new_width;
            new_width = event_obj.x;
            new_height = event_obj.y;
            if(div_dimensions.left + new_width > cell_obj_array[container_obj.columns - 1].x + cell_size + container_dimensions.left) {
                new_width = div_dimensions.width;
            }
            if(div_dimensions.top + new_height > cell_obj_array[container_obj.columns * (container_obj.rows - 1)].y + cell_size + container_dimensions.top) {
                new_height = div_dimensions.height;
            }
            new_rows = Math.ceil((new_height + inter_cell_spacing) / (cell_size + inter_cell_spacing));
            new_columns = Math.ceil((new_width + inter_cell_spacing) / (cell_size + inter_cell_spacing));
            div_element.style.width = new_width + "px";
            div_element.style.height = new_height + "px";
            d3.select("#" + div_id + "_svg")
                .attr("width", new_width + "px")
                .attr("height", new_height + "px");
            resize_button.style.display = "block";
            resize_button.style.left = new_width - 20 + "px";
            resize_button.style.top = new_height - 20 + "px";
            div_parent.style["background-color"] = "lightgrey";
            if(new_rows != rows) {
                // console.log("new_rows != rows");
                new_row_number = div_obj.from_row_no + new_rows - 1;
                div_parent.style.height = (new_rows * (cell_size + inter_cell_spacing) - inter_cell_spacing) + "px";
                div_obj.to_row_no = new_row_number;
                if(new_rows > rows) {
                    for(i = div_obj.from_column_no, length = div_obj.to_column_no; i <= length; i++) {
                        cell_obj_array[new_row_number * container_obj.columns + i].div_id = div_id;
                    }
                    TimeSeries.mediator.publish("rearrangement",div_id,container_id,index);

                } else {
                    for(i = div_obj.from_column_no, length = div_obj.to_column_no; i <= length; i++) {
                        cell_obj_array[(new_row_number + 1) * container_obj.columns + i].div_id = null;
                    }
                    TimeSeries.mediator.publish("rearrangement",div_id,container_id,index);
                }
            }
            if(new_columns != columns) {
                // console.log("new_columns != columns");
                new_column_number = div_obj.from_column_no + new_columns - 1;
                div_parent.style.width = (new_columns * (cell_size + inter_cell_spacing) - inter_cell_spacing) + "px";
                div_obj.to_column_no = div_obj.from_column_no + new_columns - 1;
                if(new_columns > columns) {
                    for(i = div_obj.from_row_no, length = div_obj.to_row_no; i <= length; i++) {
                        cell_obj_array[i * container_obj.columns + new_column_number].div_id = div_id;
                    }
                    TimeSeries.mediator.publish("rearrangement",div_id,container_id,index);

                } else {
                    for(i = div_obj.from_row_no, length = div_obj.to_row_no; i <= length; i++) {
                        cell_obj_array[i * container_obj.columns + (new_column_number + 1)].div_id = null;
                    }
                    TimeSeries.mediator.publish("rearrangement",div_id,container_id,index);
                }
            }
        },
        endResize: function(div_id) {
            var div_element = document.getElementById(div_id),
                div_parent = div_element.parentNode,
                resize_button = document.querySelector("#" + div_id + " .resize-button"),
                chart_options = TimeSeries.chart_options[div_id],
                width,
                height;
            div_element.style.width = div_parent.style.width;
            div_element.style.height = div_parent.style.height;
            width = parseInt(div_element.style.width) - 2;
            height = parseInt(div_element.style.height) - 2;
            d3.select("#" + div_id + "_svg")
                .attr("width", width + "px")
                .attr("height", height + "px");
            chart_options.width = width;
            chart_options.height = height;
            resize_button.style.left = parseInt(div_element.style.width) - 20 + "px";
            resize_button.style.top = parseInt(div_element.style.height) - 20 + "px";
            div_parent.style["background-color"] = "white";
        },
        /** @function removeDiv
         *  @description  This method is a User Facing API deleting a div that accepts div_id as input parameter and checks
         *  if the div is not present on DOM it consoles and returns a error. It also validates
         *  if the div_id exists in div_obj if so the error is returned.
         *
         *  If the above validation is passed then the deleteDiv() is called.
         */
        removeDiv: function (div_id) {
            var div = document.getElementById(div_id);
            if(!div) { //Handling the case when div is not present on DOM.
                errorHandling("The element with id '" + div_id + "' does not exist on DOM. Please pass correct id.");
                return {error:"The element with id '" + div_id  + "' does not exist on DOM. Please pass correct id."};
            }
            if (!(TimeSeries.view.div_obj[div_id])) {//Handling the case when div is not present in the div object.
                errorHandling("The div with id '" + div_id + "' does not exist. Please pass correct id.");
                return {error:"The div with id '" + div_id  + "' does not exist. Please pass correct id."};
            }
            TimeSeries.mediator.publish("deleteDiv",div_id); //Call the code method deleteDiv that performs the actual deletion.
            //this.deleteDiv(div_id);
        },
        /**
        @Function:  deleteDiv
        @param {string} div_id - Id of the div to be deleted
        @description: Remove the passed div_id from the DOM and manipulate the cell object, container object and remove the instances coressponding to the passed div_id from them.
        delete it.
        */
        deleteDiv: function(div_id) {
            var parent_id = TimeSeries.view.div_obj[div_id].parent_id, parent_div_id;
                index = TimeSeries.view.container_obj[parent_id].div_order_array.indexOf(div_id);
            TimeSeries.mediator.publish("updateCellObject",div_id,parent_id);
            //this.updateCellObject(div_id,parent_id);
            TimeSeries.mediator.publish("deleteDivObject",div_id);
            //this.deleteDivObject(div_id);
            TimeSeries.mediator.publish("updateDivOrderArray",parent_id,div_id);
            //this.updateDivOrderArray(parent_id,div_id);
            TimeSeries.mediator.publish("rearrangement",div_id,parent_id,index);
            //this.rearrangement(div_id,parent_id,index);
            parent_div_element = document.getElementById(div_id).parentNode;
            parent_div_element.parentNode.removeChild(parent_div_element);
            // TimeSeries.domModule.removeElement(parent_div_id);
        },
        /**
        @Function:  deleteDivObject
        @param {string} div_id - the div_id whose entry is to be removed from the div object.
        @description: To delete attribute with name passed as div id from the Div object.
        */
        deleteDivObject: function(div_id) {
            delete TimeSeries.view.div_obj[div_id];
        },
        updateCellObject: function(div_id,container_id) {
            var cell_array, id;
            cell_array = TimeSeries.view.cell_obj[container_id].cell_object_array;
            for (var i = 0, len = cell_array.length; i < len ; i++) {
                id = cell_array[i].div_id;
                if(id === div_id) {
                    cell_array[i].div_id = null;
                }
            }
        },
        // rearrangement: function(div_id,container_id,index) {
        //     var div_order_array = TimeSeries.view.container_obj[container_id].div_order_array,
        //         cell_array = TimeSeries.view.cell_obj[container_id].cell_object_array,
        //         // index = div_order_array.indexOf(div_id),
        //         dom = TimeSeries.domModule,
        //         container_obj = TimeSeries.view.container_obj[container_id],
        //         div_obj = TimeSeries.view.div_obj,
        //         div_element,
        //         div = TimeSeries.view.div_obj,
        //         container_row = container_obj.rows,
        //         container_col = container_obj.columns,
        //         position,
        //         current_div_id,
        //         length;

        //     for (var j = index, arr_len = div_order_array.length; j < arr_len ; j++) {
        //         TimeSeries.mediator.publish("updateCellObject",div_order_array[j],container_id);
        //         //this.updateCellObject(div_order_array[j],container_id);
        //     }

        //     for (var i = index, len = div_order_array.length; i < len ; i++) {
        //         current_div_id = div_order_array[i];
        //         div = div_obj[current_div_id];

        //         columns = div.to_row_no - div.from_row_no + 1;
        //         rows = div.to_column_no - div.from_column_no + 1;
        //         position = TimeSeries.mediator.publish("findSpace",container_id,rows,columns);
        //         //position = this.findSpace(container_id,rows,columns);
        //         length = position + columns;

        //         for(var indexrow = position;indexrow < length; indexrow++){
        //             for(var indexcol = 0;indexcol < rows; indexcol++){
        //                 cell_array[indexrow + (indexcol * container_col)].div_id = current_div_id;
        //             }
        //         }

        //         div.from_row_no = cell_array[position].row_number;
        //         div.to_row_no = cell_array[position].row_number + rows - 1;
        //         div.from_column_no = cell_array[position].column_number;
        //         div.to_column_no = cell_array[position].column_number + columns - 1;

        //         TimeSeries.mediator.publish("setMinHeight",container_id);
        //         //this.setMinHeight(container_id);
        //         div_element = document.getElementById(current_div_id).parentNode;
        //         div_element.style.left = cell_array[position].x+"px";
        //         div_element.style.top = cell_array[position].y+"px";
        //         // dom.applyCSS(current_div_id,{"left": cell_array[position].x+"px", "top": cell_array[position].y + "px", "background-color":"red"});
        //     }
        // },
        rearrangement: function(div_id,container_id,index) {
            var div_order_array = TimeSeries.view.container_obj[container_id].div_order_array,
                cell_array = TimeSeries.view.cell_obj[container_id].cell_object_array,
                // index = div_order_array.indexOf(div_id),
                dom = TimeSeries.domModule,
                container_obj = TimeSeries.view.container_obj[container_id],
                div_obj = TimeSeries.view.div_obj,
                cell_obj,
                div_element,
                div,
                temp_div_id,
                temp_div,
                container_row = container_obj.rows,
                container_col = container_obj.columns,
                row_number,
                current_div_id,
                length,
                cell_id,
                j,
                k,
                flag = true;
            for (var i = 0, len = div_order_array.length; i < len ; i++) {
                if(div_order_array[i] != div_id) {
                    current_div_id = div_order_array[i];
                    div = div_obj[current_div_id];
                    for(j = div.from_row_no; j <= div.to_row_no; j++) {
                        for(k = div.from_column_no; k <= div.to_column_no; k++) {
                            cell_id = container_col * j + k;
                            // console.log("cell_id", cell_id, current_div_id);
                            temp_div_id = cell_array[cell_id].div_id;
                            if(temp_div_id !== null && temp_div_id != current_div_id) {
                                flag = false;
                                break;
                            }
                        }
                        if(!flag) {
                            break;
                        }
                    }
                    rows = div.to_row_no - div.from_row_no + 1;
                    columns = div.to_column_no - div.from_column_no + 1;
                    row_number = TimeSeries.mediator.publish("getDivPosition",container_id, current_div_id, rows, columns, div.from_column_no, div.from_row_no, flag);
                    if(row_number !== null) {
                        // console.log("row_number", row_number, current_div_id);
                        TimeSeries.mediator.publish("updateCellObject",current_div_id,div.parent_id);
                        for(j = row_number; j < row_number + rows; j++) {
                            for(k = div.from_column_no; k < div.from_column_no + columns; k++) {
                                cell_id = container_col * j + k;
                                cell_array[cell_id].div_id = current_div_id;
                            }
                        }
                        div_element = document.getElementById(current_div_id).parentNode;
                        cell_obj = cell_array[container_col * row_number + div.from_column_no];
                        div_element.style.top = cell_obj.y + "px";
                        div_element.style.left = cell_obj.x + "px";
                        div.from_row_no = row_number;
                        div.to_row_no = row_number + rows - 1;
                        // div_order_array.splice(div_order_array.indexOf(current_div_id), 1);
                        // for(j = 0, length = div_order_array.length; j < length; j++) {
                        //     temp_div = div_obj[div_order_array[j]];
                        //     if((div.from_row_no < temp_div.from_row_no) || (div.from_column_no < temp_div.from_column_no && div.from_row_no == temp_div.from_row_no)) {
                        //         console.log("---------------", temp_div, j)
                        //         div_order_array.splice(j, 0, current_div_id);
                        //         break;
                        //     }
                        // }
                        // if(j === length) {
                        //     div_order_array.push(current_div_id);
                        // }
                    }
                    flag = true;
                }
            }
            div_order_array = [];
            for(i = 0, len = cell_array.length; i < len; i++) {
                temp_div_id = cell_array[i].div_id;
                if(temp_div_id && div_order_array.indexOf(temp_div_id) === -1) {
                    div_order_array.push(temp_div_id);
                }
            }
            TimeSeries.view.container_obj[container_id].div_order_array = div_order_array;
            TimeSeries.mediator.publish("setMinHeight",container_id);
            //TimeSeries.view.container_obj[container_id].current_row = div_obj[div_order_array[div_order_array.length - 1]].from_row_no;

            // console.log("div_order_array", div_order_array, TimeSeries.view.container_obj[container_id].div_order_array);
        },
        /**
        @Function: updateDivOrderArray
        @param {string} parent_id - the parent of the div id passed.
        @param {string} div_id - the div_id whose entry is to be removed from the div order array.
        @description: To delete the entry of the passed div_id from the div order array.
        */
        updateDivOrderArray: function(container_id,div_id) {
            var div_order_array = TimeSeries.view.container_obj[container_id].div_order_array,
                index;

            index = div_order_array.indexOf(div_id);
            div_order_array.splice(index, 1);
        },
        /**
        @Function: setMinHegiht
        @param {string} container_id - Setting minimum height array for passed container.
        @description: To set the min height values for the container obj so that we can locate position for placing new div.
        */
        setMinHeight: function(container_id){
            var div_order_array = TimeSeries.view.container_obj[container_id].div_order_array;
            var container = TimeSeries.view.container_obj[container_id],
                from_row_no,
                to_row_no,
                from_column_no,
                div_in_container;

            var length = container.columns;

            TimeSeries.mediator.publish("setAllValuesOfArrayToDefault",container.min_height,0,length);
            //this.setAllValuesOfArrayToDefault(container.min_height,0,length);
            // console.log("div_order_array", div_order_array, container.min_height);
            for(var i=0;i<div_order_array.length;i++){
                div_in_container = TimeSeries.view.div_obj[div_order_array[i]];
                from_column_no = div_in_container.from_column_no;
                to_column_no = div_in_container.to_column_no;
                to_row_no = div_in_container.to_row_no;
                for(var j=from_column_no;j<=to_column_no;j++ ){
                    container.min_height[j] = to_row_no + 1;
                }
            }
            // console.log(container.min_height)
        },
        /**
        @Function: setAllValuesOfArrayToDefault
        @param {array} to which default value needs to be set
        @param {val} default value assigned
        @param {size} upto which point value needs to be pushed
        */
        setAllValuesOfArrayToDefault: function(array_obj,val,len){
            for(var i=0;i<len;i++){
                //if(array_obj[i]){
                    array_obj[i]= val;
                //}
            }
        }
    };

    TimeSeries.mediator.subscribe('addDiv',div.addDiv);
    TimeSeries.mediator.subscribe('setMinHeight',div.setMinHeight);
    TimeSeries.mediator.subscribe('findSpace',div.findSpace);
    TimeSeries.mediator.subscribe('divHtmlString',div.divHtmlString);
    TimeSeries.mediator.subscribe('deleteDiv',div.deleteDiv);
    TimeSeries.mediator.subscribe('deleteEvent',div.deleteEvent);
    TimeSeries.mediator.subscribe('updateCellObject',div.updateCellObject);
    TimeSeries.mediator.subscribe('deleteDivObject',div.deleteDivObject);
    TimeSeries.mediator.subscribe('updateDivOrderArray',div.updateDivOrderArray);
    TimeSeries.mediator.subscribe('rearrangement',div.rearrangement);
    TimeSeries.mediator.subscribe('setAllValuesOfArrayToDefault',div.setAllValuesOfArrayToDefault);
    TimeSeries.mediator.subscribe('getDivPosition',div.getDivPosition);

    return {
        findSpace: div.findSpace,
        getCellObject: div.getCellObject,
        createDiv:div.createDiv,
        divHtmlString: div.divHtmlString,
        /* start-test-block */
        addDiv:div.addDiv,
        /* end-test-block */
        removeDiv: div.removeDiv,
        deleteDiv: div.deleteDiv,
        deleteEvent: div.deleteEvent,
        deleteDivObject: div.deleteDivObject,
        updateCellObject: div.updateCellObject,
        rearrangement: div.rearrangement,
        updateDivOrderArray: div.updateDivOrderArray,
        setMinHeight:div.setMinHeight,
        setAllValuesOfArrayToDefault:div.setAllValuesOfArrayToDefault,
        resize: div.resize,
        endResize: div.endResize
    };
}());

