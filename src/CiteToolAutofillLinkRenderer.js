( function( wb, dv, mw, $ ) {

'use strict';

function CiteToolAutofillLinkRenderer( config, citoidClient, citeToolReferenceEditor, windowManager, pendingDialog ) {
	this.config = config;
	this.citoidClient = citoidClient;
	this.citeToolReferenceEditor = citeToolReferenceEditor;
	this.windowManager = windowManager;
	this.pendingDialog = pendingDialog;
}

CiteToolAutofillLinkRenderer.prototype.renderLink = function( referenceView ) {
	var self = this;

	var options = {
		templateParams: [
			'wikibase-citetool-autofill wikibase-referenceview-autofill', // CSS class names
			'#', // URL
			'autofill', // Label
			'' // Title tooltip
		],
		cssClassSuffix: 'autofill'
	};

	var $span = $( '<span/>' )
		.toolbarbutton( options )
		.on( 'click', function( e ) {
			e.preventDefault();
			self.onAutofillClick( e.target );
		} );

	this.getReferenceToolbarContainer( referenceView ).append( $span );
};

CiteToolAutofillLinkRenderer.prototype.disableLink = function( target ){
	var buttons = $( target ).find( '.wikibase-citetool-autofill' );
	var button;

	if ( buttons.length > 0 ){
		button = buttons[0];
		button.toolbarbutton.disable();
	}
};

CiteToolAutofillLinkRenderer.prototype.enableLink = function( target ){
	var buttons = $( target ).find( '.wikibase-citetool-autofill' );
	var button;

	if ( buttons.length > 0 ){
		button = buttons[0];
		button.toolbarbutton.enable();
	}
};

CiteToolAutofillLinkRenderer.prototype.getReferenceFromView = function( referenceView ) {
	// not a reference view change
	if ( referenceView === undefined ) {
		return null;
	}

	var refView = $( referenceView ).data( 'referenceview' );

	return refView.value();
};

CiteToolAutofillLinkRenderer.prototype.getLookupSnakProperty = function( reference ) {
	var snaks = reference.getSnaks(),
		lookupProperties = this.getLookupProperties(),
		lookupProperty = null;

	snaks.each( function( k, snak ) {
		var propertyId = snak.getPropertyId();

		if ( lookupProperties.indexOf( propertyId ) !== -1 ) {
			if ( lookupProperty === null ) {
				lookupProperty = propertyId;
			}
		}
	} );

	return lookupProperty;
};

CiteToolAutofillLinkRenderer.prototype.getLookupProperties = function() {
	var properties = [];

	if ( this.config.properties ) {
		properties = Object.keys( this.config.properties );
	}

	return properties;
};

CiteToolAutofillLinkRenderer.prototype.getReferenceToolbarContainer = function( referenceView ) {
	var $heading = $( referenceView ).find( '.wikibase-referenceview-heading' ),
		$toolbar = $heading.find( '.wikibase-toolbar-container' );

	return $toolbar;
};

CiteToolAutofillLinkRenderer.prototype.onAutofillClick = function( target ) {
	var referenceView = $( target ).closest( '.wikibase-referenceview' ),
		reference = this.getReferenceFromView( referenceView ),
		self = this;

	if ( reference === null ) {
		return;
	}

	var value = this.getLookupSnakValue( reference );

	self.windowManager.openWindow( self.pendingDialog );
	self.pendingDialog.pushPending();
	self.pendingDialog.getActionProcess.call( self.pendingDialog, 'waiting' );

	this.citoidClient.search( value )
		.then( 
			//success
			function( data ) {
				if ( data[0] ) {
					self.citeToolReferenceEditor.addReferenceSnaksFromCitoidData(
						data[0],
						referenceView
					);
				}
			},
			//failure
			function() {
				self.pendingDialog.popPending();
				self.pendingDialog.getActionProcess.call( self.pendingDialog, 'error' );
			}

		);
};

CiteToolAutofillLinkRenderer.prototype.getLookupSnakValue = function( reference ) {
	var value = null,
		lookupProperties = this.getLookupProperties();

	reference.getSnaks().each( function( k, snak ) {
		var propertyId = snak.getPropertyId();

		if ( lookupProperties.indexOf( propertyId ) !== -1 ) {
			value = snak.getValue().getValue();
		}
	} );

	return value;
};

wb.CiteToolAutofillLinkRenderer = CiteToolAutofillLinkRenderer;

}( wikibase, dataValues, mediaWiki, jQuery ) );
