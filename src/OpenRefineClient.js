( function( mw, $ ) {

'use strict';

function OpenRefineClient() {

}

OpenRefineClient.prototype.search = function( query ) {
    var url = 'https://tools.wmflabs.org/openrefine-wikidata/en/api';
    return $.ajax( {
        method: 'GET',
        url: url,
        crossDomain: true,
        data: {
        	query: JSON.stringify(query)
        }
    } );
};

mw.OpenRefineClient = OpenRefineClient;

}( mediaWiki, jQuery ) );
