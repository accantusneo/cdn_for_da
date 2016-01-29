var cell_obj = TimeSeries.view.cell_obj;
module('createCellObject');

test('testing container ID', function() {
	var config = {
	        "container_id" : "my_container_1",
	        "width" : 100,
	        "height" : 500,
	        "parent_id" : "parent_1",
	        "cell_size": 18,
	        "inter_cell_spacing": 2
	    },
    parent_element = document.createElement("DIV");
    parent_element.id = "parent_1";
	document.body.appendChild(parent_element);

    TimeSeries.viewContainerFunctions.createContainer(config);
	ok(cell_obj["my_container_1"], "The object for my_container_1 has been created in global cell object");
	TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
	parent_element.parentNode.removeChild(parent_element);
});


test('testing cell object', function() {
	var config = {
	        "container_id" : "my_container_2",
	        "width" : 40,
	        "height" : 45,
	        "parent_id" : "parent_1",
	        "cell_size": 15,
	        "inter_cell_spacing": 2
	    },
	    parent_element = document.createElement("DIV");
    parent_element.id = "parent_1";
	document.body.appendChild(parent_element);

    TimeSeries.viewContainerFunctions.createContainer(config);
	var cell_object_array = cell_obj["my_container_2"].cell_object_array,
	    cell_obj_array = [{
	  					cell_id : "my_container_2_0",
	  					row_number : 0,
	  					column_number : 0,
	  					x : 1,
	  					y : 1,
	  					div_id : null
	  				},
	  				{
	  					cell_id : "my_container_2_1",
	  					row_number : 0,
	  					column_number : 1,
	  					x : 18,
	  					y : 1,
	  					div_id : null
	  				},
	  				{
	  					cell_id : "my_container_2_2",
	  					row_number : 1,
	  					column_number : 0,
	  					x : 1,
	  					y : 18,
	  					div_id : null
	  				},
	  				{
	  					cell_id : "my_container_2_3",
	  					row_number : 1,
	  					column_number : 1,
	  					x : 18,
	  					y : 18,
	  					div_id : null
	  				}];
	expect(2);
	equal(cell_object_array.length, 4, "4 cell objects should be added to the cell object array");
	deepEqual(cell_object_array, cell_obj_array, "The cell objects with dynamic id, row number, column number, x, y and card id should be added to the cell object array");
	TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
	parent_element.parentNode.removeChild(parent_element);
});

test('testing cell size', function() {
	var config = {
	        "container_id" : "my_container_4",
	        "width" : 40,
	        "height" : 45,
	        "parent_id" : "parent_1",
	        "cell_size": 15,
	        "inter_cell_spacing": 2
	    },
	    parent_element = document.createElement("DIV");
    parent_element.id = "parent_1";
	document.body.appendChild(parent_element);

    TimeSeries.viewContainerFunctions.createContainer(config);
	var cell_size_2 = cell_obj["my_container_4"].cell_size;
	expect(1);
	equal(cell_size_2, 15, "15 should be assigned to the cell size");
	TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
	parent_element.parentNode.removeChild(parent_element);
});

test('testing inter_cell_spacing', function() {
	var config = {
	        "container_id" : "my_container_6",
	        "width" : 40,
	        "height" : 45,
	        "parent_id" : "parent_1",
	        "cell_size": 15,
	        "inter_cell_spacing": 2
	    },
	    parent_element = document.createElement("DIV");
    parent_element.id = "parent_1";
	document.body.appendChild(parent_element);

    TimeSeries.viewContainerFunctions.createContainer(config);
	var inter_cell_spacing_2 = cell_obj["my_container_6"].inter_cell_spacing;
	expect(1);
	equal(inter_cell_spacing_2, 2, "2 should be assigned to the inter-cell spacing");
	TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
	parent_element.parentNode.removeChild(parent_element);
});