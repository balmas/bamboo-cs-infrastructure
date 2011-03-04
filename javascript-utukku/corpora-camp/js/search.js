var MAX_FOR_VISUALIZATION = 5;
var MIN_FOR_VISUALIZATION = 2;

/**
 * get the facets available for the search
 * @param {} a_spec
 */
function get_facets(a_spec){    
    if (!a_spec)
    {
        a_spec = ['']; 
    }        
    $("#facets_loading").css("display","block");
      Utukku.Client.Function({
        namespace: NS_COLLECTIONS,
        name: "facets",
        args: a_spec,
        next: write_facet,
        done: facets_done
     });
}

/**
 * Submit the query to the switchboard
 */
function submit_query()
{
   // build the search spec from the user's selections  
    var spec = {};
    if ($(".query").val())
    {
        var query_elem = $(".query").eq(0);
        var match = quer_elem.attr("id").match(/^query(.+)$/);
        if (match)
        {
            spec[match[1]] = query_elem.val();
        }
    }
    else
    {
        $(".facet").each(
            function()
            {            
                var match = $(this).attr("id").match(/^facet_(.+)$/);
                if (match)
                {
                    spec[match[1]] = $(this).val();
                }
            }
        );
    }    
    var s_args = [[spec]];    
    // TODO update the facets once sending a search spec to the request is supported
    //get_facets(spec);    
    Utukku.Client.Function({
        namespace: NS_COLLECTIONS,
        name: "query",
        args: s_args,
        next: write_result,
        done: results_done
     });

}

/**
 * Search page ready function (called on document load)
 */
function page_ready() {    
    get_facets();

    // make sure the results block is displayed if we have any results already
    if ($(".results").length > 0)
    {
        $("#query_results").css("display","block");
    }
    
    // add click handler on the query submit button
    // TODO it would be nice to support enter for submission -- add a real form here? 
    $(".submit_query").click(handle_submit_query);    
    
    // add click handler on the analysis submit button (visualization)
    $(".submit_anal").click(handle_submit_anal);
    
    // add click handler on the reset button
    $("button.reset").click(handle_reset);     
}

/**
 * handler for submit analysis button
 */
function handle_submit_anal()
{
    var texts = $("#selected_texts .selection.selected");
    // make sure the text selections meet the requirements
    if (texts.length >= MIN_FOR_VISUALIZATION && texts.length <= MAX_FOR_VISUALIZATION)
    {
        
        var form = $("#selected_texts form");                        
        $(texts).each(function(a_i,a_value)
        {
            form.append('<input type="hidden" name="textid" value="' 
                + encodeURIComponent($(a_value).attr('textid')) + '"/>');            
        });        
        form.submit();        
    }
    else
    {
        alert("Please select between " + 
            MIN_FOR_VISUALIZATION + " and " +  MAX_FOR_VISUALIZATION + " texts for analysis.");        
    }
    return false;
}
/**
 * handler for submit query button
 */
function handle_submit_query()
{
    // disable submit until the results are displayed
    $(this).attr("disabled",true);

    // show the loading indicator
    $("#query_loading").css("display","block");
            
    // clear the prior results and make sure the block is displayed for incoming results
    $("#query_results .result").remove();
    $("#query_results").css("display","block");
    var valid = validate_facets();
    if (valid)
    {
        submit_query();
    }
}

/**
 * handle for reset button
 * resets the display to clear any facet and texts selections
 */
function handle_reset()
{
    // clear the prior results
    $("#query_results .result").remove();
    
    // clear all selections
    $("#selected_texts .selection").remove();
    // get the default facets
    get_facets();
    $(".submit_query").text(labels.new_query);    
}

/**
 * write a facet to the display
 * @param {} a_result
 */
