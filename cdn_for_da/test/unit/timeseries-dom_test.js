var dom_render;
module('Rendering element on Dom',{
    beforeEach: function() {
        dom_render = TimeSeries.domModule;
    }
});

test('Render element on the given parent node with expected width, height and id_test',function(){
    expect(8);
    var element;

    //test case 1
    element = document.createElement("DIV");
    element.id = "main_div";
    document.body.appendChild(element);
    dom_render.addElement("<div id='container-id-1' class='container' style='width:100px;height:100px'></div>","main_div");
    ok(document.getElementById("container-id-1"),"Element with id container-id-1 should be rendered on the Dom");
    equal(document.getElementById("container-id-1").id,"container-id-1","Elements id should be container-id-1");
    equal(document.getElementById("container-id-1").style.width,"100px","Elements width should be 100px");
    equal(document.getElementById("container-id-1").style.height,"100px","Elements height should be 100px");
    element.parentNode.removeChild(element);

    //test case 2
    element = document.createElement("DIV");
    element.id = "main_div_1";
    document.body.appendChild(element);
    dom_render.addElement("<div id='container-id-1' class='container' style='width:200px;height:200px'></div>","main_div_1");
    ok(document.getElementById("container-id-1"),"Element with id container-id-1 should be rendered on the Dom");
    equal(document.getElementById("container-id-1").id,"container-id-1","Elements id should be container-id-1");
    equal(document.getElementById("container-id-1").style.width,"200px","Elements width should be 200px");
    equal(document.getElementById("container-id-1").style.height,"200px","Elements height should be 200px");
    element.parentNode.removeChild(element);
});

module('Removing element from Dom',{
    beforeEach: function() {
        dom_render = TimeSeries.domModule;
    }
});


test('Remove element from the DOM test',function(){
    expect(2);
    var element;

    //test case 1
    element = document.createElement("DIV");
    element.id = "delete_div";
    document.body.appendChild(element);
    dom_render.removeElement("delete_div");
    ok(!document.getElementById("delete_div"),"Element with id delete_div has been deleted from the Dom");

    //test case 2
    element = document.createElement("DIV");
    element.id = "delete_div_1";
    document.body.appendChild(element);
    dom_render.removeElement("delete_div_1");
    ok(!document.getElementById("delete_div_1"),"Element with id delete_div_1 has been deleted from the Dom");
});

module('Apply css to DOM element',{
    beforeEach: function() {
        dom_render = TimeSeries.domModule;
    }
});

test("Check if the passed CSS config is applied",function(){
    var element;

    //test case 1
    element = document.createElement("DIV");
    element.id = "css_div";
    document.body.appendChild(element);
    dom_render.applyCSS("css_div",{"background-color":"red"});
    equal(element.style["background-color"],"red");
    element.parentNode.removeChild(element);
});