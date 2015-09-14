Lawnchair.adapter('webkit-sqlite', (function () {
    // private methods 
    var fail = function (e, i) { console.error('error in sqlite adaptor!', e, i) }
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
            ,   win    = function(){ if(cb) return cb.call(that, that); }

            if (cb && typeof cb != 'function') throw 'callback not valid';

            // open a connection and create the db if it doesn't exist 
            this.db = openDatabase(this.name, '1.0.0', this.name, options.size || 65536)
            this.db.transaction(function (t) { 
                t.executeSql(create, []) 
            }, fail, win)
        }, 

        keys:  function (callback) {
            var cb   = this.lambda(callback)
            ,   that = this
            ,   keys = "SELECT id FROM " + this.record + " ORDER BY timestamp DESC"

            this.db.readTransaction(function(t) {
                var win = function (xxx, results) {
                    if (results.rows.length == 0 ) {
                        cb.call(that, [])
                    } else {
                        var r = [];
                        for (var i = 0, l = results.rows.length; i < l; i++) {
                            var row_key = results.rows.item(i).id;
                            try{row_key = JSON.parse(row_key);}catch(exc){}
                            r.push(row_key);
                        }
                        cb.call(that, r)
                    }
                }
                t.executeSql(keys, [], win, fail)
            })
            return this
        },
        // you think thats air you're breathing now?
        save: function (obj, callback, error) {
          var that = this
          ,   objs = (this.isArray(obj) ? obj : [obj]).map(function(o){var row_key = that.keyEmbellish(o); return o})
          ,   ins  = "INSERT OR REPLACE INTO " + this.record + " (value, timestamp, id) VALUES (?,?,?)"
          ,   win  = function () { if (callback) { that.lambda(callback).call(that, that.isArray(obj)?objs:objs[0]) }}
          ,   error= error || function() {}
          ,   insvals = []
          ,   ts = now()

          try {
            for (var i = 0, l = objs.length; i < l; i++) {
              insvals[i] = [JSON.stringify(objs[i]), ts, JSON.stringify(that.keyExtraction(objs[i]))];
            }
          } catch (e) {
            fail(e)
            throw e;
          }

             that.db.transaction(function(t) {
            for (var i = 0, l = objs.length; i < l; i++)
              t.executeSql(ins, insvals[i])
             }, function(e,i){fail(e,i)}, win)

          return this
        }, 


        batch: function (objs, callback) {
          return this.save(objs, callback)
        },

        get: function (keyOrArray, cb) {
            var that = this
            ,   sql  = ''
            ,   args = (this.isArray(keyOrArray) ? keyOrArray : [keyOrArray])
                .map(function(row_key) {
					return((typeof(row_key)==='string')?(row_key):(JSON.stringify(row_key)));
				});
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
					var rowObj = results.rows.item(i);
                    o = JSON.parse(rowObj.value)
                    var row_key = rowObj.id;
                    lookup[row_key] = o;
                    try{row_key = JSON.parse(row_key);}catch(exc){}
                    //o.key = row_key;
                    o.timestamp = rowObj.timestamp;
                }
                r = args.map(function(row_key) {return lookup[row_key];});
                if (!that.isArray(keyOrArray)) r = r.length ? r[0] : null
                if (cb) that.lambda(cb).call(that, r)
            }
            this.db.readTransaction(function(t){ t.executeSql(sql, args, win, fail) })
            return this 
        },

        exists: function (row_key, cb) {
            var is = "SELECT * FROM " + this.record + " WHERE id = ?"
            ,   that = this
            ,   win = function(xxx, results) { if (cb) that.fn('exists', cb).call(that, (results.rows.length > 0)) }
            this.db.readTransaction(function(t){ t.executeSql(is, [row_key], win, fail) })
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
                        //obj.key = results.rows.item(i).id
                        r.push(obj)
                    }
                }
                if (cb) cb.call(that, r)
            }

            this.db.readTransaction(function (t) { 
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
                            return that.keyExtraction(obj)
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
}})());
