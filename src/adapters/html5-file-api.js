Lawnchair.adapter('html5-file-api', (function(global){

    var error = function() {};

    var TEMPORARY = global.TEMPORARY || webkitStorageInfo.TEMPORARY;
    var PERSISTENT = global.PERSISTENT || webkitStorageInfo.PERSISTENT;
    var requestFileSystem = global.requestFileSystem || global.webkitRequestFileSystem || global.moz_requestFileSystem;
    var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder;

    var FileSystem = (function() {

        var cat = function( root, name, callback ) {
            root.getFile( name, {create:false}, function( entry ) {
                entry.file(function( file ) {
                    var reader = new FileReader();

                    reader.onerror = error;

                    reader.onload = function(e) {
                        callback( e.target.result );
                    };

                    reader.readAsText( file );
                }, error );
            }, error );
        };

        var touch = function( root, name, contents, callback ) {
            root.getFile( name, {create:true}, function( file ) {
                file.createWriter(function( writer ) {
                    writer.onwriteend = function() {
                        if ( callback ) callback();
                    };

                    var builder = new BlobBuilder();
                    builder.append( contents );
                    writer.write( builder.getBlob( 'text/plain' ) );
                }, error );
            }, error );
        };

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

        var mkdir = function( root, name, callback ) {
            root.getDirectory( name, {create:true}, function( directory ) {
                if ( callback ) callback( directory );
            }, error );
        };

        var rm = function( root, name, callback ) {
            root.getFile( name, {create:false}, function( file ) {
                file.remove(function() {
                    if ( callback ) callback();
                }, error );
            }, error );
        };

        var rm_rf = function( root, name, callback ) {
            root.getDirectory( name, {}, function( directory ) {
                directory.removeRecursively(function() {
                    if ( callback ) callback();
                }, error );
            }, error );
        };

        var exists = function( root, name, callback ) {
            root.getFile( name, {create:false}, function() {
                if ( callback ) callback( true );
            }, function() {
                if ( callback ) callback( false );
            });
        };

        var init = function( options, callback ) {
            var me = this;
            requestFileSystem( (options.storage || TEMPORARY), (options.size || 1024*1024*1024), function( fs ) {
                me.fs = fs;
                me.root = fs.root;
                me.pwd = fs.root;
                callback( me );
            }, error );
        };

        init.fn = init.prototype;

        init.fn.cd = function( name, callback ) {
            var me = this;
            this.pwd.getDirectory( name, {create:false}, function( directory ) {
                me.pwd = directory;
                if ( callback ) callback( me.pwd );
            });
            return this;
        };

        init.fn.touch = function( name, contents, callback ) {
            touch( this.pwd, name, contents, callback );
            return this;
        };

        init.fn.ls = function( callback, entries ) {
            ls( this.pwd.createReader(), callback, entries );
            return this;
        };

        init.fn.cat = function( name, callback ) {
            cat( this.pwd, name, callback );
            return this;
        };

        init.fn.mkdir = function( name, callback ) {
            mkdir( this.pwd, name, callback );
            return this;
        };

        init.fn.rm = function( name, callback ) {
            rm( this.pwd, name, callback );
            return this;
        };

        init.fn.rm_rf = function( name, callback ) {
            rm_rf( this.pwd, name, callback );
            return this;
        };

        init.fn.exists = function( name, callback ) {
            exists( this.pwd, name, callback );
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
        new FileSystem( options, function( fs ) {
            me.fs = fs;
            me.fs.mkdir( options.name, function() {
                me.fs.cd( options.name, function() {
                    if ( callback ) me.fn( me.name, callback ).call( me, me );
                });
            });
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
        me.fs.touch( obj.key, JSON.stringify( obj ), function() {
            if ( callback ) me.lambda( callback ).call( me, obj );
        });
        return this;
    };

    // batch save array of objs
    var batch = function( objs, callback ) {
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
    };

    // retrieve obj (or array of objs) and apply callback to each
    var get = function( key /* or array */, callback ) {
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
            me.fs.cat( key, function( result ) {
                if ( callback ) me.lambda( callback ).call( me, JSON.parse( result ) );
            });
        }
        return this;
    };

    // check if an obj exists in the collection
    var exists = function( key, callback ) {
        var me = this;
        this.fs.exists( key, function( exists ) {
            if ( callback ) me.lambda( callback ).call( me, exists );
        });
        return this;
    };

    // returns all the objs to the callback as an array
    var all = function( callback ) {
        var me = this;
        this.keys(function( keys ) {
            me.get( keys, function( values ) {
                if ( callback ) me.fn( me.name, callback ).call( me, values );
            });
        });
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