module("Legends Testing");
test('The DOM structure for chart Legends ', function(assert) {
    var legends_group = document.getElementById('chart_line_legends'),
        legends_container = document.getElementById("legends_container"),
        legends_icon_group = document.getElementById("legends_icon_group"),
        legends_text_group = document.getElementById("legends_text_group");

    ok(legends_group,"Legends Group Created.");
    ok(legends_group,"Legends Container Created.");
    ok(legends_text_group,"Legends Text Group Created.");
    ok(legends_icon_group,"Legends icon Group Created.");

    equal(legends_icon_group.childNodes.length, 3, "There are 3 legend icons.");
    equal(legends_text_group.childNodes.length, 3, "There are 3 legend texts.");
});