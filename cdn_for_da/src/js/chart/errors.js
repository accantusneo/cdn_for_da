/**
@author Pykih developers
@module validation
@namespace TimeSeries
**/
/**
@function: errorHandling
@param {string} error_message - The error message to be shown to the user.
@description: It logs the passed error message in the browser console.
*/
function errorHandling(error_message){
    console.error('%c[Error - TimeSeries] ', 'color: red;font-weight:bold;font-size:14px',error_message);
}

/**
@function: renderHTMLString
@param {string} error_message - The warning message to be shown to the user.
@description: It logs the passed warning message in the browser console.
*/
function warningHandling(error_message) {
    console.warn('%c[Warning - TimeSeries] ', 'color: #F8C325;font-weight:bold;font-size:14px',error_message);
}

/**
@module: TimeSeries.errors
@description: It contains all helper functions for generating generic error and warning 'messages'.
*/
TimeSeries.errors = (function(){
    /**
    *   @function: idNotFoundOnDom
    *   @param {String} id - The element name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The element with id 'some_id' does not exist on DOM.
    *   @description: It returns a string to the caller.
    */
    var idNotFoundOnDom = function(id,selector){
        return "For Chart Selector '" + selector+"' : "+"The element with the id '"+id+"' does not exist on DOM.";
    };
    /**
    *   @function: idAlreadyExistsOnDom
    *   @param {String} id - The element name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The element with id 'some_id' already exist on DOM.
    *   @description: It returns a string to the caller.
    */
    var idAlreadyExistsOnDom = function(id,selector){
        return "For Chart Selector '" + selector+"' : "+"The element with the id '"+id+"' already exist on DOM.";
    };
    /**
    *   @function: idNotFound
    *   @param {String} id - The element name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The element with id 'some_id' does not exist.
    *   @description: It returns a string to the caller.
    */
    var idNotFound = function (id,selector){
        return "For Chart Selector '" + selector + "' : "+"The element with the id '" + id + "' does not exist.";
    };
    /**
    *   @function: fieldAlreadyExists
    *   @param {String} field - The field name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: 'some_field' already exist.
    *   @description: It returns a string to the caller.
    */
    var fieldAlreadyExists = function (field,selector){
        return "For Chart Selector '" + selector+"' : "+"'"+field+"' already exist.";
    };
   /**
    *   @function: fieldNotFound
    *   @param {String} field - The field name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: 'some_field' does not exist. Please insert a valid value for it.
    *   @description: It returns a string to the caller.
    */
    var fieldNotFound = function (field,selector){
        return "For Chart Selector '" + selector+"' : " + "'" + field + "' does not exist. Please insert a valid value for it.";
    };
    /**
    *   @function: invalidConfig
    *   @param {String} field - The field name that is not found.
    *   @param {String} selector - The name of the method that is throwing the error.
    *   @returns {String} selector: The value of 'some_field' is invalid.
    *   @description: It returns a string to the caller.
    */
    var invalidConfig = function(field,selector){
        return "For Chart Selector '" + selector+"' : " + "The value of '"+field+"' is invalid.";
    };
    var invalidDataFormat = function(selector) {
        return "For Chart Selector '" + selector+"' : " + "Invalid data format. Please enter data in one of the following formats : (JSON String, CSV String, CSV file, JSON file, JSON Object)";
    };

    var invalidColumnName = function(selector, field, column_names) {
        return "For Chart Selector '" + selector+"' : " + "The value of '" + field + "' is invalid. Column '" + column_names + "' doesnot exist in the data";
    };

    return {
        idNotFoundOnDom: idNotFoundOnDom,
        idAlreadyExistsOnDom: idAlreadyExistsOnDom,
        idNotFound: idNotFound,
        fieldAlreadyExists: fieldAlreadyExists,
        fieldNotFound: fieldNotFound,
        invalidConfig: invalidConfig,
        invalidDataFormat: invalidDataFormat,
        invalidColumnName: invalidColumnName
    };
})();