function write_facet(a_result)
{            
    var parent = $("#search_facets");
    var id = 'facet_' + a_result.label;
    var label = labels[a_result.label] || a_result.label;
    var class = 'facet';
    var widget;
    
    // handle query  type separately
    if (a_result.type == 'query'){
        parent = $("#search_query" + a_result.label );
        id = "query" + a_result.label;        
        class = "query";
        widget = $('<input type="textbox" id="query' + a_result.label + '"/>');
    } 
    else if (a_result.type == 'text')
    {                
        widget = $('<input type="textbox" id="' + id + '"/>');
        if (a_result.mask)
        {
            $(widget).addClass('validate');
            $(widget).attr('mask',a_result.mask);                       
        }
                        
    }
    else if (a_result.type == 'list')
    {
        widget = make_select(id,label,a_result);        
    }
    else if (a_result.type == 'date')
    {
       var minDate = format_date(a_result.min);
       var maxDate = format_date(a_result.max);
       // if we have a fully valid min and max date, use a date picker
       if (minDate && maxDate)
       {        
           widget = $('<input type="text" id="' + id + '"/>');
           $(widget).addClass('datepicker');
           $(widget).datepicker(
                {     
                    defaultDate: format_date(a_result.min),
                    minDate: format_date(a_result.min),
                    maxDate: format_date(a_result.max),
                    dateFormat: 'yyyy-mm-dd'
                }        
           ); 
       }
       // if we don't have fully valid dates, but have a min and max, use a range 
       else if (a_result.min && a_result.max)
       {
            widget = make_range_widget(id,label,a_result);
       }
       // otherwise just show a list
       else
       {
            widget = make_select(a_result);
       }
       
    }    
    else if (a_result.type == 'range')
    {
    }
    if (a_result.missing)
    {
        // TODO add indicator of how many docs are missing this facet when this information is available
        // in the facets response
    }
    $(widget).addClass(class);    
    
    // remove the prior version of this facet, if any
    $("#" + id).parents(".facet_option").remove();
    parent.append(widget);
    $(widget).wrap('<div class="facet_option"></div>');
    $(widget).parent('div').prepend('<label class="facet-label" for="' + id + '">' + label + ':' + '</label>');
            
}

/**
 * format a date object
 * @param {} a_str
 * @return Date date object
 */
function format_date(a_str)
{
    var date;
    try {        
        var match = a_str.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/)        
        date = new Date();    
        date.setFullYear(match[1]);
        date.setMonth(match[2]-1);
        date.setDate(match[3]);        
    }
    catch(a_e){
            date = null;
    }
    return date;
}


/**
 * callback upon all facets received
 * re-enables submit button and clears loading messages
 */
function facets_done()
{    
    $(".submit_query").attr("disabled",false);
    $("#facets_loading").css("display","none");   
}

/**
 * callback upon all results received
 * re-enables submit button and clears loading messages
 */
function results_done()
{
    $("#query_loading").css("display","none");
    $(".submit_query").attr("disabled",false);
    if ($(".result").length > 0 )
    {        
        $(".submit_query").text(labels.update_query);
    }    
}

/**
 * validate facet selections
 * @return true if no errors otherwise false
 */
function validate_facets()
{
    var errors = 0;
    // remove the prior errors
    $(".error_msg").remove();
    $(".validate").each(
        function()
        {
            // start clean
            $(this).removeClass("invalid");
            $(this).removeClass("missing");            
            if ($(this).hasClass("required") && !($(this).val()))
            {
                $(this).addClass("missing");                
                errors++;
            }            
            if ($(this).val() && ! new RegExp($(this).attr("mask")).exec($(this).val()))
            {
                $(this).addClass("invalid");
                $(this).after('<span class="error_msg">The value must match ' +
                    $(this).attr("mask") + '</span>');
                errors++;
            }
        }
    );
    return errors > 0 ? false : true;
}

/**
 * write a result to the display
 * @param {} a_result
 */
function write_result(a_result)
{    
    var id = "text_" + a_result["textid"];
    var selected = false;
    var result = $('<div class="result" textid="' + id + '">'+
     '<label>' +
     '<input type="checkbox"/>' +
     '<span class="author">' + (a_result.author || '') + '</span>' +
     '<span class="title">' + (a_result.title || '') + '</span>' +       
     (a_result.date ? 
     '<span class="date">(' + a_result.date + ')</span>': '') +
     ( a_result.topics ? 
         '<span class="topics">['  + a_result.topics + ']</span>' : '') + 
     '</label>'+
     '</div>');
    // check to see if it's already selected
    if ($("#selected_texts .selection.selected[textid='" + id + "']").length == 1)
    {
        $("input:checkbox",result).attr("checked",true);
        $(result).addClass("selected");
    }

    $("#query_results").append(result);
    $("input:checkbox",result).click(
    function()
    {        
        var result = $(this).parents(".result");
        var id = $(result).attr('textid');   
        if ($(result).hasClass("selected"))
        
        {
            $("#selected_texts .selection[textid='" + id + "']").remove();            
            $(result).removeClass("selected");
        }
        else if (under_max())
        {            
            $(result).addClass("selected");            
            var selection = $("#selected_texts .selection[textid='" + id + "']");
            // if it's already in the selection box, just select it
            if (selection.length > 0)
            {
                $(selection).addClass('selected');   
                $("input:checkbox",selection).attr("checked",true);
            }
            // otherwise, add it
            else 
            {
                var cloned = $(result).clone(false);            
                $(cloned).removeClass('result');
                $(cloned).addClass('selection');
                $(".topics",cloned).remove();             
                $("input:checkbox",cloned).click(update_selection);                
                $("#selected_texts").append(cloned);
            }            
        }
        else 
        {
            alert(messages.max_selected);
        }
        // update the state of the submit analysis button
        if (visualize_ok())
        {        
            $(".submit_anal").attr("disabled",false);
        }
        else
        {
            $(".submit_anal").attr("disabled",true);
        }
        return true;
    }
    
  );
}

