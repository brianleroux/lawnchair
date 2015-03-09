/**
 * Lawnchair!
 * --- 
 * clientside json store 
 *
 */
var Lawnchair = function (options, callback) {
    // ensure Lawnchair was called as a constructor
    if (!(this instanceof Lawnchair)) return new Lawnchair(options, callback);

    // lawnchair requires json 
    if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.'
    // options are optional; callback is not
    if (arguments.length <= 2) {
        callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1];
        options  = (typeof arguments[0] === 'function') ? {} : arguments[0] || {};
    } else {
        throw 'Incorrect # of ctor args!'
    }
    
    // default configuration 
    this.record = options.record || 'record'  // default for records
    this.name   = options.name   || 'records' // default name for underlying store
    this.keyPath = options.keyPath || 'key' // default identifier property
    
    // mixin first valid  adapter
    var adapter
    // if the adapter is passed in we try to load that only
    if (options.adapter) {
        
        // the argument passed should be an array of prefered adapters
        // if it is not, we convert it
        if(typeof(options.adapter) === 'string'){
            options.adapter = [options.adapter];    
        }
            
        // iterates over the array of passed adapters 
        for(var j = 0, k = options.adapter.length; j < k; j++){
            
            // itirates over the array of available adapters
            for (var i = Lawnchair.adapters.length-1; i >= 0; i--) {
                if (Lawnchair.adapters[i].adapter === options.adapter[j]) {
                    adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined;
                    if (adapter) break 
                }
            }
            if (adapter) break
        }
    
    // otherwise find the first valid adapter for this env
    } 
    else {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined
            if (adapter) break 
        }
    } 
    
    // we have failed 
    if (!adapter) throw 'No valid adapter.' 
    
    // yay! mixin the adapter 
    for (var j in adapter)  
        this[j] = adapter[j]
    
    // call init for each mixed in plugin
    for (var i = 0, l = Lawnchair.plugins.length; i < l; i++) 
        Lawnchair.plugins[i].call(this)

    // init the adapter 
    this.init(options, callback)
}

Lawnchair.adapters = [] 

/** 
 * queues an adapter for mixin
 * ===
 * - ensures an adapter conforms to a specific interface
 *
 */
Lawnchair.adapter = function (id, obj) {
    // add the adapter id to the adapter obj
    // ugly here for a  cleaner dsl for implementing adapters
    obj['adapter'] = id
    // methods required to implement a lawnchair adapter 
    var implementing = 'adapter valid init keys save batch get exists all remove nuke'.split(' ')
    ,   indexOf = this.prototype.indexOf
    // mix in the adapter   
    for (var i in obj) {
        if (indexOf(implementing, i) === -1) throw 'Invalid adapter! Nonstandard method: ' + i
    }
    // if we made it this far the adapter interface is valid 
    // insert the new adapter as the preferred adapter
    Lawnchair.adapters.splice(0,0,obj)
}

Lawnchair.plugins = []

/**
 * generic shallow extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited 
 * - yes we could use hasOwnProp but nobody here is an asshole
 */ 
Lawnchair.plugin = function (obj) {
    for (var i in obj) 
        i === 'init' ? Lawnchair.plugins.push(obj[i]) : this.prototype[i] = obj[i]
}

/**
 * helpers
 *
 */
