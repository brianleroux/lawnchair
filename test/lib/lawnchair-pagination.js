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
Lawnchair.adapter('webkit-sqlite', (function () {
    // private methods 
    var fail = function (e, i) { console.log('error in sqlite adaptor!', e, i) }
    ,   now  = function () { return new Date() } // FIXME need to use better date fn
	// not entirely sure if this is needed...
    if (!Function.prototype.bind) {
        Function.prototype.bind = function( obj ) {
            var slice = [].slice
            ,   args  = slice.call(arguments, 1) 
            ,   self  = this
            ,   nop   = function () {} 
            ,   bound = function () {
                    return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments))) 
                }
            nop.prototype   = self.prototype
            bound.prototype = new nop()
            return bound
        }
    }

    // public methods
    return {
    
        valid: function() { return !!(window.openDatabase) },

        init: function (options, callback) {
            var that   = this
            ,   cb     = that.fn(that.name, callback)
            ,   create = "CREATE TABLE IF NOT EXISTS " + this.name + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)"
            ,   win    = cb.bind(this)
            // open a connection and create the db if it doesn't exist 
            this.db = openDatabase(this.name, '1.0.0', this.name, 65536)
            this.db.transaction(function (t) { 
                t.executeSql(create, [], win, fail) 
            })
        }, 

        keys:  function (callback) {
            var cb   = this.lambda(callback)
            ,   that = this
            ,   keys = "SELECT id FROM " + this.name + " ORDER BY timestamp DESC"

            this.db.transaction(function(t) {
                var win = function (xxx, results) {
                    if (results.rows.length == 0 ) {
                        cb.call(that, [])
                    } else {
                        var r = [];
                        for (var i = 0, l = results.rows.length; i < l; i++) {
                            r.push(results.rows.item(i).id);
                        }
                        cb.call(that, r)
                    }
                }
                t.executeSql(keys, [], win, fail)
            })
            return this
        },
        // you think thats air you're breathing now?
        save: function (obj, callback) {
            var that = this
            ,   id   = obj.key || that.uuid()
            ,   ins  = "INSERT INTO " + this.name + " (value, timestamp, id) VALUES (?,?,?)"
            ,   up   = "UPDATE " + this.name + " SET value=?, timestamp=? WHERE id=?"
            ,   win  = function () { if (callback) { obj.key = id; that.lambda(callback).call(that, obj) }}
            ,   val  = [now(), id]
			// existential 
            that.exists(obj.key, function(exists) {
                // transactions are like condoms
                that.db.transaction(function(t) {
					// TODO move timestamp to a plugin
                    var insert = function (obj) {
                        val.unshift(JSON.stringify(obj))
                        t.executeSql(ins, val, win, fail)
                    }
					// TODO move timestamp to a plugin
                    var update = function (obj) {
                        delete(obj.key)
                        val.unshift(JSON.stringify(obj))
                        t.executeSql(up, val, win, fail)
                    }
					// pretty
                    exists ? update(obj) : insert(obj)
                })
            });
            return this
        }, 

		// FIXME this should be a batch insert / just getting the test to pass...
        batch: function (objs, cb) {
			
			var updatables = []
			,   sql        = ''
			,   that       = this
			,   results    = []

			// helper for building the sql str
			var inserting = function(obj) {
				var key = that.uuid()
				,   str = JSON.stringify(obj)
				sql += 'INSERT INTO ' + that.name + ' '
				sql += '(value, timestamp, id) VALUES ('
				sql += "'" + str + "','" + now() + "','" + key + "');"
				results.push(key)
			}

			for (var i = 0, l = objs.length; i < l; i++) {
				if (objs[i].key) {
					// check if we are inserting or updating
					this.exists(objs[i].key, function(exists) {
						if (exists) {
							// this record is being updated
							updatables.push(obj[i])
							results.push(key)
						} else {
							// this record is being inserted
							inserting(objs[i])
						}
					})
				} else {
					// batch inserting for sure
					inserting(objs[i])
				}
			}
			
			//
			var win = function() {
				if (cb) { 
					that.get(results, function(r) {
						that.lambda(cb).call(that, r)
					})
				}
			}

			if (updatables.length) {
				// FIXME
			} else {
                this.db.transaction(function(t){t.executeSql(sql, [], win, fail)})
			}
            return this
        },

        get: function (keyOrArray, cb) {
			var that = this
			,   sql  = ''
            // batch selects support
			if (this.isArray(keyOrArray)) {
				sql = 'SELECT id, value FROM ' + this.name + " WHERE id IN ('" + keyOrArray.join("','") + "')"
			} else {
				sql = 'SELECT id, value FROM ' + this.name + " WHERE id = '" + keyOrArray + "'"
			}	
			// FIXME
            // will always loop the results but cleans it up if not a batch return at the end..
			// in other words, this could be faster
			var win = function (xxx, results) {
				var o = null
				,   r = []
				if (results.rows.length) {
					for (var i = 0, l = results.rows.length; i < l; i++) {
						o = JSON.parse(results.rows.item(i).value)
						o.key = results.rows.item(i).id
						r.push(o)
					}
				}
				if (!that.isArray(keyOrArray)) r = r.length ? r[0] : null
				if (cb) that.lambda(cb).call(that, r)
            }
            this.db.transaction(function(t){ t.executeSql(sql, [], win, fail) })
            return this 
		},

		exists: function (key, cb) {
			var is = "SELECT * FROM " + this.name + " WHERE id = ?"
			,   that = this
			,   win = function(xxx, results) { if (cb) that.fn('exists', cb).call(that, (results.rows.length > 0)) }
			this.db.transaction(function(t){ t.executeSql(is, [key], win, fail) })
			return this
		},

		all: function (callback) {
			var that = this
			,   all  = "SELECT * FROM " + this.name
			,   r    = []
			,   cb   = this.fn(this.name, callback) || undefined
			,   win  = function (xxx, results) {
				if (results.rows.length != 0) {
					for (var i = 0, l = results.rows.length; i < l; i++) {
						var obj = JSON.parse(results.rows.item(i).value)
						obj.key = results.rows.item(i).id
						r.push(obj)
					}
				}
				if (cb) cb.call(that, r)
			}

			this.db.transaction(function (t) { 
				t.executeSql(all, [], win, fail) 
			})
			return this
		},

		remove: function (keyOrObj, cb) {
			var that = this
			,   key  = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key
			,   del  = "DELETE FROM " + this.name + " WHERE id = ?"
			,   win  = function () { if (cb) that.lambda(cb).call(that) }

			this.db.transaction( function (t) {
				t.executeSql(del, [key], win, fail);
			});

			return this;
		},

		nuke: function (cb) {
			var nuke = "DELETE FROM " + this.name
			,   that = this
			,   win  = cb ? function() { that.lambda(cb).call(that) } : function(){}
				this.db.transaction(function (t) { 
				t.executeSql(nuke, [], win, fail) 
			})
			return this
		}
