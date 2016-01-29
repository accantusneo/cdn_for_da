/**
@author Pykih developers
@module dateFormatFunctions
@namespace TimeSeries
*/
TimeSeries.dateFormatFunctions = (function() {
    var dateFormatRegex = function () {
        var dateformats = [
            {
                format: ["YYYY MM DD", "YYYY M D", "YYYY MMM DD", "YYYY MMMM DD"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})$/i,
                mapping:[0,1,2,-2,-2,-2]
            },
            {
                format: ["YYYY MM DD hh:mm:ss", "YYYY M D hh:mm:ss", "YYYY MMM DD hh:mm:ss", "YYYY MMMM DD hh:mm:ss"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[0,1,2,3,4,5]
            },
            {
                format: ["YYYY MM DD hh:mm", "YYYY M D hh:mm", "YYYY MMM DD hh:mm", "YYYY MMMM DD hh:mm"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[0,1,2,3,4,-2]
            },
            {
                format: ["YYYY MM DD hh", "YYYY M D hh", "YYYY MMM DD hh", "YYYY MMMM DD hh"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2}) (\d{1,2})$/i,
                mapping:[0,1,2,3,-2,-2]
            },
            {
                format: ["MM DD YYYY", "M D YYYY"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4})$/i,
                mapping:[2,0,1,-2,-2,-2],
                test: ["DD MM YYYY", "D M YYYY"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MM DD YYYY hh:mm:ss", "M D YYYY hh:mm:ss"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,5],
                test: ["DD MM YYYY hh:mm:ss", "D M YYYY hh:mm:ss"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MM DD YYYY hh:mm", "M D YYYY hh:mm"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,-2],
                test: ["DD MM YYYY hh:mm", "D M YYYY hh:mm"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MM DD YYYY hh", "M D YYYY hh"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2})$/i,
                mapping:[2,0,1,3,-2,-2],
                test: ["DD MM YYYY hh" , "D M YYYY hh"],
                replaceRegex: "$2/$1/$3"
            },
            {
                format: ["MMM DD YYYY", "MMMM DD YYYY"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4})$/i,
                mapping:[2,0,1,-2,-2,-2]
            },
            {
                format: ["MMM DD YYYY hh:mm:ss", "MMMM DD YYYY hh:mm:ss"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,5]
            },
            {
                format: ["MMM DD YYYY hh:mm", "MMMM DD YYYY hh:mm"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[2,0,1,3,4,-2]
            },
            {
                format: ["MMM DD YYYY hh", "MMMM DD YYYY hh"],
                regex: /^(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{1,2})[,|.|\-| |\/](\d{4}) (\d{1,2})$/i,
                mapping:[2,0,1,3,-2,-2]
            },
            {
                format: ["DD MMM YYYY", "DD MMMM YYYY"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4})$/i,
                mapping:[2,1,0,-2,-2,-2]
            },
            {
                format: ["DD MMM YYYY hh:mm:ss", "DD MMMM YYYY hh:mm:ss"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[2,1,0,3,4,5]
            },
            {
                format: ["DD MMM YYYY hh:mm", "DD MMMM YYYY hh:mm"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4}) (\d{1,2}):(\d{1,2})$/i,
                mapping:[2,1,0,3,4,-2]
            },
            {
                format: ["DD MMM YYYY hh", "DD MMMM YYYY hh"],
                regex: /^(\d{1,2})[,|.|\-| |\/](\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))[,|.|\-| |\/](\d{4}) (\d{1,2})$/i,
                mapping:[2,1,0,3,-2,-2]
            },
            {
                format: ["YYYY MM"],
                regex: /^(\d{4})[,|.|\-| |\/](\d{1,2}|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))$/i,
                mapping:[0,1,-2,-2,-2,-2]
            },
            {
                format: ["YYYY"],
                regex: /^(\d{4})$/,
                mapping:[0,-2,-2,-2,-2,-2]
            },
            {
                format: ["hh:mm:ss"],
                regex: /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
                mapping:[-2,-2,-2,0,1,2]
            },
            {
                format: ["hh:mm"],
                regex: /^(\d{1,2}):(\d{1,2})$/,
                mapping:[-2,-2,-2,0,1,-2]
            },
            {
                format: ["hh"],
                regex: /^(\d{1,2})$/,
                mapping:[-2,-2,-2,0,-2,-2]
            },
            {
                format: ["YYYY-MM-DDThh:mm:ss"],
                regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
                mapping:[0,1,2,3,4,5]
            },
            {
                format: ["YYYY-MM-DDThh:mm"],
                regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{1,2})$/,
                mapping:[0,1,2,3,4,-2]
            },
            {
                format: ["YYYY-MM-DDThh:mm:ss"],
                regex: /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2})$/,
                mapping:[0,1,2,3,-2,-2]
            },
            {
                format: ["DAY, DD MMM YYYY", "DAY, DD MMMM YYYY"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})$/i,
                mapping:[3,2,1,-2,-2,-2]
            },
            {
                format: ["DAY, DD MMM YYYY hh:mm:ss", "DAY, DD MMMM YYYY hh:mm:ss"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})[ |,](\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[3,2,1,4,5,6]
            },
            {
                format: ["DAY, DD MMM YYYY hh:mm", "DAY, DD MMMM YYYY hh:mm"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})[ |,](\d{1,2}):(\d{1,2})$/i,
                mapping:[3,2,1,4,5,-2]
            },
            {
                format: ["DAY, DD MMM YYYY hh", "DAY, DD MMMM YYYY hh"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\d{1,2}) (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{4})[ |,](\d{1,2})$/i,
                mapping:[3,2,1,4,-2,-2]
            },
            {
                format: ["DAY, MMM DD YYYY", "DAY, MMMM DD YYYY"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})$/i,
                mapping:[3,1,2,-2,-2,-2]
            },
            {
                format: ["DAY, MMM DD YYYY hh:mm:ss", "DAY, MMMM DD YYYY hh:mm:ss"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})[ |,](\d{1,2}):(\d{1,2}):(\d{1,2})$/i,
                mapping:[3,1,2,4,5,6]
            },
            {
                format: ["DAY, MMM DD YYYY hh:mm", "DAY, MMMM DD YYYY hh:mm"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})[ |,](\d{1,2}):(\d{1,2})$/i,
                mapping:[3,1,2,4,5,-2]
            },
            {
                format: ["DAY, MMM DD YYYY hh", "DAY, MMMM DD YYYY hh"],
                regex: /^(\b(?:Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?))[,] (\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?|September|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)) (\d{1,2}) (\d{4})[ |,](\d{1,2})$/i,
                mapping:[3,1,2,4,-2,-2]
            },
            {
                format: ["YYYYMMDD"],
                regex: /^(\d{8})$/,
                mapping:[0,1,2,-2,-2,-2]
            },
            {
                format: ["YYYYMMDDHH"],
                regex: /^(\d{10})$/,
                mapping:[0,1,2,3,-2,-2]
            },
            {
                format: ["YYYYMMDDHHMM"],
                regex: /^(\d{12})$/,
                mapping:[0,1,2,3,4,-2]
            },
            {
                format: ["YYYYMMDDHHMMSS"],
                regex: /^(\d{14})$/,
                mapping:[0,1,2,3,4,5]
            }
        ];
        return dateformats;
    };

    var detectDateFormat = function (selector,data, date_field_name) {
        var dateformats = dateFormatRegex(),
            data_length =  data.length,
            format_lenth = dateformats.length,
            format_data,
            regex_data,
            format,
            value = data[0][date_field_name],
            actual_year,
            parsed_year;

        if (!value) {
            warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format (non string). Please enter data with valid date format.");
            return {"format":"Invalid format"};
        }
        if (typeof value === "number") {
            format_data = {"format": "TimeStamp"};
            format = "TimeStamp";
        } else if (value.match(dateformats[17].regex)) {
            format_data = dateformats[17];
            format = format_data.format[0];
        } else if (value.match(dateformats[32].regex)) {
            format_data = {"format": "YYYYMMDD"};
            format = "YYYYMMDD";
        } else if (value.match(dateformats[33].regex)) {
            format_data = {"format": "YYYYMMDDHH"};
            format = "YYYYMMDDHH";
        } else if (value.match(dateformats[34].regex)) {
            format_data = {"format": "YYYYMMDDHHMM"};
            format = "YYYYMMDDHHMM";
        } else if (value.match(dateformats[35].regex)) {
            format_data = {"format": "YYYYMMDDHHMMSS"};
            format = "YYYYMMDDHHMMSS";
        } else {
            for (var j = 0; j < format_lenth; j++) {
                if (value.match(dateformats[j].regex)) {
                    format_data = dateformats[j];
                    format = format_data.format[0];
                    break;
                } else if (!isNaN(value)) {
                    format_data = {"format": "TimeStamp"};
                    format = "TimeStamp";
                    break;
                }
            }
        }

        ///////////////////////////////////////////////////////
        /*
            Remove the format for YYYY MM after which remove the if condition below....

        */
        //////////////////////////////////////////////////////

        if (format_data &&format_data.format[0] === "YYYY MM") {
            warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format (YYYY MM). Please enter data with valid date format.");
            return {"format":"Invalid format"};
        }
        if (format_data && format_data.format !== "TimeStamp" && format_data.format !== "YYYYMMDD" && format_data.format !== "YYYYMMDDHH" && format_data.format !== "YYYYMMDDHHMM" && format_data.format !== "YYYYMMDDHHMMSS") {
            actual_year =  new Date(value).getFullYear();
            parsed_year = value.match(format_data.regex)[format_data.mapping[0] + 1];

            if (actual_year.toString() !== parsed_year) {
                warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format.Please enter data with valid date format.");
                return {"format":"Invalid format"};
            }
        }

        if(!format_data) {
            warningHandling("For Chart Selector '" + selector+"' : "+"Invalid date format.Please enter data with valid date format.");
            return {"format":"Invalid format"};
        }

        return {
            "format_data":format_data,
            "format": format
        };
    };

    /**
    @Function: dateFormatter
    @param {string} format - The directive for the output i.e. the output format
    @param {string} date - Input date in timestamp
    @returns {Number / String / Function} - returns either the formatted date or the function which will convert the date using the specified directive
    @description: Used to change the format of the date while displaying in axis, tooltip etc.
    */
    var dateFormatter = function (format, date) {
        if (format === "multi" && date) {
            return d3.time.format.multi([
                [".%L", function(d) { return d.getMilliseconds(); }],
                [":%S", function(d) { return d.getSeconds(); }],
                ["%I:%M", function(d) { return d.getMinutes(); }],
                ["%I %p", function(d) { return d.getHours(); }],
                ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                ["%b %d", function(d) { return d.getDate() != 1; }],
                ["%b", function(d) { return d.getMonth(); }],
                ["%Y", function() { return true; }]
            ])(date);
        } else if (format === "multi") {
            return d3.time.format.multi([
                [".%L", function(d) { return d.getMilliseconds(); }],
                [":%S", function(d) { return d.getSeconds(); }],
                ["%I:%M", function(d) { return d.getMinutes(); }],
                ["%I %p", function(d) { return d.getHours(); }],
                ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                ["%b %d", function(d) { return d.getDate() != 1; }],
                ["%B", function(d) { return d.getMonth(); }],
                ["%Y", function() { return true; }]
            ]);
        } else if (date) {
            return d3.time.format(format)(date);
        } else {
            return d3.time.format(format);
        }
    };

    TimeSeries.mediator.subscribe("detectDateFormat",detectDateFormat);
    TimeSeries.mediator.subscribe("dateFormatter",dateFormatter);

    return {
        detectDateFormat : detectDateFormat,
        dateFormatter : dateFormatter,
        /* start-test-block */
        dateFormatRegex : dateFormatRegex
        /* end-test-block */
    };

}());
