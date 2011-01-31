<pre>
	.____                                 .__            .__         
	|    |   _____  __  _  ______   ____  |  |__ _____   |__|_______ 
	|    |   \__  \ \ \/ \/ /    \_/ ___\ |  |  \\__  \  |  |\_  __ \
	|    |___ / __ \_\     /   |  \  \___ |   Y  \/ __ \_|  | |  | \/
	|_______ (____  / \/\_/|___|  /\___  >|___|  (____  /|__| |__|   
	        \/    \/            \/client\/ json\/store\/ 
</pre>

---

Get Started
===

Lawnchair is an adaptive clientside json document store. Perfect for persistence in offline mobile and html5 web apps. Learn how to use Lawnchair at lawnchairjs.com 

Usage
---

Here is a quick example usage of a Lawnchair with the aggregation plugin.

    new Lawnchair({name:'people', record:'person'}, function() {

        var People = this

        People.count('console.log(count)')

        People.save({name:'brian'}, 'console.log(person)')

    })

Key concepts
---

- adaptive persistence
- pluggable collection behavior

Adaptors
---

Adaptors expose a consitent interface to a persistent storage implementation. A Lawnchair build enqueues adaptors and mixes in the first one valid for the current environment. This pattern is common in mobile scenarios, for example, a Lawnchair build with the DOM and Gears adaptors will gracefully degrade through all available Android persistence solutions.

    air-sqlite ...................... adaptor for adobe air sqlite 
    blackberry-persistent-storage ... phonegap/blackberry only
    cookie .......................... lifted from ppk
    couch ........................... example of working with couchdb
    dom ............................. default and most pervasive; localStorage with fallback to window.top.name
    gears-sqlite .................... google gears sqlite; useful for older androids and blackberries
    ie-userdata ..................... for everyones favorite browser
    jsp-session ..................... example of working with a jsp session for storage challenged browsrs
    webkit-sqlite ................... the original adaptor; slower than dom and sqlite deprecated in favor in indexedb so..

If you require an adaptor thats not listed here it is trivial to implement your own. Adaptors must have the following interface:

    adaptor ........................ adaptor name 
    valid .......................... true if the adaptor is valid for the current environment
    init ([options], callback) ..... ctor call and callback. 'name' is the most common option (to name the collection) 
    save (obj, callback) ........... save an object
    batch(array, callback) ......... batch save an array of objects
    get (key|array, callback) ...... retrieve an object (or array of objects) and apply callback to each 
    exists (key, callback) ......... check if a document exists
    all (callback) ................. returns all the objects to the callback as an array
    remove (key|array, callback) ... remove a document
    nuke (callback) ................ destroy all documents

All Lawnchair methods accept a c...allback as a last parameter. That callback will be scoped to the lawnchair instance. 

Plugins
---

Lawnchair deals in collections of json documents. Plugins augment lawnchair collections with particular behaviors.

    aggregation ... utilities for dealing with aggregate data; kinda happens with collecdtions
    callbacks ..... event hooks fired before/after any adaptor method call
    encryption .... encypt local data (just don't keep the key on the client, eh).
    iteration ..... default plugin mixes in find and each methods
    pagination .... page collection data
    query ......... query collection data with json-query
    timestamp ..... adds modified and created fields to every collection record
    validation .... validate collection data with json schema

Source Layout
---

<pre>
    /
    |-examples ......... server/service integration examples
    |-lib .............. generated builds
    |-src
    | |-adaptors ....... persistence adaptors
    | |-plugins ........ additional functionality for typical persistence solutions
    | '-lawnchair.js ... base implementation
    |-tests 
    |-util ............. extra files for building
    |-LICENSE .......... the mit license
    |-makefile ......... builds releases
    '-README.md ........ you be reading it!

</pre>

Notes
---

- Adobe AIR adaptor example xml config files can be found in `./util`.
- CouchDB adaptor requires the http://localhost:5984/_utils/script/couch.js lib.
- jsp server adaptor works with /examples/session.jsp 


[As always, visit the website for more details](http://brianleroux.github.com/lawnchair)

