/**
@author Pykih developers
@module numberFormatFunctions
@namespace TimeSeries
*/
TimeSeries.numberFormatFunctions = (function() {
    /**
    @Function: dateFormatter
    @param {string} format - The directive for the output i.e. the output format
    @param {string} number - Input number to be converted
    @returns {Number} - returns converted number date using the specified directive
    @description: Used to change the format of the number while displaying in axis, tooltip etc.
    */
    var  numberFormatter = function numberFormatter(format, number) {
        return d3.format(format)(number);
    };

    TimeSeries.mediator.subscribe("numberFormatter",numberFormatter);
    return {
        numberFormatter : numberFormatter
    };

}());
