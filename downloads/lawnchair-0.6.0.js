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

    if (typeof callback !== 'function') throw 'No callback was provided';

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
/**
 * dom storage adapter 
 * === 
 * - originally authored by Joseph Pecoraro
 *
 */ 
//
// TODO does it make sense to be chainable all over the place?
// chainable: nuke, remove, all, get, save, all    
// not chainable: valid, keys
//
Lawnchair.adapter('dom', {
    // ensure we are in an env with localStorage 
    valid: function () {
        return window.Storage != 'undefined' 
    },

	init: function (options, callback) {
        // yay dom!
        this.storage = window.localStorage
        // indexer helper code
        var self = this
        // the indexer is an encapsulation of the helpers needed to keep an ordered index of the keys
        this.indexer = {
            // the key
            key: self.name + '._index_',
            // returns the index
            all: function() {
                var a = JSON.parse(self.storage.getItem(this.key))
                if (a == null) self.storage.setItem(this.key, JSON.stringify([])) // lazy init
                return JSON.parse(self.storage.getItem(this.key))
            },
            // adds a key to the index
            add: function (key) {
                var a = this.all()
                a.push(key)
                self.storage.setItem(this.key, JSON.stringify(a))
            },
            // deletes a key from the index
            del: function (key) {
                var a = this.all(), r = []
                // FIXME this is crazy inefficient but I'm in a strata meeting and half concentrating
                for (var i = 0, l = a.length; i < l; i++) {
                    if (a[i] != key) r.push(a[i])
                }
                self.storage.setItem(this.key, JSON.stringify(r))
            },
            // returns index for a key
            find: function (key) {
                var a = this.all()
                for (var i = 0, l = a.length; i < l; i++) {
                    if (key === a[i]) return i 
                }
                return false
            }
        }

        if (callback) this.fn(this.name, callback).call(this, this)  
	},
	
    save: function (obj, callback) {
		var key = obj.key || this.uuid()
        // if the key is not in the index push it on
        if (!this.indexer.find(key)) this.indexer.add(key)
	    // now we kil the key and use it in the store colleciton	
        delete obj.key;
		this.storage.setItem(key, JSON.stringify(obj))
		if (callback) {
		    obj.key = key
            this.lambda(callback).call(this, obj)
		}
        return this
	},

    batch: function (ary, callback) {
        var saved = []
        // not particularily efficient but this is more for sqlite situations
        for (var i = 0, l = ary.length; i < l; i++) {
            this.save(ary[i], function(r){
                saved.push(r)
            })
        }
        // FIXME this needs tests
        if (callback) this.lambda(callback).call(this, saved)
        return this
    },
   
    // accepts [options], callback
    keys: function() {
        // TODO support limit/offset options here
        var limit = options.limit || null
        ,   offset = options.offset || 0
        if (callback) this.lambda(callback).call(this, this.indexer.all())
    },
    
    get: function (key, callback) {
        if (this.isArray(key)) {
            var r = []
            for (var i = 0, l = key.length; i < l; i++) {
                var obj = JSON.parse(this.storage.getItem(key[i]))
                if (obj) {
                    obj.key = key[i]
                    r.push(obj)
                } 
            }
            if (callback) this.lambda(callback).call(this, r)
        } else {
            var obj = JSON.parse(this.storage.getItem(key))
            if (obj) obj.key = key
            if (callback) this.lambda(callback).call(this, obj)
        }
        return this
    },
    // NOTE adapters cannot set this.__results but plugins do
    // this probably should be reviewed
	all: function (callback) {
        var idx = this.indexer.all()
        ,   r   = []
        ,   o
        for (var i = 0, l = idx.length; i < l; i++) {
            o = JSON.parse(this.storage.getItem(idx[i]))
            o.key = idx[i]
            r.push(o)
        }
		if (callback) this.fn(this.name, callback).call(this, r)
        return this
	},
	
    remove: function (keyOrObj, callback) {
        var key = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key
        this.indexer.del(key)
		this.storage.removeItem(key)
		if (callback) this.lambda(callback).call(this)
        return this
	},
	
    nuke: function (callback) {
		this.all(function(r) {
			for (var i = 0, l = r.length; i < l; i++) {
				this.remove(r[i]);
			}
			if (callback) this.lambda(callback).call(this)
		})
        return this 
	}
});
