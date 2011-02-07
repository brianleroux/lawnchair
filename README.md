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

- collections contains objects; or.. a lawnchair instance is really just an array of objects
- adaptive persistence. the underlying store is abstracted behind a consistent interface
- pluggable collection behavior. sometimes we need collection helpers but not always

Adapters
---

Adapters expose a consistent interface to a persistent storage implementation. A Lawnchair build enqueues adapters and mixes in the first one valid for the current environment. This pattern is common in mobile scenarios, for example, a Lawnchair build with the DOM and Gears adapters will gracefully degrade through all available Android persistence solutions.

    air-sqlite ...................... adobe air sqlite 
    blackberry-persistent-storage ... phonegap/blackberry only
    cookie .......................... lifted from ppk; kinda useless but a nifty idea
    couch ........................... example of working with couchdb
    dom ............................. default and most pervasive
    gears-sqlite .................... google gears sqlite; useful for older androids and blackberries
    ie-userdata ..................... for everyones favorite browser
    jsp-session ..................... example of working with a jsp session for storage challenged browsrs
    webkit-sqlite ................... the original adapter; slower than dom and sqlite deprecated in favor in indexedb so..
    window-name ..................... utilizes the window.name hack; also in the default lawnchair.js build as a fallback

If you require an adapter thats not listed here it is trivial to implement your own. Adapters must have the following interface:

    adapter ........................ adapter name 
    valid .......................... true if the adapter is valid for the current environment
    init ([options], callback) ..... ctor call and callback. 'name' is the most common option (to name the collection) 
    keys (callback) ................ returns all the keys in the store
    save (obj, callback) ........... save an object
    batch(array, callback) ......... batch save an array of objects
    get (key|array, callback) ...... retrieve an object (or array of objects) and apply callback to each 
    exists (key, callback) ......... check if a document exists
    all (callback) ................. returns all the objects to the callback as an array
    remove (key|array, callback) ... remove a document or collection of documents
    nuke (callback) ................ destroy all documents

The tests ensure adapters are consistent. 

All Lawnchair methods accept a callback as a last parameter. This is deliberate; your code won't block the main thread aiding in the perception of performance. That callback will be scoped to the lawnchair instance. 

Plugins
---

Lawnchair deals in collections of json documents. Plugins augment lawnchair collections with particular behaviors.

    aggregation ... utilities for dealing with aggregate data; kinda happens with collecdtions
    callbacks ..... event hooks fired before/after any adapter method call
    pagination .... page collection data
    query ......... query collection data with json-query

If you'd like to create a plugin there are some great ideas listed below!

Source Layout
---

<pre>
    /
    |-examples ......... server/service integration examples
    |-lib .............. generated builds
    |-src
    | |-adapters ....... persistence adapters
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

- Adobe AIR adapter example xml config files can be found in `./util`.
- CouchDB adapter requires `http://localhost:5984/_utils/script/couch.js` lib
- jsp server adapter works with /examples/session.jsp 

Roadmap
---

- linter in makefile
- versioning in makefile
- ability to name adapter as a cache (for in memory ops or to fallback to server store)
- in memory adapter
- decorator plugin for augmenting normal objects with persistence 

Plugin Ideas for Contributers
---

    money ........ js is notoriously uncool w/ money types; this could useful
    logging ...... keep a log of all operations
    versioning ... another form paranioa
    text-seach ... full text search 
    timestamp .... adds modified and created fields to every collection record
    validation ... validate collection data with json schema
    encryption ... encypt local data (just don't keep the key on the client, eh).
    iteration .... extended iterator methods

[As always, visit the website for more details](http://brianleroux.github.com/lawnchair)