Lawnchair.prototype = {

    isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]' },
    
    /**
     * this code exists for ie8... for more background see:
     * http://www.flickr.com/photos/westcoastlogic/5955365742/in/photostream
     */
    indexOf: function(ary, item, i, l) {
        if (ary.indexOf) return ary.indexOf(item)
        for (i = 0, l = ary.length; i < l; i++) if (ary[i] === item) return i
        return -1
    },

    // awesome shorthand callbacks as strings. this is shameless theft from dojo.
    lambda: function (callback) {
        return this.fn(this.record, callback)
    },

    // first stab at named parameters for terse callbacks; dojo: first != best // ;D
    fn: function (name, callback) {
        return typeof callback == 'string' ? new Function(name, callback) : callback
    },

    // returns a unique identifier (by way of Backbone.localStorage.js)
    // TODO investigate smaller UUIDs to cut on storage cost
    uuid: function () {
        var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },

    // a classic iterator
    each: function (callback) {
        var cb = this.lambda(callback)
        // iterate from chain
        if (this.__results) {
            for (var i = 0, l = this.__results.length; i < l; i++) cb.call(this, this.__results[i], i) 
        }  
        // otherwise iterate the entire collection 
        else {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) cb.call(this, r[i], i)
            })
        }
        return this
    },
    keyEmbellish:function(object) {
        var self=this;
        var value=null;
        // If this 'keyPath' (not 'key_path') is a simple (i.e. top level, single value) key...
        if(typeof(self.keyPath)==='string'&&self.keyPath.indexOf(',')==-1&&self.keyPath.indexOf('.')==-1) {
            // Return what is already defined.
            if(self.keyPath in object) {value=object[self.keyPath];}
            // Provide a unique identifier for the object and assign the identifier to key.
			else {value=self.uuid();object[self.keyPath]=value;}
        }
        return value;
    },
    keyExtraction:function(object, key_path) {
        // http://www.w3.org/TR/IndexedDB/#dfn-steps-for-extracting-a-key-from-a-value-using-a-key-path
        var self=this;
        key_path=key_path||self.keyPath;
        var value=null;
        if(typeof(key_path)==='string') {
            //3.3.6#2
            if(key_path.length==0) {
                value=object;
            } else {
                //3.3.6#1
                if(key_path.indexOf(',')>-1) {
                    var sequence_values=[];
                    key_path.split(',').forEach(function(key_sequence, s, key_sequences) {
                        var sub_key = self.keyExtraction(object, key_sequence);
                        if(!!sub_key) {sequence_values.push(sub_key);}
                    }, this );
                    value=sequence_values;
                } else {
                    var identifier_value=null;
                    var key_identifiers=key_path.split('.');
                    var key_identifier=key_identifiers[0];
                    if(key_identifier in object) {
                        var sub_object=object[key_identifier];
                        if(key_identifiers.length==1) {value=sub_object;}
                        else {
                            var remaining_key_path=key_identifiers.slice(1).join('.');
                            identifier_value=self.keyExtraction(sub_object, remaining_key_path);
                            if(!!identifier_value) {value=identifier_value;}
                        }
                    }
                }//indexOf
            }//length
            if(!value) {value=self.keyEmbellish(object);}
        }//typeof
        return( value );
    },
    keyIsValid:function( key_value, every_index, every_array ) {
        // http://www.w3.org/TR/IndexedDB/#key-construct
        // 'key_value' is "scalar" or Array value returned by 'keyExtraction', or not.
        // 'every_index' and 'every_array' are optional and only including for debugging array key values.
        // Returns whether 'key_value' is valid.
        var self = this;
        var key_values = ((key_value instanceof Array)?(key_value):([key_value]));
        var key_is_valid = key_values.every( function every_key_is_valid( value, v, values ) {
            var value_is_valid = false;
            if( value instanceof Date ) {value_is_valid = !window.isNaN( value.getTime());}
            else if( typeof( value ) === 'number' ) {value_is_valid = !window.isNaN( value );}
            else if( typeof( value ) === 'string' ) {value_is_valid = true;}
            else if( value instanceof Array ) {value_is_valid = value.every( self.keyIsValid, value );}
            return( value_is_valid );
        }, key_values );
        return( key_is_valid );
    },
    keyObjectComparator:function( key_path ) {
        // http://www.w3.org/TR/IndexedDB/#key-construct
        // 'key_path' is optional, defaults to this 'keyPath'.
        // Returns comparator function to compare objects based on 'key_path'.
        var self = this;
        // Pre-default 'key_path's value for...sanity.
        key_path = key_path || self.keyPath;
        return( function key_object_comparator( leftObj, rightObj ) {
            var left_key = self.keyExtraction( leftObj, key_path );
            if( !self.keyIsValid( left_key )) {
                throw( new SyntaxError( "keyObjectComparator: ".concat( 
                    "key value '", left_key, "' is invalid.  Evaluated using key path '", key_path, "'." 
                )));
            }
            var right_key = self.keyExtraction( rightObj, key_path );
            if( !self.keyIsValid( right_key )) {
                throw( new SyntaxError( "keyObjectComparator: ".concat( 
                    "key value '", right_key, "' is invalid.  Evaluated using key path '", key_path, "'." 
                )));
            }
            var comparison = self.keyValueComparator()( left_key, right_key );
            // 'comparison' is already clamped to [-1,+1].
            return( comparison );
        });
    },
    keyValueComparator:function()
    {
        // http://www.w3.org/TR/IndexedDB/#key-construct
        // Although no parameters are passed, it is a comparator factory to be analogous to 'keyObjectComparator'.
        var self = this;
        return( function key_value_comparator( left_key, right_key ) {
            var comparison = 0;
            var leftKeyIs = {
                'anArray':self.isArray( left_key ),
                'aDate':left_key instanceof Date,
                'aNumber':typeof( left_key ) === 'number',
                'aString':typeof( left_key ) === 'string',
            };
            var rightKeyIs = {
                'anArray':self.isArray( right_key ),
                'aDate':right_key instanceof Date,
                'aNumber':typeof( right_key ) === 'number',
                'aString':typeof( right_key ) === 'string',
            };
            if( leftKeyIs.anArray ) {
                if( rightKeyIs.anArray ) {
                    comparison = right_key.length - left_key.length;
                    if( comparison == 0 ) {
                        // Use for-loop to facilitate 'break'.
                        for( var i = 0, l = left_key.length; i < l; ++i ) {
                            var comp = self.keyValueComparator()( left_key[ i ], right_key[ i ]);
                            if( comp != 0 ) {comparison = comp;break;}
                        }
                    }
                }
                else {comparison = -1;}
            }
            else if( leftKeyIs.aDate ) {
                if( rightKeyIs.aDate ) {comparison = right_key.getTime() - left_key.getTime();}
                else if( rightKeyIs.anArray ) {comparison = +1;}
                else {comparison = Number.NaN;}
            }
            else if( leftKeyIs.aNumber ) {
                if( rightKeyIs.aNumber ) {comparison = right_key.valueOf() - left_key.valueOf();}
                else if( rightKeyIs.anArray || rightKeyIs.aDate ) {comparison = +1;}
                else {comparison = Number.NaN;}
            }
            else if( leftKeyIs.aString ) {
                if( rightKeyIs.aString ) {comparison = left_key.localeCompare( right_key );}
                else if( rightKeyIs.anArray || rightKeyIs.aDate || rightKeyIs.aNumber ) {comparison = +1;}
                else {comparison = Number.NaN;}
            }
            else {comparison = Number.NaN;}
            // Clamp comparison.
            comparison = Math.max( -1, Math.min( comparison, +1 ));
            return( comparison );
        });
    }
// --
};

/**
 * Expose nodeJS module
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Lawnchair;
}
