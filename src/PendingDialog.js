( function( mw, $ ) {

'use strict';

function PendingDialog( config ) {
	PendingDialog.super.call( this, config );
}
OO.inheritClass( PendingDialog, OO.ui.ProcessDialog );

// Specify a name for .addWindows()
PendingDialog.static.name = 'PendingDialog';
// Specify a title statically (or, alternatively, with data passed to the opening() method).
PendingDialog.static.title = 'Generating Citation';

PendingDialog.static.actions = [
	{ action: 'waiting', modes: 'edit', label: 'Searching' },
	{ action: 'error', modes: 'edit', label: 'Error' }
];

// Customize the initialize() function: This is where to add content to the dialog body and set up event handlers.
PendingDialog.prototype.initialize = function () {
	// Call the parent method
	PendingDialog.super.prototype.initialize.apply( this, arguments );
	// Create and append a layout and some content.

	this.panel1 = new OO.ui.PanelLayout( { padded: true, expanded: false } );
	this.panel1.$element.append( '<p>Generating a reference for you.... please wait...</p>' );
	this.panel2 = new OO.ui.PanelLayout( { padded: true, expanded: false } );
	this.panel2.$element.append( '<p>Unable to generate reference from this input. Press escape to exit.</p>' );

	this.stackLayout= new OO.ui.StackLayout( {
	items: [ this.panel1, this.panel2 ]
	} );

	this.stackLayout.setItem( this.panel1 );
	this.$body.append( this.stackLayout.$element );

};

PendingDialog.prototype.getSetupProcess = function ( data ) {
	return PendingDialog.super.prototype.getSetupProcess.call( this, data )
	.next( function () {
	this.actions.setMode( 'waiting' );
	}, this );
};


// Specify processes to handle the actions.
PendingDialog.prototype.getActionProcess = function ( action ) {
	if ( action === 'waiting' ) {
	//this.pushPending();
	// Set the mode to help.
	this.actions.setMode( 'waiting' );
	// Show the help panel.
	this.stackLayout.setItem( this.panel1 );
	}
	if ( action === 'error' ) {
	//this.popPending();
	// Set the mode to help.
	this.actions.setMode( 'error' );
	// Show the help panel.
	this.stackLayout.setItem( this.panel2 );
	}
	// Fallback to parent handler
	return PendingDialog.super.prototype.getActionProcess.call( this, action );
};


// Override the getBodyHeight() method to specify a custom height (or don't to use the automatically generated height)
PendingDialog.prototype.getBodyHeight = function () {
	return this.panel1.$element.outerHeight( true );
};

mw.PendingDialog = PendingDialog;

}( mediaWiki, jQuery ) );
