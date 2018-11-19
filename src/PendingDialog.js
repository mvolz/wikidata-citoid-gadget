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

// Customize the initialize() function: This is where to add content to the dialog body and set up event handlers.
PendingDialog.prototype.initialize = function () {
  // Call the parent method
  PendingDialog.super.prototype.initialize.apply( this, arguments );
  // Create and append a layout and some content.
  this.content = new OO.ui.PanelLayout( { 
    padded: true,
    expanded: false 
  } );
  this.content.$element.append( '<p>Generating a reference for you.... please wait...</p>' );
  this.$body.append( this.content.$element );
};

// Specify processes to handle the actions.
PendingDialog.prototype.getActionProcess = function ( action ) {
  if ( action === 'open' ) {
    // Create a new process to handle the action
    return new OO.ui.Process( function () {
      setTimeout(function(){ }, 3000); // SOOOO HACKY 
    }, this );
  }
  // Fallback to parent handler
  return PendingDialog.super.prototype.getActionProcess.call( this, action );
};


// Override the getBodyHeight() method to specify a custom height (or don't to use the automatically generated height)
PendingDialog.prototype.getBodyHeight = function () {
  return this.content.$element.outerHeight( true );
};

mw.PendingDialog = PendingDialog;

}( mediaWiki, jQuery ) );
