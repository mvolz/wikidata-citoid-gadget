( function( mw, $ ) {

'use strict';

function CitoidClient() {

}

CitoidClient.prototype.search = function( value ) {
    var baseUrl = 'https://en.wikipedia.org/api/rest_v1/data/citation',
        format = 'mediawiki-basefields',
        url = baseUrl + '/' + format + '/' + encodeURIComponent(value);

    return $.ajax( {
        method: 'GET',
        url: url
    } );
};

mw.CitoidClient = CitoidClient;

}( mediaWiki, jQuery ) );
