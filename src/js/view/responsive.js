TimeSeries.responsive = (function() {
    var resize = function (options, svg) {
        var width = options.width,
            aspect_ratio = (width/options.height),
            target_width = !isNaN(parseFloat(d3.select("#" + options.selector).style("width"))) ? parseFloat(d3.select("#" + options.selector).style("width")) : 0;

        if(target_width > width || target_width === 0) {
            target_width = width;
        }

        if(svg) {
            svg.attr({
                "width" : target_width,
                "height" : (target_width / aspect_ratio)
            });
        }
    };

    var onWindowResize = function(options, svg) {
        var resizeContent = resize(options,svg);
        onDOMContentLoaded(resizeContent);
        window.addEventListener('resize', function(event){
            return resize(options, svg);
        });
    };

    TimeSeries.mediator.subscribe("onWindowResize",onWindowResize);
})();