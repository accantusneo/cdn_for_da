var div = TimeSeries.viewDivFunctions,
    cells = TimeSeries.cellFunctions,
    dom_functions = TimeSeries.domModule,
    container = TimeSeries.viewContainerFunctions,
    container_obj;

// module('div related functionality testing',{
//     beforeEach: function(){
//         var parent_element;
//         container_obj = {
//             "container_id" : "cell",
//             "width" : 40,
//             "height" : 45,
//             "parent_id" : "parent_1",
//             "rows": 2,
//             "columns": 2,
//             "cell_size": 15,
//             "inter_cell_spacing": 2
//         };
//         parent_element = document.createElement("DIV");
//         parent_element.id = "parent_1";
//         document.body.appendChild(parent_element);
//         container.createContainer(container_obj);
//     }
// });

// test('If there is space to add a div then return cell number else return false',function(){
//     expect(2);
//     equal(div.findSpace("cell",2,2),0,"There is space to place divs within the container from cell number 0");
//     div.setMinHeight("cell");
//     // equal(div.findSpace("cell",4,2),false,"There is no space to place divs within the container");
//     // console.log("after");
// });


var divHtmlString;
module('Div HTML string test',{
    beforeEach: function() {
        divHtmlString = TimeSeries.viewDivFunctions.divHtmlString;
    }
});

test('The HTML string for div', function() {
    var element = document.createElement("DIV"),
        config,
        config1;
    element.id = "parent_1";
    document.body.appendChild(element);
    config = {
        "container_id" : "div_container_1",
        "width" : 100,
        "height" : 500,
        "parent_id" : "parent_1",
        "cell_size": 18,
        "inter_cell_spacing": 2
    };
    TimeSeries.viewContainerFunctions.createContainer(config);
    config1 = {
        "width_px": 60,
        "height_px": 80,
        "is_deletable": true,
        'from_row_no':2,
        'to_row_no':5,
        'from_column_no':1,
        'to_column_no':3
    };
    TimeSeries.view.div_obj["my_div_1"] = config1;
    expect(1);
    deepEqual(divHtmlString("my_div_1","div_container_1"),"<div class='div_parent' style='width:60px; height:80px; left:21px; top:41px;'><img id='my_div_1_delete' class='delete_button' src='../src/img/delete.png' style='width:15px;height:15px;'><div id='my_div_1' class='div_inner' style='width:60px; height:80px;'></div></div>",
        "Creates delete image and div inside div. The inner div contains id as my_div_1 and both the divs have width as 60 and height as 80. The image has width and height as 15");
    TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
    element.parentNode.removeChild(element);
    delete TimeSeries.view.div_obj["my_div_1"];
});

test('The HTML string for div', function() {
    var element = document.createElement("DIV"),
        config,
        config1;
        element.id = "parent_2";
        document.body.appendChild(element);
    config = {
        "container_id" : "div_container_2",
        "width" : 100,
        "height" : 500,
        "parent_id" : "parent_2",
        "cell_size": 18,
        "inter_cell_spacing": 2
    };
    TimeSeries.viewContainerFunctions.createContainer(config);
    config1 = {
        "width_px": 60,
        "height_px": 80,
        "is_deletable": false,
        'from_row_no':2,
        'to_row_no':5,
        'from_column_no':1,
        'to_column_no':3
    };
    TimeSeries.view.div_obj["my_div_2"] = config1;
    expect(1);
    deepEqual(divHtmlString("my_div_2","div_container_2"),"<div class='div_parent' style='width:60px; height:80px; left:21px; top:41px;'><div id='my_div_2' class='div_inner' style='width:60px; height:80px;'></div></div>",
        "Creates only div inside div and no delete image. The inner div contains id as my_div_2 and both the divs have width as 60 and height as 80.");
    TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
    element.parentNode.removeChild(element);
    delete TimeSeries.view.div_obj["my_div_2"];
});

module('Div add core method testing', {
    beforeEach: function() {
        var element = document.createElement("div");
        element.id = "parentdiv";
        document.body.appendChild(element);
    },
    afterEach: function() {
        var element = document.getElementById("parentdiv");
        element.parentNode.removeChild(element);
    }
});

