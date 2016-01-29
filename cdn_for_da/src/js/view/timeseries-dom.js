/*
@author : Pykih developers
*/
TimeSeries.domModule = (function(){
    var dom_functions = {
        /**
        @Function: renderHTMLString
        @param {string} htmlcontent - The HTML string to be rendered.
        @param {string} elementId - ID of the element on which the HTML string will be rendered.
        @description: It renders the the htmlcontent on the passed DOM element ID
        */
        renderHTMLString: function(htmlcontent,elementId) {
            var getParentElement = document.getElementById(elementId);
            getParentElement.innerHTML += htmlcontent;
        },
        /**
        @Function: removeElement
        @param {string} elementId - ID of the element to removed from the DOM.
        @description: It removes the element with the passed ID from the DOM
        */
        removeElement: function(elementId) {
            var element_to_be_deleted = document.getElementById(elementId);
            element_to_be_deleted.parentNode.removeChild(element_to_be_deleted);
        },
        /**
        @Function: removeElement
        @param {string} elementId - ID of the element on the DOM to which css is to be applied.
        @param {string} css_config - An object that contains the css properties to be applied.
        @description: It add the css configuration passed to the element specified by the user.
        */
        applyCSS: function(elementId,css_config) {
            var element = document.getElementById(elementId),
                css_name = Object.keys(css_config);
            for (var i = 0, len=css_name.length; i < len; i++) {
                element.style[css_name[i]] = css_config[css_name[i]];
            }
        }
    };

    TimeSeries.mediator.subscribe('addElement',dom_functions.renderHTMLString);
    TimeSeries.mediator.subscribe('removeElement',dom_functions.removeElement);
    TimeSeries.mediator.subscribe('applyCSS',dom_functions.applyCSS);

    return{
        addElement: dom_functions.renderHTMLString,
        removeElement: dom_functions.removeElement,
        applyCSS: dom_functions.applyCSS
    };
}());
