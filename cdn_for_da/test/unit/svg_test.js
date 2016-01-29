module ("Create SVG", {
    beforeEach: function () {
        this.element = document.createElement("div");
        this.element.id = "chart_container";
        document.body.appendChild(this.element);
    },
    afterEach: function () {
        document.body.removeChild(this.element);
    }
});

test("Rendering the SVG element on DOM", function () {
    var config = {
        width: 600,
        height: 400,
        selector: "chart_container",
        chartType: "line_chart"
    }

    TimeSeries.svgRendererFunctions.createSVG(config);

    var svg = document.getElementById("chart_container_line_chart");
    ok(svg, "SVG is created on the DOM");
    equal(svg.getAttribute("width"), 600, "with width 600px");
    equal(svg.getAttribute("height"), 400, "with height 400px");
});