test('Add div core functionality div array entry',function(){
    var configurations,
        div_config,
        div_array,
        div_array_test;
    configurations = {
        'container_id':'containerdiv_1',
        'parent_id':'parentdiv',
        'cell_size':48 ,
        'inter_cell_spacing':5,
        'width':500,
        'height':500
    };
    div_config = {
        'container_id':'containerdiv_1',
        'div_id':'iddiv',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };

    TimeSeries.viewContainerFunctions.createContainer(configurations);

    div_array = {
        'height_px': 48,
        'width_px':48,
        'from_row_no':0,
        'to_row_no':0,
        'from_column_no':0,
        'to_column_no':0,
        'is_deletable':false,
        'delete_html':'',
        'parent_id': 'containerdiv_1'
    };

    TimeSeries.viewDivFunctions.createDiv(div_config);
    div_array_test = TimeSeries.view.div_obj['iddiv'];

    deepEqual(div_array_test,div_array,"Cell object manipulated.");

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);
 });

test('Once div is added, check dom object.',function(){

    var configurations,
        div_config;

    configurations = {
        'container_id':'containerdiv_3',
        'parent_id':'parentdiv',
        'cell_size':48 ,
        'inter_cell_spacing':5,
        'width':500,
        'height':500
    };
    div_config = {
        'container_id':'containerdiv_3',
        'div_id':'iddiv',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };

    TimeSeries.viewContainerFunctions.createContainer(configurations);
    TimeSeries.viewDivFunctions.createDiv(div_config);

    ok(typeof document.getElementById('iddiv') !== 'undefined' && document.getElementById('iddiv') !== null,'Element exists in the div');

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);

});

test('multiple div core functionality div array entry',function(){

    var configurations,
        div_config_1,
        div_config_2,
        div_config_3,
        div_array_1,
        div_array_2,
        div_array_3,
        div_array_test_1,
        div_array_test_2,
        div_array_test_3;

    configurations = {
        'container_id':'containerdiv_4',
        'parent_id':'parentdiv',
        'cell_size':48 ,
        'inter_cell_spacing':5,
        'width':1000,
        'height':700
    };
    div_config_1 = {
        'container_id':'containerdiv_4',
        'div_id':'iddiv_1',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_2 = {
        'container_id':'containerdiv_4',
        'div_id':'iddiv_2',
        'height':2 ,
        'width':2,
        'is_deletable':true,
        'delete_html':''
    };
    div_config_3 = {
        'container_id':'containerdiv_4',
        'div_id':'iddiv_3',
        'height':1 ,
        'width':16,
        'is_deletable':false,
        'delete_html':''
    };

    TimeSeries.viewContainerFunctions.createContainer(configurations);

    // console.log('container_obj',TimeSeries.view.container_obj);

    div_array_1 = {'height_px': 48,'width_px':48,'from_row_no':0,
    'to_row_no':0,'from_column_no':0,'to_column_no':0,'is_deletable':false,delete_html:'','parent_id':"containerdiv_4"};

    div_array_2 = {'height_px': 101,'width_px':101,'from_row_no':0,
    'to_row_no':1,'from_column_no':1,'to_column_no':2,'is_deletable':true,delete_html:'','parent_id':"containerdiv_4"};

    div_array_3 = {'height_px': 48,'width_px':843,'from_row_no':2,
    'to_row_no':2,'from_column_no':0,'to_column_no':15,'is_deletable':false,delete_html:'','parent_id':"containerdiv_4"};

    TimeSeries.viewDivFunctions.createDiv(div_config_1);
    TimeSeries.viewDivFunctions.createDiv(div_config_2);
    TimeSeries.viewDivFunctions.createDiv(div_config_3);

    div_array_test_1 = TimeSeries.view.div_obj['iddiv_1'];
    div_array_test_2 = TimeSeries.view.div_obj['iddiv_2'];
    div_array_test_3 = TimeSeries.view.div_obj['iddiv_3'];

    deepEqual(div_array_test_1,div_array_1,"Addes an element 1 to a div_array");
    deepEqual(div_array_test_2,div_array_2,"Addes an element 2 to a div_array");
    deepEqual(div_array_test_3,div_array_3,"Addes an element 3 to a div_array");

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);

});

