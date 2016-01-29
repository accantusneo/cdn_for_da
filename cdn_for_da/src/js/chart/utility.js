/**
@author Pykih developers
@module validation
@namespace TimeSeries
**/
TimeSeries.validation = (function() {
    /**
    @Function: isEmpty
    @param {string} config - The string to be tested.
    @description - To find if the string is empty or not.
    **/
    var isEmpty = function(config) {
        var is_empty = config.length === 0 || !config.trim();
        return is_empty;
    };
    /**
    @Function: dataTypes
    @param {string} config - The string to be tested.
    @param {string} datatype - The datatype of the config.
    @description To find if data is as per required data type.
    **/
    var dataTypes = function(config,datatype) {
        switch (datatype) {
            case "number":
                return (!isNaN(parseFloat(config)) && isFinite(config));
            case "array":
                return config.constructor === Array;
            case "boolean":
                return config.constructor === Boolean;
            case "string":
                return config.constructor === String;
            case "object":
                return config.constructor === Object;
            case "function":
                return config.constructor === Function;
            case "date":
                return new Date(config) != "Invalid Date";
        }
    };
    /**
    @Function: specificValues
    @param {(string|number|boolean)} config - The value to be tested.
    @param {array} values - The array of the valid values.
    @description: It checks if the parameter config exists in the array.
    */
    var specificValues = function(config,values) {
        return values.indexOf(config) !== -1;
    };
    /**
    @Function: betweenValues
    @param {number} config - The value to be tested.
    @param {array} values - The array of the valid range of values.
    @description: It checks if the parameter config is between the limit values.
    */
    var betweenValues = function(config,values) {
        var result = true;
        if (values.number) {
            result = result && dataTypes(config,"number");
        }
        if (values.between) {
            result = result && config >= values.between[0] && config <= values.between[1];
        }
        if (values.decimalPlaces >= 0) {
            result = result && ((config.toString().split('.')[1] || []).length <= 2);
        }
        return result;
    };
    return {
        isEmpty:isEmpty,
        dataTypes:dataTypes,
        specificValues:specificValues,
        betweenValues:betweenValues
    };
}());

/**
@Function: unique
@param {array} array - An array of values.
@return {array} - An array with unique values from the array paramter.
@description: It checks if the parameter config exists in the array.
*/
Array.prototype.unique = function() {
    if (this.length === 0) {
        return [];
    }
    this.sort();
    var re = [this[0]],
        length = this.length;
    for (var i = 1; i < length; i++) {
        if (this[i] !== re[re.length-1]) {
            re.push(this[i]);
        }
    }
    return re;
};

/**
@Function: areAllValuesSame
@param {array} array - An array of values.
@return {array} - true or false
@description: It checks if any element in the array is different from the first element of the array to verify if all the elements of the array are same.
*/
Array.prototype.areAllValuesSame = function() {
    var length = this.length;
    for (var i = 1; i < length; i++) {
        if (this[i] !== this[0]) {
            return false;
        }
    }
    return true;
};
/**
@Function: equal
@param {array} array - An array of values.
@return {boolean} - true or false
@description: It checks if all the elements of both the arrays are same
*/
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

// Add path interpolator to d3
d3.interpolators.push(function(a, b) {
    var isPath, isArea, interpolator, ac, bc, an, bn;

    // Create a new array of a given length and fill it with the given value
    function fill(value, length) {
        return d3.range(length)
            .map(function() {
                return value;
            });
    }

    // Extract an array of coordinates from the path string
    function extractCoordinates(path) {
        return path.substr(1, path.length - (isArea ? 2 : 1)).split('L');
    }

    // Create a path from an array of coordinates
    function makePath(coordinates) {
        return 'M' + coordinates.join('L') + (isArea ? 'Z' : '');
    }

    // Buffer the smaller path with coordinates at the same position
    function bufferPath(p1, p2) {
        var d = p2.length - p1.length;

        // Paths created by d3.svg.area() wrap around such that the 'end'
        // of the path is in the middle of the list of coordinates
        if (isArea) {
            return fill(p1[0], d/2).concat(p1, fill(p1[p1.length - 1], d/2));
        } else {
            return fill(p1[0], d).concat(p1);
        }
    }

    // Regex for matching the 'd' attribute of SVG paths
    isPath = /M-?\d*\.?\d*,-?\d*\.?\d*(L-?\d*\.?\d*,-?\d*\.?\d*)*Z?/;

    if (isPath.test(a) && isPath.test(b)) {
        // A path is considered an area if it closes itself, indicated by a trailing 'Z'
        isArea = a[a.length - 1] === 'Z';
        ac = extractCoordinates(a);
        bc = extractCoordinates(b);
        an = ac.length;
        bn = bc.length;

        // Buffer the ending path if it is smaller than the first
        if (an > bn) {
            bc = bufferPath(bc, ac);
        }

        // Or, buffer the starting path if the reverse is true
        if (bn > an) {
            ac = bufferPath(ac, bc);
        }

        // Create an interpolater with the buffered paths (if both paths are of the same length,
        // the function will end up being the default string interpolator)
        interpolator = d3.interpolateString(bn > an ? makePath(ac) : a, an > bn ? makePath(bc) : b);

        // If the ending value changed, make sure the final interpolated value is correct
        return bn > an ? interpolator : function(t) {
            return t === 1 ? b : interpolator(t);
        };
    }
});

