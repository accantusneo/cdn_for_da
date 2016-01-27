module("Dimensional Analysis");
test("Mapping function should return the correct object as per the granularity ", function () {
    var year = TimeSeries.dimensionalAnalysis.mapFunction("year"),
        month = TimeSeries.dimensionalAnalysis.mapFunction("month"),
        hour = TimeSeries.dimensionalAnalysis.mapFunction("hour"),
        weekday = TimeSeries.dimensionalAnalysis.mapFunction("weekday"),
        week = TimeSeries.dimensionalAnalysis.mapFunction("week"),
        quarter = TimeSeries.dimensionalAnalysis.mapFunction("quarter"),
        day = TimeSeries.dimensionalAnalysis.mapFunction("day"),
        year_no = 1992,
        month_no = 7,
        hour_no = 13,
        weekday_no = 4,
        week_no = 12,
        day_no = 16;

    equal(year.format,'%Y',"Year object returned.");
    equal(month.format,'%b',"Month object returned.");
    equal(hour.format,'%H',"Hour object returned.");
    equal(weekday.format,'%a',"WeekDay object returned.");
    equal(week.format,'%U',"Week object returned.");
    ok(quarter.format,"Quarter object returned.");
    equal(day.format,'%d',"Day object returned.");

    equal(year.func(year_no).getFullYear(),1992,"correct year returned.");
    equal(month.func(month_no).getMonth(),7,"correct month returned.");
    equal(hour.func(hour_no).getHours(),13,"correct hour returned.");
    equal(weekday.func(weekday_no).getDay(),4,"correct day returned.");
    equal(week.func(week_no).getWeek(),12+1,"correct week returned.");
    equal(day.func(day_no).getDate(),16,"correct date returned.");
});

test("DOM and Interaction testing ", function () {
    seeDimensionalAnalysis("chart","chart_dimension_analysis","Precipitation");
    var mouseOver = new Event("mouseover"),
        element = document.querySelectorAll("#chart_dimension_month_plot_group .column")[6],
        chart_configs = TimeSeries.chart_configs["chart"],
        highlight_chart1 = document.querySelectorAll("#chart_dimension_year_plot_group .highlight-column")[0],
        highlight_chart2 = document.querySelectorAll("#chart_dimension_year_plot_group .highlight-column")[3],
        highlight_chart3 = document.querySelectorAll("#chart_dimension_year_plot_group .highlight-column")[4],
        highlight_chart4 = document.querySelectorAll("#chart_dimension_year_plot_group .highlight-column")[8];

    element.dispatchEvent(mouseOver);
    console.log(highlight_chart1.getAttribute("height") <= chart_configs.yScale.domain()[1],highlight_chart1.getAttribute("height"),chart_configs.yScale.domain()[1]);
    ok(highlight_chart1.getAttribute("height") <= chart_configs.yScale.domain()[1],"Highlighted bar for year 1949.");
    ok(highlight_chart2.getAttribute("height") <= chart_configs.yScale.domain()[1],"Highlighted bar for year 1952.");
    ok(highlight_chart3.getAttribute("height") <= chart_configs.yScale.domain()[1],"Highlighted bar for year 1953.");
    ok(highlight_chart4.getAttribute("height") <= chart_configs.yScale.domain()[1],"Highlighted bar for year 1957.");
});