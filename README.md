<pre>
	.____                                 .__            .__         
	|    |   _____  __  _  ______   ____  |  |__ _____   |__|_______ 
	|    |   \__  \ \ \/ \/ /    \_/ ___\ |  |  \\__  \  |  |\_  __ \
	|    |___ / __ \_\     /   |  \  \___ |   Y  \/ __ \_|  | |  | \/
	|_______ (____  / \/\_/|___|  /\___  >|___|  (____  /|__| |__|   
	        \/    \/ Lawnchair! \/     \/      \/     \/             
</pre>

---
A very light clientside JSON document store. 

	adaptor ......... device browsers supported ............ desktop browsers supported ....
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	webkitsqlite .... iPhone OS, Android 2.0, Palm webOS ... Safari, Chrome ................
	gearssqlite ..... Android 1.5, 1.7 ..................... Whenever gears is present .....
	domStorage ...... iPhone OS, Android 2.0, Palm webOS ... IE, Firefox, Safari, Chrome ...
	cookie .......... Presumably all of em ................. Presumably all of em ..........
    userdata ........ IE ................................... IE ............................
    air-async ....... Adobe Air ............................ Adobe Air .....................
    air ............. Adobe Air ............................ Adobe Air .....................
    blackberry ...... BlackBerry 4.7 and higher ............ N/A ...........................
    couchdb ......... All .................................. All ........................... 

INSTALL
===

Lawnchair does not assume how you want to use it. At a minimum will be required to include:

- Lawnchair.js
- LawnchairAdaptorHlpers.js

*extras*

- One of the adaptor js files can found in `./src/adaptors`.
- Adobe AIR adaptor example xml config files can be found in `./util`.
- CouchDB adaptor requires the http://localhost:5984/_utils/script/couch.js lib.

Its probably a good idea to concat/minify the js you require. Its a common request to 
provide a single file that does some sort of feature detection which, in theory, is nice 
but in practice its far more efficient to only load what you need (especially on mobile).

TESTING
===

Open `./spec/public/adaptors` and select an adaptor spec to run the tests in a browser. If 
you have Ruby and Sinatra installed you can kick up a little server to run tests. These same 
tests also happen to be deployed at http://lawnchair.heroku.com (useful for testing on devices).

COMING SOON
====
- capacity tests
- performance tests
- pagination
- encryption
- rename adaptors
- rename to helpers
- add helpers.extend

[Visit the website for more details](http://brianleroux.github.com/lawnchair)
---