var applyCSS = function(elementId,css_config) {
    var element = document.getElementById(elementId),
        css_name = Object.keys(css_config);
    for (var i = 0, len=css_name.length; i < len; i++) {
        element.style[css_name[i]] = css_config[css_name[i]];
    }
};

var linearGradient = function (options) {
    var data;
    if (options.feature && options.feature.name === "Visual Comparison") {
        if (options.selector.indexOf("secret") > -1) {
            data = [
                {id: "0",  offset: "0%", color: options.chartColor, opacity: 0},
                {id: "1", offset: "0.4%", color: options.chartColor, opacity: 0},
                {id: "2", offset: "0.4%", color: options.brushColor, opacity: 0},
                {id: "3", offset: "25%", color: options.brushColor, opacity: 0},
                {id: "4", offset: "25%", color: options.chartColor, opacity: 0},
                {id: "5", offset: "75%", color: options.chartColor, opacity: 0},
                {id: "6", offset: "75%", color: options.brushColor, opacity: 1},
                {id: "7", offset: "99.6%", color: options.brushColor, opacity: 1},
                {id: "8", offset: "99.6%", color: options.chartColor, opacity: 0},
                {id: "9", offset: "100%", color: options.chartColor, opacity: 0}
            ];
        } else {
            data = [
                {id: "0", offset: "0%", color: options.chartColor, opacity: 1},
                {id: "1", offset: "0.4%", color: options.chartColor, opacity: 1},
                {id: "2", offset: "0.4%", color: options.brushColor, opacity: 1},
                {id: "3", offset: "25%", color: options.brushColor, opacity: 1},
                {id: "4", offset: "25%", color: options.chartColor, opacity: 1},
                {id: "5", offset: "75%", color: options.chartColor, opacity: 1},
                {id: "6", offset: "75%", color: options.brushColor, opacity: 0},
                {id: "7", offset: "99.6%", color: options.brushColor, opacity: 0},
                {id: "8", offset: "99.6%", color: options.chartColor, opacity: 1},
                {id: "9", offset: "100%", color: options.chartColor, opacity: 1}
            ];
        }
    } else {
        data = [
            {id: "0", offset: "0%", color: options.chartColor},
            {id: "1", offset: "0.4%", color: options.chartColor},
            {id: "2", offset: "0.4%", color: options.brushColor},
            {id: "3", offset: "99.6%", color: options.brushColor},
            {id: "4", offset: "99.6%", color: options.chartColor},
            {id: "5", offset: "100%", color: options.chartColor}
        ];
    }
    options.group.append("linearGradient")
        .attr("id", options.selector+"_gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", options.extent[0]).attr("y1", 0)
        .attr("x2", options.extent[1]).attr("y2", 0)
        .selectAll("stop")
            .data(data)
            .enter().append("stop")
                .attr("id", function(d) { return options.selector+"_stop"+d.id; })
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; })
                // .attr("stroke-dasharray", ("3,3"))
                // .attr("stroke", function(d) { return d.color; })
                // .attr("stroke-width", "1px")
                .attr("stop-opacity", function(d) { return d.opacity; });
};

var existsOnDOM = function(id) {
    return (document.getElementById(id) ? true : false);
};

var onDOMContentLoaded = function (fn) {
    function completed() {
        document.removeEventListener( "DOMContentLoaded", completed, false );
        window.removeEventListener( "load", completed, false );
    }

    if ( document.addEventListener ) {
        document.addEventListener( "DOMContentLoaded", completed, false );
        window.addEventListener( "load", completed, false );
    } else if ( document.attachEvent ) { // if IE event model is used
        document.attachEvent("onreadystatechange", function(){
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", arguments.callee );
            }
        });
    }
    return this;
};
 var capitalizeFirstLetter = function (string) {
    string = string.trim();
    string = string.substr(0, 1).toUpperCase() + string.substr(1);

    return string;
};


var offset = function(elem, property) { //valid property value : Top, Left, Width, Height
    var offset = 0;
    property = "offset" + property;

    do {
        if ( !isNaN( elem[property] ) )
        {
            offset += elem[property];
        }
        elem =  elem.offsetParent;
    } while( elem );
    return offset;
};

var addZero = function (i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

// temporarily using a set of random generated colors.
var getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
