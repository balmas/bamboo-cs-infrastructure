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
 * Get Query String parameters
 * @param {} name
 * @return {String}
 */
function get_parameters_by_name( a_name )
{
  var values  = [];  
  a_name = a_name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+a_name+"=([^&#]*)";
  var regex = new RegExp( regexS, "mg");
  while (results = regex.exec( window.location.href ))
  {
    results.forEach(
        function(a_result,a_i)
        {
            if (a_i > 0)
            {
                values.push(decodeURIComponent(a_result.replace(/\+/g, " ")));
            }
        }
    );
  }
 
  return values;
}
