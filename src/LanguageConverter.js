( function( mw, $ ) {

'use strict';

function LanguageConverter() {

	this.monolingualCodes= null;
	this.contentCodes = null;
	this.ready = false;

}

LanguageConverter.prototype.init = function () {

	this.service = new mw.Api();
	const self = this;

	// Cache multilingual codes
	this.service
		.get( {
			action: "query",
			format: "json",
			meta: "wbcontentlanguages",
			formatversion: "2",
			wbclcontext: "monolingualtext"
		} )
		.then ( function ( results ) {
			if ( results && results.query && results.query.wbcontentlanguages  ) {
				self.monolingualCodes = results.query.wbcontentlanguages;
			}
		} );

	// Cache content language codes
	this.service
		.get( {
			action: "query",
			format: "json",
			meta: "wbcontentlanguages",
			formatversion: "2",
			wbclcontext: "term"
		} )
		.then ( function ( results ) {
			if ( results && results.query && results.query.wbcontentlanguages ) {
				self.contentCodes = results.query.wbcontentlanguages;
			}
		} );
};

// Get IETF language code root as fallback
const getCodeFallback = function ( code ) {
	code = code.split("-");
	code = code[0];
	return code;
};

// Common to getContentCode and getMonolingualCode
const getCode = function( value, cachedCodes ) {
	value = value.toLowerCase();
	let code = this.cachedCodes[ value ];

	if ( !code ) {
		code = getCodeFallback( value );
		code = this.cachedCodes[ code ];
		if ( !code ) {
			return 'en';
		}
	}
	code = code.code;
	return code;
};

// Get valid codes for multilingual text
LanguageConverter.prototype.getMonolingualCode = function( value ) {
	return getCode( value, this.monolingualCodes );
};

// Get valid codes for content languages i.e. labels and desc
LanguageConverter.prototype.getContentCode = function( value ) {
	return getCode( value, this.contentCodes );
};

LanguageConverter.prototype.getQID = function( value ) {
	// fallback
	return false;
};

mw.LanguageConverter = LanguageConverter;

}( mediaWiki, jQuery ) );

