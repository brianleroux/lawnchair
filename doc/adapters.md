Adapters
========

Adapters expose a consistent interface to a persistent storage implementation. A Lawnchair build enqueues adapters and mixes in the first one valid for the current environment. This pattern is common in mobile scenarios, for example, a Lawnchair build with the DOM and Gears adapters will gracefully degrade through all available Android persistence solutions.

	blackberry-persistent-store ... great for phonegap
	dom ........................... default adapter
	gears-sqlite .................. for androids < 2.x
	ie-userdata ................... for msft js engines
	memory ........................ in memory reference implemenation
	webkit-sqlite ................. great for webkits
	window-name ................... default fallback; oldest hack in the book
    indexed-db .................... omg paul irish wrote this!

If you require an adapter thats not listed here it is trivial to implement your own. Adapters have the following interface:

    // adapter name as a string
    adapter 
    
    // boolean; true if the adapter is valid for the current environment
    valid 
    
    // ctor call and callback. 'name' is the most common option (to name the collection)
    init ([options], callback)

    // returns all the keys in the store
    keys (callback)     
    
    // save an object
    save (obj, callback) 
    
    // batch save array of objs
    batch(array, callback)
    
    // retrieve obj (or array of objs) and apply callback to each
    get (key|array, callback) 
    
    // check if an obj exists in the collection
    exists (key, callback)
    
    // returns all the objs to the callback as an array
    all (callback)
    
    // remove a doc or collection of em
    remove (key|array, callback)
    
    // destroy everything
    nuke (callback)

The tests ensure adapters are consistent no matter what the underlying store is. If you are writing an adapter check out `./tests/lawnchair-spec.js`. The memory adaptor is probably the simplest implementation to learn from. Note, all Lawnchair methods accept a callback as a last parameter. This is deliberate, most modern clientside storages only have async style interfaces, for a good reason, your code won't block the main thread aiding in the perception of performance. That callback will be scoped to the lawnchair instance. Make use of `fn` and `lambda` methods to allow for terse callbacks. 
