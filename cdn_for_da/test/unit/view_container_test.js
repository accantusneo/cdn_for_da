var containerHtmlString;
module('Creation of html sting to render the container ',{
    beforeEach: function() {
        containerHtmlString = TimeSeries.viewContainerFunctions.containerHtmlString;
    }
});

test('containerHtmlString() should return a string with height and width of 100 and 100 respectively with scroll on', function() {
    expect(1);
    var container_obj = {
    	container_id:"container-id-1",
    	width:100,
    	height:100,
    	scroll_enable:true
    }
    deepEqual(containerHtmlString(container_obj),"<div id='container-id-1' class='container' style='width:100px;height:100px;overflow-y:scroll;'></div>", 'A html div string created with width=100, height=100, id=container-id-1 and scroll=true');
});

test('containerHtmlString() should return a string with height and width of 500 and 500 respectively with scroll off', function() {
    expect(1);
    var container_obj = {
    	container_id:"container-id-1",
    	width:500,
    	height:500,
    	scroll_enable:false
    }
    deepEqual(containerHtmlString(container_obj),"<div id='container-id-1' class='container' style='width:500px;height:500px;overflow-y:hidden;'></div>", 'A html div string created with width=500, height=500, id=container-id-1 and scroll=false');
});

//Add container testing.....
var element;
module('Add Container on DOM ',{
    beforeEach: function() {
        element = document.createElement("DIV");
        element.id = "parent_1";

        document.body.appendChild(element);
    },
    afterEach: function() {
        document.body.removeChild(element);
    }
});

test('should update the container object with container of height=100 and width=500 ',function(){

    var config = {
        "container_id" : "container_1",
        "width" : 100,
        "height" : 500,
        "parent_id" : "parent_1",
        "cell_size": 18,
        "inter_cell_spacing": 2
    },
    elem;

    TimeSeries.viewContainerFunctions.addContainer(config);

    ok(TimeSeries.view.container_obj["container_1"], "Element is added to the container object.");
    equal(TimeSeries.view.container_obj["container_1"].rows, 25, 'div takes 25 rows.');
    equal(TimeSeries.view.container_obj["container_1"].columns, 5, "div takes 5 columns." );
    (elem=document.getElementById("container_1")).parentNode.removeChild(elem);
});


test("shoud render the div with id='container_1', height=100, width=500 on the DOM", function() {
    var config = {
        "container_id" : "container_1",
        "width" : 100,
        "height" : 500,
        "parent_id" : "parent_1",
        "rows": 25,
        "columns": 5,
        "cell_size": 18,
        "inter_cell_spacing": 2
    },
    elem;

    TimeSeries.viewContainerFunctions.addContainer(config);
    ok(document.getElementById('container_1'),"The div with id='container_1', height=100, width=500 detected on DOM.");
    (elem=document.getElementById("container_1")).parentNode.removeChild(elem);
});

test('should update the cell_obj', function() {
    var config = {
        "container_id" : "container_1",
        "width" : 100,
        "height" : 500,
        "parent_id" : "parent_1",
        "rows": 25,
        "columns": 5,
        "cell_size": 18,
        "inter_cell_spacing": 2
    },
    elem;

    TimeSeries.viewContainerFunctions.addContainer(config);

    ok(TimeSeries.view.cell_obj["container_1"], "The object for container_1 has been created in global cell object");
    (elem=document.getElementById("container_1")).parentNode.removeChild(elem);
});

test('should add a div before adding a container if parent_id is an id of a container', function() {
    var parent_config = {
        "container_id" : "container_1",
        "width" : 100,
        "height" : 500,
        "parent_id" : "parent_1",
        "cell_size": 18,
        "inter_cell_spacing": 2
    };
    TimeSeries.viewContainerFunctions.addContainer(parent_config);
    ok(document.getElementById('container_1'),"The container (id='container_1') where the new container to be added is created.")

    var config = {
        "container_id" : "container_new_one",
        "width" : 50,
        "height" : 200,
        "parent_id" : "container_1",
        "cell_size": 18,
        "inter_cell_spacing": 2
    },
    div_element,
    div_id = "div_"+config.container_id,
    elem;

    TimeSeries.viewContainerFunctions.addContainer(config);
    div_element = document.getElementById(div_id);

    ok(div_element,"The div is added on the DOM before adding a container.");
    equal(document.getElementById("container_new_one").parentNode.getAttribute('id'),config.parent_id, 'The div is added on the container div ');

    ok(document.getElementById('container_new_one'),"The container is also added on the DOM.");

    equal(document.getElementById("container_new_one").parentNode.getAttribute('id'),div_id, 'The container is added in the div and not into the parent container.');

    (elem=document.getElementById("container_new_one")).parentNode.removeChild(elem);
    (elem=document.getElementById(div_id)).parentNode.removeChild(elem);
    (elem=document.getElementById("container_1")).parentNode.removeChild(elem);
});


module('removeContainer function testing ');
test('should return error when the container is deleted which is not rendered on the DOM.', function() {
    var container = document.getElementById('this_id_will_surely_not_be_there_on_DOM');
    var removeCont = TimeSeries.viewContainerFunctions.removeContainer('this_id_will_surely_not_be_there_on_DOM');

    ok(!container,"There was no container found on the DOM");
    equal(removeCont.error,"The element with id 'this_id_will_surely_not_be_there_on_DOM' does not exist on DOM. Please pass correct id.", 'Proper error logged.');
});


test('should return error when the container is deleted which is not in the container_obj', function() {
    var element = document.createElement("DIV");
    element.id = 'this_id_will_surely_not_be_there_on_DOM';
    document.body.appendChild(element);
    var container = document.getElementById('this_id_will_surely_not_be_there_on_DOM'),
        elem;
    var removeCont = TimeSeries.viewContainerFunctions.removeContainer('this_id_will_surely_not_be_there_on_DOM');

    equal(removeCont.error,"The container with id 'this_id_will_surely_not_be_there_on_DOM' does not exist. Please pass correct id.", 'Proper error logged.');
    (elem=document.getElementById('this_id_will_surely_not_be_there_on_DOM')).parentNode.removeChild(elem);
});

module('deleteContainer function testing ');
test('The container-dependent objects should be deleted', function() {
    var container_id = "my_container";
    var parent_element = document.createElement("DIV");
        parent_element.id = "parent_div";

    document.body.appendChild(parent_element);
    var configurations = {
                            'container_id':'my_container',
                            'parent_id':'parent_div',
                            'cell_size':48 ,
                            'inter_cell_spacing':5,
                            'width':500,
                            'height':500
                         };

    var div_config = {
                        'container_id':'my_container',
                        'div_id':'my_div',
                        'height':1,
                        'width':1,
                        'is_deletable':false,
                        'delete_html':''
                    };
    TimeSeries.viewContainerFunctions.createContainer(configurations);

    var element = document.getElementById(container_id);

    TimeSeries.viewDivFunctions.createDiv(div_config);

    TimeSeries.viewContainerFunctions.deleteContainer(container_id);

    ok(!TimeSeries.view.cell_obj[container_id],"The cell object for given container should not exist (got deleted)");
    ok(!TimeSeries.view.container_obj[container_id],"The container object for given container should not exist (got deleted)");
    ok(!document.getElementById(container_id),"The container should not exist on DOM (got deleted)");
    parent_element.parentNode.removeChild(parent_element);
});
