// Function to generate objects for all the cells that can fit in a container and update the cell array
TimeSeries.cellFunctions = (function() {
  var cells = {
    createCellObject : function(container_id, start_id, row) {
      var container = TimeSeries.view.container_obj[container_id],
          cell = container.cell_size,
          inter_cell_spacing = container.inter_cell_spacing,
          container_object = TimeSeries.view.cell_obj[container_id] || {}, // Object to be pushed in cell_array
          cell_object_array = container_object.cell_object_array || [], // Stores the object of each cell
          rows = container.rows, // Number of rows that can fit in the container
          columns = container.columns, // Number of columns that can fit in the container
          id = start_id, // Counter to generate dynamic IDs for cells
          start_row = row ? rows : 0,
          total_rows = row ? (rows + row) : rows;

      // Generate cell objects for all the cells
      for( var i = start_row; i < total_rows; i++) {
          for(var j = 0; j < columns; j++) {
              var cell_object = {};
              cell_object.cell_id = container_id + "_" + id; // Generate dynamic cell ID
              cell_object.row_number = i; // Row number of the cell
              cell_object.column_number = j; // Column number of the cell
              cell_object.x = (cell + inter_cell_spacing) * j + inter_cell_spacing / 2; // x co-ordinate of the cell
              cell_object.y = (cell + inter_cell_spacing) * i + inter_cell_spacing / 2; // y co-ordinate of the cell
              cell_object.div_id = null; // id of the card addded on the cell - initially null as no card is added
              cell_object_array.push(cell_object);
              id++;
          }
      }
      container_object.cell_object_array = cell_object_array; // array of all the cell objects in the container
      container_object.cell_size = cell;
      container_object.inter_cell_spacing = inter_cell_spacing;
      TimeSeries.view.cell_obj[container_id] = container_object;
      if(row) {
        TimeSeries.view.container_obj[container_id].rows = rows + row;
      }
    }
  };

  TimeSeries.mediator.subscribe('createCellObject',cells.createCellObject);

  return {
    createCellObject : cells.createCellObject
  };
}());