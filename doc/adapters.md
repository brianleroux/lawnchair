Adapters
========

Adapters expose a consistent interface to a persistent storage implementation. A `Lawnchair` build enqueues adapters and mixes in the first one valid for the current environment. This pattern is common in mobile scenarios, for example, a `Lawnchair` built with the DOM and Gears adapters will gracefully degrade through all available Android persistence solutions.

<div class="codehilite">
    <table>
        <tr>
            <td>blackberry-persistent-store</td>
            <td class="subdue">great for phonegap</td>
        </tr>
        <tr>
            <td>dom</td>
            <td class="subdue">localStorage (often called dom storage) **default adapter** </td>
        </tr>
        <tr>
            <td>window-name</td>
            <td class="subdue">oldest hack in the book **default fallback**</td>
        </tr>
        <tr>
            <td>gears-sqlite</td>
            <td class="subdue">for android &lt; 2.x</td>
        </tr>
        <tr>
            <td>ie-userdata</td>
            <td class="subdue">for older versions of ie</td>
        </tr>
        <tr>
            <td>webkit-sqlite</td>
            <td class="subdue">deprecated but still perhaps useful</td>
        </tr>
        <tr>
            <td>indexed-db</td>
            <td class="subdue">the new direction of HTML5 (say that 3 times fast)</td>
        </tr>
        <tr>
            <td>html5-filesystem</td>
            <td class="subdue">a persistent and sandboxed filesystem</td>
        </tr>
        <tr>
            <td>memory</td>
            <td class="subdue">in memory reference implementation</td>
        </tr>
    </table>
</div>

If you require an adapter thats not listed here it is trivial to implement your own. Adapters have the following interface:

    
    :::JavaScript
    // adapter name as a string
    adapter 
    
    // boolean; true if the adapter is valid for the current environment
    valid 
    
    // ctor call and callback. 'name' is the most common option 
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
    

The tests ensure adapters are consistent no matter what the underlying store is. If you are writing an adapter check out `./tests/lawnchair-spec.js`. The memory adaptor is probably the simplest implementation to learn from. Note, all `Lawnchair` methods accept a callback as a last parameter. This is deliberate, most modern clientside storages only have async style interfaces, for a good reason, your code won't block the main thread aiding in the perception of performance. That callback will be scoped to the `Lawnchair` instance. Make use of `fn` and `lambda` methods to allow for terse callbacks. 