test('Event listener on div', function(){
    var element,
        parent_element,
        config,
        div_config,
        div_html_string;
    parent_element = document.createElement("DIV");
    parent_element.id = "parent_1";

    document.body.appendChild(parent_element);
    config = {
        "container_id" : "container_1",
        "width" : 500,
        "height" : 500,
        "parent_id" : "parent_1",
        "cell_size": 18,
        "inter_cell_spacing": 2
    };
    TimeSeries.viewContainerFunctions.createContainer(config);
    div_config = {
        "width": 400,
        "height": 400,
        "is_deletable": true,
        'from_row_no':2,
        'to_row_no':5,
        'from_column_no':1,
        'to_column_no':3
    };

    TimeSeries.view.div_obj["div_1"] = div_config;

    div_html_string = TimeSeries.viewDivFunctions.divHtmlString("div_1","container_1");
    parent_element.innerHTML = div_html_string;
    element = document.getElementById("div_1");
    TimeSeries.viewDivFunctions.deleteEvent("div_1");

    element.parentNode.onmouseover();
    equal(document.getElementById("div_1_delete").style.display,"block","on mouseover of the div the delete button should be visible(display property should become block)");
    // document.getElementById("div_1_delete").click();
    // equal(document.getElementById("div_1"),null,"on click of the delete icon the div should be deleted");
    document.getElementById("div_1").parentNode.onmouseout();
    equal(document.getElementById("div_1_delete").style.display,"none","on mouseout of the div the delete button should be invisible(display property should become none)");
    TimeSeries.viewContainerFunctions.removeContainer(config.container_id);
    parent_element.parentNode.removeChild(parent_element);
    delete TimeSeries.view.div_obj["div_1"];
});

module('removeDiv function testing ');
test('should return error when the div is deleted which is not rendered on the DOM.', function() {
    var div = document.getElementById('this_div_will_surely_not_be_there_on_DOM'),
        remove = TimeSeries.viewDivFunctions.removeDiv('this_div_will_surely_not_be_there_on_DOM');

    ok(!div,"There was no container found on the DOM");
    equal(remove.error,"The element with id 'this_div_will_surely_not_be_there_on_DOM' does not exist on DOM. Please pass correct id.", 'Proper error logged.');
});

test('should return error when the div is deleted which is not in the div_obj', function() {
    var element = document.createElement("DIV"),
        div,
        elem,
        remove;
    element.id = "this_div_will_surely_not_be_there_on_DOM";
    document.body.appendChild(element);

    div = document.getElementById('this_div_will_surely_not_be_there_on_DOM');
    remove = TimeSeries.viewDivFunctions.removeDiv('this_div_will_surely_not_be_there_on_DOM');

    ok(div,"The div is there on the DOM.");
    equal(remove.error,"The div with id 'this_div_will_surely_not_be_there_on_DOM' does not exist. Please pass correct id.", 'Proper error logged.');
    (elem=document.getElementById('this_div_will_surely_not_be_there_on_DOM')).parentNode.removeChild(elem);
});

module('Delete Div',{
    beforeEach: function() {
        var element,
            div_array_1,
            div_array_2,
            configurations,
            div_config_1,
            div_config_2;
        element = document.createElement("div");
        element.id = "parentdiv";
        document.body.appendChild(element);

        configurations = {
            'container_id':'containerdiv_4',
            'parent_id':'parentdiv',
            'cell_size':48 ,
            'inter_cell_spacing':5,
            'width':1000,
            'height':700
        };
        div_config_1 = {
            'container_id':'containerdiv_4',
            'div_id':'iddiv_1',
            'height':1 ,
            'width':1,
            'is_deletable':false,
            'delete_html':''
        };
        div_config_2 = {
            'container_id':'containerdiv_4',
            'div_id':'iddiv_2',
            'height':2 ,
            'width':2,
            'is_deletable':true,
            'delete_html':''
        };

        TimeSeries.viewContainerFunctions.createContainer(configurations);

        div_array_1 = {'height_px': 48,'width_px':48,'from_row_no':0,
        'to_row_no':0,'from_column_no':0,'to_column_no':0,'is_deletable':false,delete_html:''};

        div_array_2 = {'height_px': 101,'width_px':101,'from_row_no':0,
        'to_row_no':1,'from_column_no':1,'to_column_no':2,'is_deletable':true,delete_html:''};

        div.createDiv(div_config_1);
        div.createDiv(div_config_2);
    },
    afterEach: function() {
        TimeSeries.viewContainerFunctions.removeContainer("containerdiv_4");
        var element = document.getElementById("parentdiv");
        element.parentNode.removeChild(element);
    }
});

