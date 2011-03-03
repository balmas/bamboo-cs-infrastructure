var NS_COLLECTIONS = 'http://www.example.com/corpora-camp/ns/collections';

/**
 * Open a connection to the switchboard
 * @param String a_url
 */
function connect(a_url) {
      Utukku.Client.Connection.url = a_url;
      /* open a connection so we can settle */
      Utukku.Client.Connection({ });    
}

/**
 * get the facets available for the search
 * @param {} a_spec
 */
function get_facets(a_spec){    
      Utukku.Client.Function({
        namespace: NS_COLLECTIONS,
        name: "facets",
        args: a_spec,
        next: write_facet,
        done: facets_done
      });    
}

/**
 * write a facet to the display
 * @param {} a_result
 */
function write_facet(a_result)
{
    var parent = $("#search_facets");
    var widget;
    
    // handle query  type separately
    if (a_result.type='query'){
        parent = $("#search_query" + a_result.label );
        widget = $('<label>Direct Query: <input type="textbox" id="query' + a_result.label + '"/>');
    } 
    else if (a_result.type == 'text')
    {
        widget = $('<label>' + a_result.label + ':' + '<input type="textbox" id="facet_' + a_result.label + '"/>');
                        
    }
    else if (a_result.type='list')
    {
        
    }
    else if (a_result.type='range')
    {
        
    }
    parent.add(
    );
}

function validate_facet_entry(a_mask)
{
    
}

/**
 * callback for all facets received
 */
function facets_done()
{
    
}

