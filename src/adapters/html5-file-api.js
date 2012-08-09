Lawnchair.adapter('html5-file-api', (function(){

    return {
        // boolean; true if the adapter is valid for the current environment
        valid: function() {},

        // constructor call and callback. 'name' is the most common option
        init: function(options, callback) {},

        // returns all the keys in the store
        keys: function(callback) {},

        // save an object
        save: function(obj, callback) {},

        // batch save array of objs
        batch: function(array, callback) {},

        // retrieve obj (or array of objs) and apply callback to each
        get: function(key /* or array */, callback) {},

        // check if an obj exists in the collection
        exists: function(key, callback) {},

        // returns all the objs to the callback as an array
        all: function(callback) {},

        // remove a doc or collection of em
        remove: function(key /* or array */, callback) {},

        // destroy everything
        nuke: function(callback) {}
    };

}()));