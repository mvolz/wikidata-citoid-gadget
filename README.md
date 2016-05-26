Wikidata Reference Tool
========================

Tool for making it easier to add references on Wikidata, with help of the Citoid service.

## Install

The tool works currently as a user script on-wiki.  To enable the script, add something like the following to your user's common.js page (e.g. "User:ExampleUser/common.js") on the wiki:

```
mw.loader.using(['wikibase', 'oojs-ui'], function() {
	mw.loader.load( 'https://rawgit.com/filbertkm/wikidata-refs/master/refs.js' );

	window.setTimeout(function() {
		wb.ReferenceDialogLoader.init( 'https://www.wikidata.org/w/index.php?title=User:Aude/refs-template.json&action=raw&ctype=text/javascript' );
	}, 300 );
})
```