/**
 * test to see if  under the max text selections allowed
 * @returns true if under, otherwise false
 */
function under_max()
{
    var selected = $("#selected_texts .selected").length;
    return selected < MAX_FOR_VISUALIZATION;
    
}
/**
 * check to see if enough selections have been made for visualization  
 * @return {Boolean} 
 */
function visualize_ok()
{
    var selected = $("#selected_texts .selected").length;
    return selected >= MIN_FOR_VISUALIZATION;
}

/**
 * click handler whihc updates a text selection
 * @return {Boolean} true to allow event propagation
 */
function update_selection()
{
    var parent = $(this).parents(".selection");
    var id = $(parent).attr('textid');
    if ($(parent).hasClass("selected"))
    {             
        $(parent).removeClass("selected");
        var result = $("#query_results .result[textid='" + id + "']");
        // if this text is still in the result list, update its selection status
        if (result.length > 0)
        {
            result.removeClass("selected");
            $("input:checkbox",result).attr("checked",false);
        }
        
    }
    else if (under_max())
    {             
        $(parent).addClass("selected");
        // if this text is still in the result list, update its selection status
        var result = $("#query_results .result[textid='" + id + "']");
        if (result.length > 0)
        {
            result.addClass("selected");
            $("input:checkbox",result).attr("checked",true);
        }
                
    }
    else
    {
            alert(messages.max_selected);
    }
    // disable the visualization button if we don't have at least two texts selected
    if (visualize_ok())
    {        
        $(".submit_anal").attr("disabled",false);
    }
    else
    {
        $(".submit_anal").attr("disabled",true);
    }
    return true;
}

/**
 * make a list selection widget for a facet
 * @param String a_id the widget id 
 * @param String a_label the widget label
 * @param String a_result the facet details
 * @return the widget
 */
function make_select(a_id,a_label,a_result)
{
    if (a_result.value)
    {
        var widget =  '<select id="' + a_id + '">';
            a_result.value.forEach(
                function(a_value,a_i)
                {                
                    widget = widget + '<option value="' + a_value + '">' + a_value;
                    try {
                        // add the count if it's there
                        widget = widget + ' (' + a_result.count[a_i] + ')'; 
                
                    } catch(a_e) {}
                    widget = widget + '</option>';
                }            
            );
            widget = widget + '</select>';
        return $(widget);
    }   
}

/**
 * make a range widget
 * @param String a_id the widget id 
 * @param String a_label the widget label
 * @param String a_result the facet details
 * @return the widget
 */
function make_range_widget(a_id,a_label,a_result)
{
       // TODO it would be nice to show the values and counts on the slider display
       var widget = $(
            '<div class="slider_range"><input class="facet" type="text" id="' + a_id + '"/>' +
            '<div id="slider_' + a_id + '"/></div>');
       $("#slider_" + a_id,widget).slider(
        {
            range: true,
            min: a_result.min,
            max: a_result.max,
            values: a_result.value,
            slide: function( a_event, a_ui ) {                
                $( "#" + a_id ).val(  a_ui.values[ 0 ] + " - " + a_ui.values[ 1 ] );
                return true;
            }            
        });
        var min = a_result.value ? a_result.value[0] : a_result.min;
        var max = a_result.value ? a_result.value[a_result.value.length - 1] : a_result.max;
        $( "#" + a_id, widget ).val( min + " - " + max );                       
        return widget;
}