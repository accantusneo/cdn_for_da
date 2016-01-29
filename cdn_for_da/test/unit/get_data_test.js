var get_data = TimeSeries.getData;
module("Detecting the data format");
test("Get the data format from the data user has passed",function(){
    var options = {
        json_obj: [{"key":"1","value":"hello"}], // Json object
        json_string: '[{"hello":"world"}]',
        csv: "test/test.csv",
        json: "test/test.json",
        csv_string: "Year,Make,Model,Description,Price\n1997,Ford,E350,'ac, abs, moon',3000.00",
        invalid_format: 'xyz'
    };
    equal(get_data.getDataFormat(options.json_obj, {"dataFormat": "smartDefault"}),"json_obj","The format of the data passed by the user is JSON Object");
    equal(get_data.getDataFormat(options.json_string, {"dataFormat": "smartDefault"}),"json_string","The format of the data passed by the user is JSON String");
    equal(get_data.getDataFormat(options.csv, {"dataFormat": "smartDefault"}),"csv","The format of the data passed by the user is csv");
    equal(get_data.getDataFormat(options.json, {"dataFormat": "smartDefault"}),"json","The format of the data passed by the user is json");
    equal(get_data.getDataFormat(options.csv_string, {"dataFormat": "smartDefault"}),"csv_string","The format of the data passed by the user is json");
    equal(get_data.getDataFormat(options.json, {"dataFormat": "json"}),"json","The format of the data passed by the user is json");

    // get_data.getData(options.json_obj);
    // get_data.getData(options.json_string);
    // get_data.getData(options.csv_string);
    // get_data.getData(options.csv);
    // get_data.getData(options.json);
    // get_data.getData(options.invalid_format);
});
