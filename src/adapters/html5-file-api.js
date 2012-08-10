Lawnchair.adapter('html5-file-api', (function(global){

    var error = function() {};

    var TEMPORARY = global.TEMPORARY || webkitStorageInfo.TEMPORARY;
    var PERSISTENT = global.PERSISTENT || webkitStorageInfo.PERSISTENT;
    var requestFileSystem = global.requestFileSystem || global.webkitRequestFileSystem || global.moz_requestFileSystem;
    var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder;

    var FileSystem = (function() {

        var init = function( options, callback ) {
            var me = this;
            requestFileSystem( (options.storage || TEMPORARY), (options.size || 1024*1024*1024), function( fs ) {
                me.fs = fs;
                me.root = fs.root;
                me.cd( me.root );
                callback( this );
            }, error );
        };

        init.ls = function( reader, callback, entries ) {
            var result = entries || [];
            reader.readEntries(function( results ) {
                if ( !results.length ) {
                    if ( callback ) callback( result.map(function(entry) { return entry.name; }) );
                } else {
                    ls( reader, callback, result.concat( Array.prototype.slice.call( results ) ) );
                }
            }, error );
        };

        init.mkdir = function( root, name, callback ) {
            root.getDirectory( name, {create:true}, function( directory ) {
                if ( callback ) callback( directory );
            }, error );
        };

        init.rm = function( root, name, callback ) {
            root.getFile( name, {create:false}, function( file ) {
                file.remove(function() {
                    if ( callback ) callback();
                }, error );
            }, error );
        };

        init.rm_rf = function( root, name, callback ) {
            root.getDirectory( name, {}, function( directory ) {
                directory.removeRecursively(function() {
                    if ( callback ) callback();
                }, error );
            }, error );
        };

        init.exists = function( root, name, callback ) {
            root.getFile( name, {create:false}, function() {
                if ( callback ) callback( true );
            }, function() {
                if ( callback ) callback( false );
            });
        };

        init.fn = init.prototype;

        init.fn.pwd = function( callback ) {
            if ( callback ) callback( this.pwd );
            return pwd;
        };

        init.fn.ls = function( callback, entries ) {
            init.ls( this.pwd.createReader(), callback, entries );
            return this;
        };

        init.fn.cd = function( name, callback ) {
            this.pwd = name;
            if ( callback ) callback();
            return this;
        };

        init.fn.mkdir = function( name, callback ) {
            init.mkdir( this.pwd, name, callback );
            return this;
        };

        init.fn.rm = function( name, callback ) {
            init.rm( this.pwd, name, callback );
            return this;
        };

        init.fn.rm_rf = function( name, callback ) {
            init.rm_rf( this.pwd, name, callback );
            return this;
        };

        init.fn.exists = function( name, callback ) {
            init.exists( this.pwd, name, callback );
            return this;
        };

        return init;
    }());

    // boolean; true if the adapter is valid for the current environment
    var valid = function() {
        return !!requestFileSystem;
    };

    // constructor call and callback. 'name' is the most common option
    var init = function( options, callback ) {
        var me = this;
        this.fs = new FileSystem( options );
        this.fs.mkdir( options.name, function() {
            me.fs.cd( options.name );
            if ( callback ) me.fn( me.name, callback ).call( me, me );
        });
    };

    // returns all the keys in the store
    var keys = function( callback ) {
        var me = this;
        this.fs.ls(function( entries ) {
            if ( callback ) me.fn( 'keys', callback ).call( me, entries );
        });
        return this;
    };

    // save an object
    var save = function( obj, callback ) {
        var me = this;
        this.root.getFile( obj.key, {create:true}, function( file ) {
            file.createWriter(function( writer ) {

                writer.onwriteend = function() {
                    if ( callback ) me.lambda( callback ).call( me, obj );
                };

                var builder = new BlobBuilder();
                builder.append( JSON.stringify( obj ) );
                writer.write( builder.getBlob( 'text/plain' ) );

            }, error );
        }, error );
        return this;
    };

    // UNTESTED
    // batch save array of objs
    var batch = function( array, callback ) {
        var saved = [];
        if ( callback ) this.lambda( callback ).call( this, saved );
        return this;
    };

    // DOESN'T SEEM TO WORK - gets as far as the FileReader
    // retrieve obj (or array of objs) and apply callback to each
    var get = function( key /* or array */, callback ) {
        var me = this;
        if ( this.isArray( key ) ) {
            var values = [];
            if ( callback ) this.lambda( callback ).call( this, values );
        } else {
            this.root.getFile( key, {create:false}, function( file ) {
                var reader = new FileReader();

                console.log( reader );

                reader.onload = function(e) {
                    console.log( arguments );
                    if ( callback ) me.lambda( callback ).call( me, e.target.result );
                };

                reader.onerror = function() {
                    console.error( arguments );
                };

                reader.readAsText( file );
            }, error );
            var value = undefined;
        }
        return this;
    };

    // check if an obj exists in the collection
    var exists = function( key, callback ) {
        var me = this;
        this.fs.exists( key, function( exists ) {
            me.lambda( callback ).call( me, exists );
        });
        return this;
    };

    // TODO: IMPLEMENT
    // returns all the objs to the callback as an array
    var all = function( callback ) {
        var values = [];
        if ( callback ) this.fn( this.name, callback ).call( this, values );
        return this;
    };

    // remove a doc or collection of em
    var remove = function( key /* or object */, callback ) {
        var me = this;
        this.fs.rm( (key.key ? key.key : key), function() {
            if ( callback ) me.lambda( callback ).call( me );
        });
        return this;
    };

    // destroy everything
    var nuke = function( callback ) {
        var me = this;
        this.fs.rm_rf( this.root.name, function() {
            me.fs.mkdir( me.root.name, function() {
                if ( callback ) me.lambda( callback ).call( me );
            });
        });
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