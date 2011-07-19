application programming interface
===

The `Lawnchair` api (or _application programming interface_):

    
    :::JavaScript
    // returns all the keys in the store
    keys (callback)     
    
    // save an object
    save (obj, callback) 
    
    // batch save array of objs
    batch(array, callback)
    
    // retrieve obj (or array of objs) and apply callback to each
    get (key|array, callback) 
    
    // check if exists in the collection passing boolean to callback
    exists (key, callback)
    
    // iterate collection passing: obj, index to callback
    each(callback)
    
    // returns all the objs to the callback as an array
    all (callback)
    
    // remove a doc or collection of em
    remove (key|array, callback)
    
    // destroy everything
    nuke (callback)
    

