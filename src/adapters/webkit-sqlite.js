Lawnchair.adapter('webkit-sqlite', (function () {
    // private methods 
    var fail = function () { console.log('error in sqlite adaptor!') }
    ,   now  = function () { return new Date() } // FIXME need to use better date fn

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
            // transactions are like condoms
            this.db.transaction(function(t) {
                
                var insert = function (obj) {
                    val.unshift(JSON.stringify(obj))
                    t.executeSql(ins, val, win, fail);
                }

                var update = function (obj) {
                    delete(obj.key)
                    val.unshift(JSON.stringify(obj))
                    t.executeSql(up, val, win, fail)
                }
                // if there is no key just insert and exit
                if (!obj.key) {
                    insert(obj)
                    return that
                }
                // if a key was passed check for insert/update
                that.exists(obj.key, function (exists) {
                    exists ? update(obj) : insert(obj)
                })
            })
            return this
        }, 

        batch: function (objs, cb) {
            // FIXME
        },

        get: function (key, callback) {
            var that = this
            ,   getr = "SELECT value FROM " + this.name + " WHERE id = ?"
            ,   cb   = this.lambda(callback)

            var win = function (xxx, results) {
                var o = null
                if (results.rows.length != 0) {
                    var o = JSON.parse(results.rows.item(0).value)
                    o.key = key
                }
                if (cb) cb.call(that, o)
            }
            this.db.transaction(function(t){ t.executeSql(getr, [key], win, fail) })
        /*
        .multiget = function(keys, callback) {
            var cb = this.terseToVerboseCallback(callback);
            var that = this;
            this.db.transaction(function(t) {
                var v = []; 
                for(var i=0; i<keys.length; i++) v.push('?');
                var sql = "SELECT * FROM " + that.table + " WHERE id IN ("+v.join(',')+")";

                t.executeSql(sql, keys, function(tx, results) {
                    if (results.rows.length == 0 ) {
                        cb([]);
                    } else {
                        var r = [];
                        for (var i = 0, l = results.rows.length; i < l; i++) {
                            var raw = results.rows.item(i).value;
                            var obj = that.deserialize(raw);
                            obj.key = results.rows.item(i).id;
                            r[keys.indexOf(obj.key)] = obj;
                        }
                        cb(r);
                    }
                },
                that.onError);
            });
        };
        */
        return this
	},

    exists: function (key, cb) {
        var is = "SELECT * FROM " + this.name + "WHERE id = ?"
        ,   that = this
        ,   win = function(xxx, results) { if (cb) that.fn('exists', cb).call(that, !!(results)) }
		this.db.transaction(function(t){ t.executeSql(is, [key], win, fail) })
        return this
    },

	all: function (callback) {
		var that = this
        ,   all  = "SELECT * FROM " + this.name
        ,   r    = []
        ,   cb   = this.lambda(callback).bind(this) || undefined
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

	remove: function (keyOrArray, cb) {
		var del = "DELETE FROM " + this.name + " WHERE id = ?"
        ,   win = function () { if (cb) this.lambda(cb).call(this) }
        // TODO add array syntax
		this.db.transaction( function (t) {
			t.executeSql(del, [keyOrArray], win, fail);
		})
	},

	nuke: function (cb) {
        var nuke = "DELETE FROM " + this.name
        ,   that = this
        ,   win  = cb ? function(){ that.lambda(cb).bind(that)() } : function(){}
		this.db.transaction(function (t) { 
            t.executeSql(nuke, [], win, fail) 
        })
        return this
	}
//////
}})())
