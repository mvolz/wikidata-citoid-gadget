( function( wb, dv, mw, $ ) {

'use strict';

function CiteToolReferenceEditor( config, windowManager, pendingDialog ) {
	this.config = config;
	this.windowManager = windowManager;
	this.pendingDialog = pendingDialog;

	this.citoidClient = new mw.CitoidClient();
	this.openRefineClient = new mw.OpenRefineClient();
	this.sparql = new wb.queryService.api.Sparql();
}

CiteToolReferenceEditor.prototype.addReferenceSnaksFromCitoidData = function( data, referenceView ) {

	var publicationTypes = [
		'Q5633421',
		'Q41298',
		'Q1110794',
		'Q35127',
		'Q32635',
		"Q838948",
		"Q5057302",
		"Q686822",
		"Q17928402",
		"Q571",
		"Q3331189",
		"Q1980247",
		"Q2334719",
		"Q5057302",
		"Q23927052",
		"Q4423781",
		"Q49848",
		"Q9158",
		"Q17329259",
		"Q11424",
		"Q7216866",
		"Q545861",
		"Q30070565",
		"Q178651",
		"Q191067",
		"Q133492",
		"Q191067",
		"Q87167",
		"Q4006",
		"Q191067",
		"Q253623",
		"Q5057302",
		"Q604733",
		"Q1555508",
		"Q10870555",
		"Q820655",
		"Q1266946",
		"Q21191270",
		"Q30070675",
		"Q36774"
	];

	var statedIn = "P248";

	var refView = $( referenceView ).data( 'referenceview' ),
		lv = this.getReferenceSnakListView( refView ),
		// usedProperties = refView.value().getSnaks().getPropertyOrder(),
		self = this;

	var addedSnakItem = false;
	var snakPromises = [];

	// Try to add "stated in" statement by search via doi
	var doiProm = self.openRefineClient.search( data.DOI ).then( function ( results ) {
		if ( results.result[0] ) {
			lv.addItem(
				self.getWikibaseItemSnak( statedIn, results.result[0].id )
			);
			addedSnakItem = true;
		}
	});

	snakPromises.push(doiProm);

	$.each( data, function( key, val ) {
		var propertyId = self.getPropertyForCitoidData( key );

		// Some default values for an openRefine query
		var query = {
			query : val,
			limit : 1,
			type : null,
			type_strict : "any"
		};

		// Method used for adding item snaks with OpenRefine
		function addItemSnak( q ) {
			return self.openRefineClient.search( q ).then( function ( results ) {
				if ( results.result[0] ) {
					lv.addItem(
						self.getWikibaseItemSnak( propertyId, results.result[0].id )
					);
					addedSnakItem = true;
				}
			});
		}

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
					self.getTitleLanguage( val, data )
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
				query.type = ['Q1288568', 'Q33742', 'Q951873', 'Q33384', 'Q34770', 'Q1002697']; // Modern language, natural language, language, ethnolect, dialect
				snakPromises.push( addItemSnak( query ) );
				break;
			case 'publicationTitle':
				//query.type = null; // Too many to enumerate fully, do by score instead?
				query.type = publicationTypes;
				snakPromises.push( addItemSnak( query ) );
				break;
			case 'publisher':
				query.type = ['Q2085381', 'Q479716', 'Q1114515', 'Q149985', 'Q748822', 'Q18127', 'Q2024496', 'Q327333'];
				snakPromises.push( addItemSnak( query ) );
				break;
			// String properties
			case 'ISSN':
			case 'ISBN':
			case 'PMID':
			case 'url':
			case 'pages':
			case 'issue':
			case 'volume':
			case 'numPages':
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
					for (var i = 0; i < val.length; i++) {
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

		$.when( snakPromises ).done( function() {
			lv.startEditing().then( function() {
				self.pendingDialog.popPending();
				self.windowManager.closeWindow( self.pendingDialog );
			});
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

CiteToolReferenceEditor.prototype.getTitleLanguage = function( title, data ) {
	var languageCode = mw.config.get( 'wgUserLanguage' );

	if ( data.language ) {
		if ( data.language === 'en-US' ) {
			languageCode = 'en';
		}
	}

	return languageCode;
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
