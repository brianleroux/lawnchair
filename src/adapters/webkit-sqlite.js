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
            ,   create = "CREATE TABLE IF NOT EXISTS " + this.record + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)"
            ,   win    = function(){ return cb.call(that, that); }
            // open a connection and create the db if it doesn't exist 
            this.db = openDatabase(this.name, '1.0.0', this.name, 65536)
            this.db.transaction(function (t) { 
                t.executeSql(create, [], win, fail) 
            })
        }, 

        keys:  function (callback) {
            var cb   = this.lambda(callback)
            ,   that = this
            ,   keys = "SELECT id FROM " + this.record + " ORDER BY timestamp DESC"

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
            ,   ins  = "INSERT INTO " + this.record + " (value, timestamp, id) VALUES (?,?,?)"
            ,   up   = "UPDATE " + this.record + " SET value=?, timestamp=? WHERE id=?"
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

	// FIXME this should be a batch insert (but we'd need to preserve the order of the results)
        batch: function (objs, callback) {

            var results = []
            ,   done = objs.length
            ,   self = this

            var putOne = function(i) {
                self.save(objs[i], function(obj) {
                    // make sure we preserve order
                    results[i] = obj;
                    if ((--done) > 0) { return; }
                    if (callback) {
                        self.lambda(callback).call(self, results);
                    }
                });
            };

            for (var i = 0, l = objs.length; i < l; i++)
                putOne(i);

            return this
        },

        get: function (keyOrArray, cb) {
			var that = this
			,   sql  = ''
            ,   args = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray];
            // batch selects support
            sql = 'SELECT id, value FROM ' + this.record + " WHERE id IN (" +
                args.map(function(){return '?'}).join(",") + ")"
			// FIXME
            // will always loop the results but cleans it up if not a batch return at the end..
			// in other words, this could be faster
			var win = function (xxx, results) {
				var o
				,   r
                ,   lookup = {}
                // map from results to keys
				for (var i = 0, l = results.rows.length; i < l; i++) {
					o = JSON.parse(results.rows.item(i).value)
					o.key = results.rows.item(i).id
                    lookup[o.key] = o;
				}
                r = args.map(function(key) { return lookup[key]; });
				if (!that.isArray(keyOrArray)) r = r.length ? r[0] : null
				if (cb) that.lambda(cb).call(that, r)
            }
            this.db.transaction(function(t){ t.executeSql(sql, args, win, fail) })
            return this 
		},

		exists: function (key, cb) {
			var is = "SELECT * FROM " + this.record + " WHERE id = ?"
			,   that = this
			,   win = function(xxx, results) { if (cb) that.fn('exists', cb).call(that, (results.rows.length > 0)) }
			this.db.transaction(function(t){ t.executeSql(is, [key], win, fail) })
			return this
		},

		all: function (callback) {
			var that = this
			,   all  = "SELECT * FROM " + this.record
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

		remove: function (keyOrArray, cb) {
			var that = this
                        ,   args
			,   sql  = "DELETE FROM " + this.record + " WHERE id "
			,   win  = function () { if (cb) that.lambda(cb).call(that) }
                        if (!this.isArray(keyOrArray)) {
                            sql += '= ?';
                            args = [keyOrArray];
                        } else {
                            args = keyOrArray;
                            sql += "IN (" +
                                args.map(function(){return '?'}).join(',') +
                                ")";
                        }
                        args = args.map(function(obj) {
                            return obj.key ? obj.key : obj;
                        });

			this.db.transaction( function (t) {
			    t.executeSql(sql, args, win, fail);
			});

			return this;
		},

		nuke: function (cb) {
			var nuke = "DELETE FROM " + this.record
			,   that = this
			,   win  = cb ? function() { that.lambda(cb).call(that) } : function(){}
				this.db.transaction(function (t) { 
				t.executeSql(nuke, [], win, fail) 
			})
			return this
		}
//////
}})())
