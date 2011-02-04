/**
 * Lawnchair! 
 *
 */
var Lawnchair = function () {
    // lawnchair requires json 
    if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.'
    // options are optional; callback is not
    if (arguments.length <= 2 && arguments.length > 0) {
        var callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1]
        ,   options = (typeof arguments[0] === 'function') ? {} : arguments[0]
    } else {
        throw 'Incorrect # of ctor args!'
    }
    // setup defaults
    this._initOptions(options)
    // mixin first valid  adaptor
    this._initAdaptor(options) 
    // startup plugins 
    this._initPlugins(options)
    // init the adaptor 
    this.init(options, callback)
}

Lawnchair.adaptors = [] 

/** 
 * queue an adaptor for mixin
 * ===
 * - checks for standard methods: adaptor, valid, init, save, batch, get, exists, all, remove, nuke
 *
 */
Lawnchair.adaptor = function (id, obj) {
    // add the adaptor id to the adaptor obj
    // ugly here for a  cleaner dsl for implementing adaptors
    obj['adaptor'] = id
    // methods required to implement a lawnchair adaptor 
    var implementing = 'adaptor valid init keys save batch get exists all remove nuke'.split(' ')
    // mix in the adaptor 	
    for (var i in obj) {
       if (implementing.indexOf(i) === -1) throw 'Invalid adaptor! Nonstandard method: ' + i
    }
    // if we made it this far the adaptor interface is valid 
    Lawnchair.adaptors.push(obj)
}

Lawnchair.plugins = []

/**
 * generic extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited 
 *
 */ 
Lawnchair.plugin = function(obj) {
    for (var i in obj) {
        if (i === 'init') {
            Lawnchair.plugins.push(obj[i]) 
        } else {
            this.prototype[i] = obj[i]
        }
    } 
}

/**
 * helpers
 *
 */
Lawnchair.prototype = {
    // FIXME needs tests
    // default configuration 
    _initOptions: function (opts) {
        this.record = opts.record || 'record'  // default for records
        this.name   = opts.name   || 'records' // default name for underlying store
    },

    // FIXME needs test
    _initPlugins: function () {
        for (var i = 0, l = Lawnchair.plugins.length; i < l; i++) {
            Lawnchair.plugins[i].call(this)
        }
    },

    _initAdaptor: function (options) {
        var adaptor
        // if the adaptor is passed in we try to load that only
        if (options.adaptor) {
            adaptor = Lawnchair.adaptors[Lawnchair.adaptors.indexOf(options.adaptor)]
            adaptor = adaptor.valid() ? adaptor : undefined
        // otherwise find the first valid adaptor for this env        
        } else {
            for (var i = 0, l = Lawnchair.adaptors.length; i < l; i++) {
                adaptor = Lawnchair.adaptors[i].valid() ? Lawnchair.adaptors[i] : undefined
                if (adaptor) break 
            }
        } 
        // we have failed 
        if (!adaptor) throw 'No valid adaptor.' 
        // yay! mixin the adaptor 
        for (var j in adaptor) {
            this[j] = adaptor[j]
        } 
    },

	// awesome shorthand callbacks as strings. this is shameless theft from dojo.
	lambda: function (callback) {
	    return this.fn(this.record, callback)
    },

    // first stab at named parameters for terse callbacks
    fn: function(name, callback) {
		return (typeof callback == 'string') ? new Function(name, callback) : callback;
    },

	// returns a unique identifier (by way of Backbone.localStorage.js)
	uuid: function () {
	    var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
// --
};
