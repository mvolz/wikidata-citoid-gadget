( function( wb, dv, mw, $ ) {

'use strict';

function CiteToolReferenceEditor( config, windowManager, pendingDialog ) {
	this.config = config;
	this.windowManager = windowManager;
	this.pendingDialog = pendingDialog;

	this.citoidClient = new mw.CitoidClient();
	this.sparql = new wb.queryService.api.Sparql();
	this.lc = new mw.LanguageConverter();
}

CiteToolReferenceEditor.prototype.addReferenceSnaksFromCitoidData = function( data, referenceView ) {

	var refView = $( referenceView ).data( 'referenceview' ),
		lv = this.getReferenceSnakListView( refView ),
		// usedProperties = refView.value().getSnaks().getPropertyOrder(),
		self = this;

	var addedSnakItem = false;

	$.each( data, function( key, val ) {
		var propertyId = self.getPropertyForCitoidData( key );


		// var properties = [
		// 	{ p : self.getPropertyForCitoidData("DOI"), v : data.DOI }
		//	];

		// var properties = [
		// 	{ p : self.getPropertyForCitoidData("ISSN"), v : data.ISSN }
		//	];

		if ( !propertyId ) {
			console.log( "PropertyID missing for key: " + key );
			return;
		}

		// Allow duplicate properties; i.e. multiple authors
		// TODO: Exclude identical snaks with same property and value
		// if ( propertyId !== null && usedProperties.indexOf( propertyId ) !== -1 ) {
		// 	return;
		// }

		switch ( key ) {
			// Monolingual properties
			case 'title':
				lv.addItem( self.getMonolingualValueSnak(
					propertyId,
					val,
					self.getTitleLanguage( data )
				) );
				addedSnakItem = true;

				break;
			// Date properties
			case 'date':
			case 'accessDate':
				try {
					lv.addItem(
						self.getDateSnak( propertyId, val )
					);

					addedSnakItem = true;
				} catch ( e ) {
					console.log( e );
				}

				break;
			// Item properties
			case 'language':
				break;
			case 'publicationTitle':
				lv.addItem( self.getMonolingualValueSnak(
					propertyId,
					val,
					self.getTitleLanguage( data )
				) );
				addedSnakItem = true;
				break;
			case 'publisher':
				break;
			// number properties
			case 'numPages':
				break;
			// String properties
			case 'author':
			case 'contributor':
			case 'editor':
			case 'translator':
			case 'seriesEditor':
			case 'interviewee':
			case 'interviewer':
			case 'director':
			case 'scriptwriter':
			case 'producer':
			case 'castMember':
			case 'sponsor':
			case 'counsel':
			case 'inventor':
			case 'attorneyAgent':
			case 'recipient':
			case 'performer':
			case 'composer':
			case 'wordsBy':
			case 'cartographer':
			case 'programmer':
			case 'artist':
			case 'commenter':
			case 'presenter':
			case 'guest':
			case 'podcaster':
			case 'reviewedAuthor':
			case 'cosponsor':
			case 'bookAuthor':
				for (var i = 0; i < val.length; i++) {
					try {
						lv.addItem(
							self.getStringSnak( propertyId, val[i][0] + " " + val[i][1] )
						);
						addedSnakItem = true;
					}
					catch( e ) {
						console.log(e);
					}
				}
				break;
			case 'ISSN':
			case 'ISBN':
			case 'PMID':
			case 'url':
			case 'pages':
			case 'issue':
			case 'volume':
			case 'PMCID':
			case 'DOI':
				var str = false;
				if (typeof val === 'string') {
					str = true;
					try {
						lv.addItem(
							self.getStringSnak( propertyId, val )
						);
						addedSnakItem = true;
					}
					catch( e ) {
						console.log(e);
					}
				// For array of identifiers, add every one
				} else if ( Array.isArray( val ) ) {
					for (i = 0; i < val.length; i++) {
						try {
							lv.addItem(
								self.getStringSnak( propertyId, val[i] )
							);
							addedSnakItem = true;
						}
						catch( e ) {
							console.log(e);
						}
					}
				}

				// Below currently does not work
				//var queryProperty = self.getQueryPropertyForCitoidData( key );

				// Very hacky - should try every id in Array instead of just first one
				//if (!str) {
				//	val = val[0];
				//}
				// self.lookupItemByIdentifier( queryProperty, val )
				// 	.done( function( itemId ) {
				// 		console.log( itemId );
				// 		console.log( propertyId );
				// 		try {
				// 			if (itemId && propertyId) {
				// 				lv.addItem(
				// 					self.getWikibaseItemSnak( propertyId, itemId )
				// 				);
				// 				addedSnakItem = true;
				// 			}
				// 		} catch( e ) {}
				// 	} );

				break;
			default:
				break;
		}
	} );

	if ( addedSnakItem === true ) {

		lv.startEditing().then( function() {
			self.pendingDialog.popPending();
			self.windowManager.closeWindow( self.pendingDialog );
		});

	}
};

CiteToolReferenceEditor.prototype.getReferenceSnakListView = function( refView ) {
	var refListView = refView.$listview.data( 'listview' ),
		snakListView = refListView.items(),
		snakListViewData = snakListView.data( 'snaklistview' ),
		listView = snakListViewData.$listview.data( 'listview' );

	return listView;
};

CiteToolReferenceEditor.prototype.getPropertyForCitoidData = function( key ) {
	if ( this.config.zoteroProperties[key] ) {
		return this.config.zoteroProperties[key];
	}

	return null;
};

CiteToolReferenceEditor.prototype.getQueryPropertyForCitoidData = function( key ) {
	if ( this.config.queryProperties[key] ) {
		return this.config.queryProperties[key];
	}

	return null;
};

CiteToolReferenceEditor.prototype.getTitleLanguage = function( data ) {

	return this.lc.getMonolingualCode(data.language);
};

CiteToolReferenceEditor.prototype.getMonolingualValueSnak = function( propertyId, title, languageCode ) {
	return new wb.datamodel.PropertyValueSnak(
		propertyId,
		new dv.MonolingualTextValue( languageCode, title )
	);
};

CiteToolReferenceEditor.prototype.getStringSnak = function( propertyId, val) {
	return new wb.datamodel.PropertyValueSnak(
		propertyId,
		new dv.StringValue( val )
	);
};

CiteToolReferenceEditor.prototype.getNumSnak = function( propertyId, val) {
	return new wb.datamodel.NumberValueSnak(
		propertyId,
		new dv.StringValue( val )
	);
};

CiteToolReferenceEditor.prototype.getDateSnak = function( propertyId, dateString ) {
	var timestamp = dateString + 'T00:00:00Z';

	return new wb.datamodel.PropertyValueSnak(
		propertyId,
		new dv.TimeValue( timestamp )
	);
};

CiteToolReferenceEditor.prototype.getWikibaseItemSnak = function( propertyId, itemId ) {
	return new wb.datamodel.PropertyValueSnak(
		propertyId,
		new wb.datamodel.EntityId( itemId )
	);
};

CiteToolReferenceEditor.prototype.lookupItemByIdentifier = function( propertyId, value ) {
	var query = "SELECT ?identifier ?entity "
		+ "WHERE {  ?entity wdt:" + propertyId + " ?identifier . "
		+ "FILTER ( ?identifier in ('" + value + "') ) "
		+ "}";

	var dfd = $.Deferred(),
		baseUrl = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';

	$.ajax( {
		method: 'GET',
		url: baseUrl,
		data: {
			query: query,
			format: 'json'
		}
	} )
	.done( function( data ) {
		var uriPattern = /^http:\/\/www.wikidata.org\/entity\/([PQ]\d+)$/;

		if ( data.results.bindings.length > 0 ) {
			var result = data.results.bindings[0],
				uri = result.entity.value,
				matches = uri.match(uriPattern);

			dfd.resolve( matches[1] );
		} else {
			dfd.resolve( false );
		}
	} );

	return dfd.promise();
};

wb.CiteToolReferenceEditor = CiteToolReferenceEditor;

}( wikibase, dataValues, mediaWiki, jQuery ) );
