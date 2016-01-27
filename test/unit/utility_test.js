var validation;
module('Configuration_validation_functions',{
    beforeEach: function(){
        validation = TimeSeries.validation;
    }
});

test('Check if the datatype is correct',function(){
    expect(6);
    var arr = ["testing"], number = 10, func = function(){}, bool = true, str = "test", obj = {"testing":true};
    ok(validation.dataTypes(arr,"array"),"The parameter should be of type array");
    ok(validation.dataTypes(number,"number"),"The parameter should be of type number");
    ok(validation.dataTypes(func,"function"),"The parameter should be of type function");
    ok(validation.dataTypes(bool,"boolean"),"The parameter should be of type boolean");
    ok(validation.dataTypes(str,"string"),"The parameter should be of type string");
    ok(validation.dataTypes(obj,"object"),"The parameter should be of type object");
});

test('Check if the value of the variable is empty',function(){
    expect(1);
    var empty_string = "";
    ok(validation.isEmpty(empty_string),"The value of the variable should be empty");
});

test('Check if the value of the parameter is valid',function(){
    expect(1);
    var supported_values = ["qunit","test"];
    ok(validation.specificValues("test",supported_values),"The value of the variable should be either test or qunit");
});

test('Check if the value of the parameter is within valid range',function(){
    equal(validation.betweenValues(1.2,[0,1]), false, "The value of the variable should be betweenValues");
    equal(validation.betweenValues(0.2,[0,1]), true, "The value of the variable should be betweenValues");
});

test('array.unique(), where array contains duplicate values, returns an array with unique values',function() {
    deepEqual([1,1,3,4,5,6,5,3,4,7,4,3].unique(), [1,3,4,5,6,7], "unique method returns an array with uniqiue values");
});

test('array.areAllValuesSame(), return true if all values are same and false if there are multiple different values',function() {
    deepEqual([1,1,2].areAllValuesSame(), false, "areAllValuesSame method returns false");
    deepEqual([1,1,1].areAllValuesSame(), true, "areAllValuesSame method returns true");
});

test('array.equals(), return true if all values in both arrays are same and false otherwise',function() {
    deepEqual([1,2,3].equals([3,2,1]), false, "equals method returns false");
    deepEqual([1,2,3].equals([1,2,3]), true, "equals method returns true");
});
