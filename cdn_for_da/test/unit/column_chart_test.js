module('Column Chart Testing');
test('The DOM structure for column chart ', function(assert) {
    var main_container = document.getElementById('chart_column'),
        svg = main_container.firstChild,
        //caption = svg.firstChild,
        //sub_caption = caption.nextSibling,
        //chart_group = sub_caption.nextSibling;
        chart_group = svg.firstChild,//sub_caption.nextSibling,
        x_axis = chart_group.firstChild,
        y_axis = x_axis.nextSibling,
        plot_group = y_axis.nextSibling,
        rect = document.getElementsByClassName("column");//plot_group.firstChild;

        ok(svg,'has an svg element.');
        // ok(caption,'has a caption <g>.');
        // ok(sub_caption,'has a SubCaption <g>.');
        ok(chart_group,'has a chart container group <g>.');
        ok(x_axis,'has a x_axis group.');
        ok(y_axis,'has a y_axis group.');
        ok(plot_group,'has a plot group.');
        ok(rect,'plot_group has rect.');

        equal(main_container.nodeName,'DIV','has a main chart container.');
        // equal(caption.getAttribute("id"),"chart_columncolumn_caption_group","proper id assigned to the caption group 'chart_columncolumn_caption_group'.");
        // equal(sub_caption.getAttribute("id"),"chart_columncolumn_sub_caption_group","proper id assigned to the sub caption group 'chart_columncolumn_sub_caption_group'.");
        equal(chart_group.getAttribute("id"),"chart_columncolumn_group","proper id assigned to the chart group 'chart_columncolumn_sub_caption_group'.");
        equal(x_axis.getAttribute("id"),"xaxis","proper id assigned to the x_axis group 'xaxis'.");
        equal(y_axis.getAttribute("id"),"yaxis","proper id assigned to the y_axis group 'yaxis'.");
        equal(plot_group.getAttribute("id"),"chart_column_plot_group","proper id assigned to the plot_group 'chart_column_plot_group'.");
});