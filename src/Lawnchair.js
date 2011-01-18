/**
 * TODO batch inseration 
 *
 */
var Lawnchair = function (options, callback) { 
    // lawnchair requires json and a callback 
    if (!JSON) throw "JSON unavailable! Include http://www.json.org/json2.js to fix."
    if (typeof(callback) === 'undefined') throw "Undefined callback! Callback is required second param to Lawnchair constructor."
    // startup plugins 
    this._initPlugins()
    // mixin first valid  adaptor
    this._initAdaptor() 
    // init the adaptor 
    this.init(options, callback)
}

Lawnchair.adaptors = [] 

/** 
 * queue an adaptor for mixin
 * ===
 * - checks for standard methods: adaptor init, save, get, exists, all, remove, nuke
 *
 */ 
Lawnchair.adaptor = function (id, obj) {
    // add the adaptor id to the adaptor obj
    // ugly here for a  cleaner dsl for implementing adaptors
    obj['adaptor'] = id
    // methods required to implement a lawnchair adaptor 
    var implementing = 'adaptor valid init save get exists all remove nuke'.split(' ')
    // mix in the adaptor 	
    for (var i in obj) {
       if (implementing.indexOf(i) === -1) throw 'Invalid adaptor! Method missing: ' + i
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

    _initPlugins: function () {
        var self = this
        Lawnchair.plugins.forEach(function(plugin){
            plugin.call(self)
        })
    },

    _initAdaptor: function () {
        // iterate all adaptors
        for (var i = 0, l = Lawnchair.adaptors.length; i < l; i++) {
            // mixin the first adaptor that is valid for this env
            var adaptor = Lawnchair.adaptors[i]
            if (adaptor.valid()) {
                for (var j in adaptor) {
                    this[j] = adaptor[j]
                } 
                break  
            }
        }
        // we have failed 
        if (!this.adaptor) throw 'No valid adaptor.' 
    },
    // FIXME i think this will be unused after refactor    
    // merging default properties with user defined options in lawnchair init 
	merge: function (defaultOption, userOption) {
		return (userOption == undefined || userOption == null) ? defaultOption: userOption;
	},

	// awesome shorthand callbacks as strings. this is shameless theft from dojo.
	terseToVerboseCallback: function (callback) {
		return (typeof arguments[0] == 'string') ? function (r, i) { eval(callback) } : callback;
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
