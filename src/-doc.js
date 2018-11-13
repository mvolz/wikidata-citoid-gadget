/**
 Enable the script with the following code in your common.js

mw.loader.using(['wikibase'], function() {
	$.getScript( 'https://www.wikidata.org/w/index.php?title=User:Mvolz_(WMF)/CiteTool.js&action=raw&ctype=text/javascript', function() {
		var citeTool = new wb.CiteTool( 'https://www.wikidata.org/w/index.php?title=User:Mvolz_(WMF)/CiteProperties.json&action=raw&ctype=application/json' );
		citeTool.init();
	});
});
 */