test('Remove the object of the div from div_obj', function(){
    div.deleteDivObject("iddiv_2");
    ok(!("iddiv_2" in TimeSeries.view.div_obj),'Remove the attribute iddiv_1 from div object');
});

test('update div order array',function(){
    var element_exists;
    div.updateDivOrderArray('containerdiv_4','iddiv_2');
    element_exists = TimeSeries.view.container_obj['containerdiv_4'].div_order_array.indexOf('iddiv_2') === -1;
    ok(element_exists, "iddiv_2 is removed from the div order array");
});

test("remove div from the dom", function(){
    div.deleteDiv("iddiv_2");
    ok(!document.getElementById("iddiv_2"),"Div with id iddiv_2 has been removed from the DOM");
});


module('Set min height function testing', {
    beforeEach: function() {
        var element = document.createElement("div");
        element.id = "parentdiv";
        document.body.appendChild(element);
    },
    afterEach: function() {
        var element = document.getElementById("parentdiv");
        element.parentNode.removeChild(element);
    }
});

test('Added single div and then testing min height value',function(){
    var configurations,
        div_config_1,
        min_height_array;

    configurations = {
        'container_id':'containerdiv_6',
        'parent_id':'parentdiv',
        'cell_size':45 ,
        'inter_cell_spacing':5,
        'width':100,
        'height':100
    };
    div_config_1 = {
        'container_id':'containerdiv_6',
        'div_id':'containerdiv_6_iddiv_1',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    min_height_array = [1,0];

    TimeSeries.viewContainerFunctions.createContainer(configurations);
    TimeSeries.viewDivFunctions.createDiv(div_config_1);

    deepEqual(TimeSeries.view.container_obj['containerdiv_6'].min_height,min_height_array,'Added single div to min height');

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);
});

test('Added single div and then testing min height value',function(){
    var configurations,
        div_config_1,
        div_config_2,
        min_height_array;

    configurations = {
        'container_id':'containerdiv_7',
        'parent_id':'parentdiv',
        'cell_size':45 ,
        'inter_cell_spacing':5,
        'width':300,
        'height':300
    };
    div_config_1 = {
        'container_id':'containerdiv_7',
        'div_id':'containerdiv_7_iddiv_1',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_2 = {
        'container_id':'containerdiv_7',
        'div_id':'containerdiv_7_iddiv_2',
        'height':2 ,
        'width':2,
        'is_deletable':false,
        'delete_html':''
    };
    min_height_array = [1,2,2,0,0,0]

    TimeSeries.viewContainerFunctions.createContainer(configurations);
    TimeSeries.viewDivFunctions.createDiv(div_config_1);
    TimeSeries.viewDivFunctions.createDiv(div_config_2);

    deepEqual(TimeSeries.view.container_obj['containerdiv_7'].min_height,min_height_array,'Added single div to min height');

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);
});

