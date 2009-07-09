Lawnchair
=========
JSON key / value storage.
---

A very lightweight key / value store wherein the key is a simple string and the value is expected to be a JSON object. 

Features
--------
- micro tiny storage without the nasty SQL: pure and delicious JSON
- clean and simple oo design with one db table per store
- key/value store.. except you don't even have to care about the keys if you don't want to
- happily and handily will treat your store as an array of objects
- built on SQLite CRUD
- searching and therefore finding of objects
- conforms to the jetpack spec and adds some love based on pragmatic usage. 


Example usage
-------------

var store = new Lawnchair({table:'test'});


store.find(
	function(o){
		return o.name == 'foo'
	},
	function(o) {
		return o.captilalize();
	}
);

TODO
====
