/**
 * Lawnchair!
 * --- 
 * clientside json store 
 *
 */
var Lawnchair = function () {
    // lawnchair requires json 
    if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.'
    // options are optional; callback is not
    if (arguments.length <= 2 && arguments.length > 0) {
        var callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1]
        ,   options  = (typeof arguments[0] === 'function') ? {} : arguments[0]
    } else {
        throw 'Incorrect # of ctor args!'
    }
    // default configuration 
    this.record = options.record || 'record'  // default for records
    this.name   = options.name   || 'records' // default name for underlying store
    // mixin first valid  adapter
    var adapter
    // if the adapter is passed in we try to load that only
    if (options.adapter) {
        adapter = Lawnchair.adapters[Lawnchair.adapters.indexOf(options.adapter)]
        adapter = adapter.valid() ? adapter : undefined
    // otherwise find the first valid adapter for this env        
    } else {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined
            if (adapter) break 
        }
    } 
    // we have failed 
    if (!adapter) throw 'No valid adapter.' 
    // yay! mixin the adapter 
    for (var j in adapter) { 
        this[j] = adapter[j]
    }
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
    // mix in the adapter 	
    for (var i in obj) if (implementing.indexOf(i) === -1) throw 'Invalid adapter! Nonstandard method: ' + i
    // if we made it this far the adapter interface is valid 
    Lawnchair.adapters.push(obj)
}

Lawnchair.plugins = []

/**
 * generic shallow extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited 
 *
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
	}
// --
};
