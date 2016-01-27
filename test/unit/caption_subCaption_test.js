module("Caption and Sub-Caption Testing");
test("The DOM structure for chart Caption and Sub-Caption",function () {
    var caption = document.getElementById('chart_lineline_caption_group'),
        sub_caption = document.getElementById('chart_lineline_sub_caption_group'),
        caption_text = caption.firstChild,
        sub_caption_text = sub_caption.firstChild;

    ok(caption,"Caption Group Created.");
    ok(sub_caption,"Sub-Caption Created.");

    equal(caption_text.getAttribute("font-size"),16,"The font size of the tick values of Caption is 16px.");
    equal(caption_text.getAttribute("font-weight"),"normal","The font weight of the tick values of Caption is normal.");
    equal(caption_text.getAttribute("text-anchor"),"middle","The font anchor of the tick values of Caption is middle.");
    ok(caption_text.getAttribute("fill"),"The font color of the tick values of Caption is set.");
    ok(caption_text.getAttribute("font-family"),"The font family of the tick values of Caption is set.");


    equal(sub_caption_text.getAttribute("font-size"),12,"The font size of the tick values of Sub-Caption is 12px.");
    equal(sub_caption_text.getAttribute("font-weight"),"normal","The font weight of the tick values of Sub-Caption is normal.");
    equal(sub_caption_text.getAttribute("text-anchor"),"middle","The font anchor of the tick values of Sub-Caption is middle.");
    ok(sub_caption_text.getAttribute("fill"),"The font color of the tick values of Sub-Caption is set.");
    ok(sub_caption_text.getAttribute("font-family"),"The font family of the tick values of Sub-Caption is set.");

});