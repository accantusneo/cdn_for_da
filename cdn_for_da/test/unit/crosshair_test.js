module('crossHair and tooltip testing');

test('CrossHair line Creation',function(){
    ok(document.getElementById("chart_test_tooltip") !== null, "tooltip is created on the dom");
    ok(document.getElementById("chart_test_crosshair_vertical") !== null, "tooltip is created on the dom");
    // document.getElementById("chart_test_overlay").onmouseover();

})