Lawnchair.adapter('html5-file-api', (function(global){

    var error = function( e ) {
        var msg;
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };
        console.error( 'Filesystem error:', msg );
    };

    var TEMPORARY = global.TEMPORARY || webkitStorageInfo.TEMPORARY;
    var PERSISTENT = global.PERSISTENT || webkitStorageInfo.PERSISTENT;
    var requestFileSystem = global.requestFileSystem || global.webkitRequestFileSystem || global.moz_requestFileSystem;
    var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder;

    var ls = function( reader, callback, entries ) {
        var result = entries || [];
        reader.readEntries(function( results ) {
            if ( !results.length ) {
                if ( callback ) callback( result.map(function(entry) { return entry.name; }) );
            } else {
                ls( reader, callback, result.concat( Array.prototype.slice.call( results ) ) );
            }
        }, error );
    };

    return {
        // boolean; true if the adapter is valid for the current environment
        valid: function() {
            return !!requestFileSystem;
        },

        // constructor call and callback. 'name' is the most common option
        init: function( options, callback ) {
            var me = this;
            requestFileSystem( (options.storage || TEMPORARY), (options.size || 1024*1024*1024), function( fs ) {
                me.fs = fs;
                me.fs.root.getDirectory( options.name, {create:true}, function( directory ) {
                    me.root = directory;
                    if ( callback ) me.fn( me.name, callback ).call( me, me );
                }, error );
            }, error );
            return this;
        },

        // returns all the keys in the store
        keys: function( callback ) {
            var me = this;
            ls( this.root.createReader(), function( entries ) {
                if ( callback ) me.fn( 'keys', callback ).call( me, entries );
            });
            return this;
        },

        // save an object
        save: function( obj, callback ) {
            var me = this;
            var key = obj.key || this.uuid();
            obj.key = key;
            this.root.getFile( key, {create:true}, function( file ) {
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
        },

        // batch save array of objs
        batch: function( objs, callback ) {
            var me = this;
            var saved = [];
            for ( var i = 0, il = objs.length; i < il; i++ ) {
                me.save( objs[i], function( obj ) {
                    saved.push( obj );
                    if ( saved.length === il && callback ) {
                        me.lambda( callback ).call( me, saved );
                    }
                });
            }
            return this;
        },

        // retrieve obj (or array of objs) and apply callback to each
        get: function( key /* or array */, callback ) {
            var me = this;
            if ( this.isArray( key ) ) {
                var values = [];
                for ( var i = 0, il = key.length; i < il; i++ ) {
                    me.get( key[i], function( result ) {
                        values.push( result );
                        if ( values.length === il && callback ) {
                            me.lambda( callback ).call( me, values );
                        }
                    });
                }
            } else {
                this.root.getFile( key, {create:false}, function( entry ) {
                    entry.file(function( file ) {
                        var reader = new FileReader();

                        reader.onerror = error;

                        reader.onload = function(e) {
                            if ( callback ) me.lambda( callback ).call( me, JSON.parse( e.target.result ) );
                        };

                        reader.readAsText( file );
                    }, error );
                }, error );
            }
            return this;
        },

        // check if an obj exists in the collection
        exists: function( key, callback ) {
            var me = this;
            this.root.getFile( key, {create:false}, function() {
                if ( callback ) me.lambda( callback ).call( me, true );
            }, function() {
                if ( callback ) me.lambda( callback ).call( me, false );
            });
            return this;
        },

        // returns all the objs to the callback as an array
        all: function( callback ) {
            var me = this;
            this.keys(function( keys ) {
                me.get( keys, function( values ) {
                    if ( callback ) me.fn( me.name, callback ).call( me, values );
                });
            });
            return this;
        },

        // remove a doc or collection of em
        remove: function( key /* or object */, callback ) {
            var me = this;
            this.root.getFile( (typeof key === 'string' ? key : key.key ), {create:false}, function( file ) {
                file.remove(function() {
                    if ( callback ) me.lambda( callback ).call( me );
                }, error );
            }, error );
            return this;
        },

        // destroy everything
        nuke: function( callback ) {
            var me = this;
            var count = 0;
            this.keys(function( keys ) {
                for ( var i = 0, il = keys.length; i < il; i++ ) {
                    me.remove( keys[i], function() {
                        count++;
                        if ( count === il && callback ) {
                            me.lambda( callback ).call( me );
                        }
                    });
                }
            });
            return this;
        }
    };
}(this)));