test('Added two divs and then testing min height value',function(){
    var configurations,
        div_config_1,
        div_config_2,
        div_config_3,
        min_height_array;

    configurations = {
        'container_id':'containerdiv_8',
        'parent_id':'parentdiv',
        'cell_size':45 ,
        'inter_cell_spacing':5,
        'width':300,
        'height':300
    };
    div_config_1 = {
        'container_id':'containerdiv_8',
        'div_id':'containerdiv_8_iddiv_1',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_2 = {
        'container_id':'containerdiv_8',
        'div_id':'containerdiv_8_iddiv_2',
        'height':2 ,
        'width':2,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_3 = {
        'container_id':'containerdiv_8',
        'div_id':'containerdiv_8_iddiv_3',
        'height':1 ,
        'width':3,
        'is_deletable':false,
        'delete_html':''
    };
    min_height_array = [1,2,2,1,1,1]

    TimeSeries.viewContainerFunctions.createContainer(configurations);
    TimeSeries.viewDivFunctions.createDiv(div_config_1);
    TimeSeries.viewDivFunctions.createDiv(div_config_2);
    TimeSeries.viewDivFunctions.createDiv(div_config_3);

    deepEqual(TimeSeries.view.container_obj['containerdiv_8'].min_height,min_height_array,'Added two divs and then testing min height value');

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);
});
test('Added full row for divs and then testing min height value',function(){
    var configurations,
        div_config_1,
        div_config_2,
        div_config_3,
        div_config_4,
        min_height_array;

    configurations = {
        'container_id':'containerdiv_9',
        'parent_id':'parentdiv',
        'cell_size':45 ,
        'inter_cell_spacing':5,
        'width':300,
        'height':300
    };
    div_config_1 = {
        'container_id':'containerdiv_9',
        'div_id':'containerdiv_9_iddiv_1',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_2 = {
        'container_id':'containerdiv_9',
        'div_id':'containerdiv_9_iddiv_2',
        'height':2 ,
        'width':2,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_3 = {
        'container_id':'containerdiv_9',
        'div_id':'containerdiv_9_iddiv_3',
        'height':1 ,
        'width':3,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_4 = {
        'container_id':'containerdiv_9',
        'div_id':'containerdiv_9_iddiv_4',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    min_height_array = [2,2,2,1,1,1];

    TimeSeries.viewContainerFunctions.createContainer(configurations);

    TimeSeries.viewDivFunctions.createDiv(div_config_1);
    TimeSeries.viewDivFunctions.createDiv(div_config_2);
    TimeSeries.viewDivFunctions.createDiv(div_config_3);
    TimeSeries.viewDivFunctions.createDiv(div_config_4);

    deepEqual(TimeSeries.view.container_obj['containerdiv_9'].min_height,min_height_array,'Added full row for divs and then testing min height value');

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);
});


test('Added flat div below orginal and then testing min height value',function(){
    var configurations,
        div_config_1,
        div_config_2,
        div_config_3,
        div_config_4,
        min_height_array;

    configurations = {
        'container_id':'containerdiv_10',
        'parent_id':'parentdiv',
        'cell_size':45 ,
        'inter_cell_spacing':5,
        'width':300,
        'height':300
    };
    div_config_1 = {
        'container_id':'containerdiv_10',
        'div_id':'containerdiv_10_iddiv_1',
        'height':2 ,
        'width':2,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_2 = {
        'container_id':'containerdiv_10',
        'div_id':'containerdiv_10_iddiv_2',
        'height':1 ,
        'width':1,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_3 = {
        'container_id':'containerdiv_10',
        'div_id':'containerdiv_10_iddiv_3',
        'height':2 ,
        'width':2,
        'is_deletable':false,
        'delete_html':''
    };
    div_config_4 = {
        'container_id':'containerdiv_10',
        'div_id':'containerdiv_10_iddiv_4',
        'height':1 ,
        'width':6,
        'is_deletable':false,
        'delete_html':''
    };
    min_height_array = [3,3,3,3,3,3];

    TimeSeries.viewContainerFunctions.createContainer(configurations);

    TimeSeries.viewDivFunctions.createDiv(div_config_1);
    TimeSeries.viewDivFunctions.createDiv(div_config_2);
    TimeSeries.viewDivFunctions.createDiv(div_config_3);
    TimeSeries.viewDivFunctions.createDiv(div_config_4);

    deepEqual(TimeSeries.view.container_obj['containerdiv_10'].min_height,min_height_array,'Added single div to min height');

    TimeSeries.viewContainerFunctions.removeContainer(configurations.container_id);
});
