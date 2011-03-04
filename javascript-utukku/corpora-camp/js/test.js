function test_facets()
{

    /**
     * Test a query facet
     */
    write_facet(
        {
            "label": '_lucene',
            "type": 'query'              
        }
    );
    
    write_facet(
        {
            "label": 'author',
            "type": 'list',
            "values": [
                ['Homer',10], ['Vergil',20]
            ]            
        }

    );
    write_facet(
        {
            "label": 'title',
            "type": 'text',
            "mask": 'abcde'                        
        }

    );
    write_facet(
        {
            "label": 'startDate',
            "type": 'date',
            "values": [],
            "min": '1800-01-01',
            "max": '1900-12-01'
        }

    );
        write_facet(
        {
            "label": 'startYear',
            "type": 'date',
            "values": [ ['1800',10],['1900',200]],
            "min": '0000',
            "max": '2011'
        }

    );


    //write_facet(
    //    {
    //        "label": 'miscRange',
    //        "type": 'range',
    //        "values": [10,100],
    //        "min": '10',
    //        "max": '5000'
    //    }
    //);

}

function test_results()
{
    write_result( 
        {
           "text-id": "Perseus:text:1999.01.0135",
           "title": "The Odyssey",
           "author": "Homer",           
           "topics": [ "men gods war"]
        }   
   );
   write_result( 
        {
           "text-id": "Perseus:text:1999.01.0133",
           "title": "The Iliad",
           "author": "Homer",           
           "topics": [ "men gods war"]
        }   
   );

}