//////
}})())
/*
var p = new Lawnchair({name:'people', record:'person'}, function() {
 
    People = this

    People.page(2, function (page) {
        // scoped iterator
        this.each('console.log(person)')
        // also correctly scoped callback data
        console.log(page.people) 
        console.log(page.max)
        console.log(page.next)
        console.log(page.prev)
    })
})
// chaining friendly
p.page(1, 'console.log(page.people)').each('console.log(person)')
*/ 
Lawnchair.plugin({

    page: function (page, callback) {
        // some defaults
	    var objs  = []
	    ,   count = 5 // TODO make this configurable
	    ,   cur   = ~~page || 1
	    ,   next  = cur + 1
	    ,   prev  = cur - 1
	    ,   start = cur == 1 ? 0 : prev*count
	    ,   end   = start >= count ? start+count : count
              
        // grab all the records	
        // FIXME if this was core we could use this.__results for faster queries
		this.all(function(r){
	 		objs = r
 		})
        
        // grab the metadata	
        var max  = Math.ceil(objs.length/count)
	    ,   page = { max: max 
	               , next: next > max ? max : next
	               , prev: prev == 0 ? 1 : prev
	               }

        // reassign to the working resultset
        this.__results = page[this.name] = objs.slice(start, end)

        // callback / chain
        if (callback) this.fn('page', callback).call(this, page)
        return this
	}
});
