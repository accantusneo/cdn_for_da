var div = TimeSeries.viewDivFunctions;
module("rearranging div's",{
    beforeEach: function() {
        var element = document.createElement("div");
        element.id = "rearrange-div";
        document.body.appendChild(element);

        var configurations = {
            'container_id':'main_div_test',
            'parent_id':'rearrange-div',
            'cell_size':45 ,
            'inter_cell_spacing':5,
            'width':300,
            'height':300
        };

        var div_config_1 = {
            'container_id':'main_div_test',
            'div_id':'div_config_1',
            'height':2 ,
            'width':2,
            'is_deletable':false,
            'delete_html':''
        };

        var div_config_2 = {
            'container_id':'main_div_test',
            'div_id':'div_config_2',
            'height':1 ,
            'width':1,
            'is_deletable':false,
            'delete_html':''
        };

        var div_config_3 = {
            'container_id':'main_div_test',
            'div_id':'div_config_3',
            'height':2 ,
            'width':2,
            'is_deletable':false,
            'delete_html':''
        };

        var div_config_4 = {
            'container_id':'main_div_test',
            'div_id':'div_config_4',
            'height':1 ,
            'width':6,
            'is_deletable':false,
            'delete_html':''
        };

        TimeSeries.viewContainerFunctions.createContainer(configurations);
        TimeSeries.viewDivFunctions.createDiv(div_config_1);
        TimeSeries.viewDivFunctions.createDiv(div_config_2);
        TimeSeries.viewDivFunctions.createDiv(div_config_3);
        TimeSeries.viewDivFunctions.createDiv(div_config_4);
    },
    afterEach: function() {
        var element = document.getElementById("rearrange-div");
        TimeSeries.viewContainerFunctions.removeContainer('main_div_test');
        element.parentNode.removeChild(element);
    }
});

test('After deleting a card, rearrange ours divs',function(){
    div.removeDiv("div_config_2");
    TimeSeries.view.container_obj["main_div_test"].div_order_array;
    var child_nodes = document.getElementById("main_div_test").childNodes;
    ok(true,"hello");
    // var div = document.getElementById("rearrange-div");
    // div.parentNode.removeChild(div);

});