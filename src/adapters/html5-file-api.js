Lawnchair.adapter('html5-file-api', (function(global){

    // boolean; true if the adapter is valid for the current environment
    var valid = function() {
        return true;
    };

    // constructor call and callback. 'name' is the most common option
    var init = function( options, callback ) {
        if (callback) this.fn( this.name, callback ).call(this, this);
        return this;
    };

    // returns all the keys in the store
    var keys = function( callback ) {
        if ( callback ) this.fn('keys', callback).call(this, keys)
        return this;
    };

    // save an object
    var save = function( obj, callback ) {
        if ( callback ) this.lambda( callback ).call( this, obj );
        return this;
    };

    // batch save array of objs
    var batch = function( array, callback ) {
        var saved = [];
        if ( callback ) this.lambda( callback ).call( this, saved );
        return this;
    };

    // retrieve obj (or array of objs) and apply callback to each
    var get = function( key /* or array */, callback ) {
        if ( this.isArray( key ) ) {
            var values = [];
            if ( callback ) this.lambda( callback ).call( this, values );
        } else {
            var value = undefined;
            if ( callback ) this.lambda( callback ).call( this, value );
        }
        return this;
    };

    // check if an obj exists in the collection
    var exists = function( key, callback ) {
        var exists = false;
        this.lambda( callback ).call( this, exists );
        return this;
    };

    // returns all the objs to the callback as an array
    var all = function( callback ) {
        var values = [];
        if ( callback ) this.fn( this.name, callback ).call( this, values );
        return this;
    };

    // remove a doc or collection of em
    var remove = function( key /* or object */, callback ) {
        if ( callback ) this.lambda( callback ).call( this );
        return this;
    };

    // destroy everything
    var nuke = function( callback ) {
        if ( callback ) this.lambda( callback ).call( this );
        return this;
    };

    return {
        valid: valid,
        init: init,
        keys: keys,
        save: save,
        batch: batch,
        get: get,
        exists: exists,
        all: all,
        remove: remove,
        nuke: nuke
    };

}(this)));