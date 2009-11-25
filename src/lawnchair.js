/**
 * Lawnchair
 * =========
 * A lightweight JSON document store.
 * 
 */
var Lawnchair = function(opts) {
	this.init(opts);
}

Lawnchair.prototype = {
	
	init:function(opts) {this.adaptor = new WebkitSQLiteAdaptor(opts)},

	// Invokes a callback on an object with the matching key.
	get:function(key, callback) {this.adaptor.get(key, callback)},
		
	// Removes a json object from the store.
	remove:function(keyOrObj) {this.adaptor.remove(keyOrObj)},
	
	// Save an object to the store. If a key is present then update. Otherwise create a new record.
	save:function(obj, callback) {this.adaptor.save(obj, callback)},
	
 	// Removes all documents from a store and returns self. 
	nuke:function() {return this.adaptor.nuke()},
	
 	// Returns all rows to a callback.
	all:function(callback) {this.adaptor.all(callback)},
	
	/**
	 * Iterator that accepts two paramters (methods or eval strings):
	 * 
	 * - conditional test for a record
	 * - callback to invoke on matches
	 * 
	 */
	find:function(condition, callback) {
		var is = (typeof condition == 'string') ? function(r){return eval(condition)} : condition;
		var cb = this.terseToVerboseCallback(callback);
		
		this.each(function(record, index) {
			if (is(record)) cb(record, index); // thats hot
		});
	},
	
	
	/**
	 * Classic iterator. 
	 * - Passes the record and the index as the second parameter to the callback.
	 * - Accepts a string for eval or a method to be invoked for each document in the collection.
	 */
	each:function(callback) {
		var cb = this.terseToVerboseCallback(callback);
		this.all(function(results) {
			var l = results.length;
			for (var i = 0; i < l; i++) {
				cb(results[i], i)
			}
		});
	}
// --	
};



/**
 * LawnchairAdaptorHelpers
 * =======================
 * Useful helpers for creating Lawnchair stores. Used as a mixin.
 * 
 */
var LawnchairAdaptorHelpers = {
	
	// merging default properties with user defined args
	merge:function(defaultOption, userOption) {
		return (userOption == undefined || userOption == null) ? defaultOption : userOption;
	},
	
	// awesome shorthand callbacks as strings. this is shameless theft from dojo.
	terseToVerboseCallback:function(callback) {
		return (typeof arguments[0] == 'string') ? function(r, i){eval(callback)} : callback;
	},
	
	// Returns current datetime for timestamps.
	now:function() { 
		return new Date().getTime(); 
	},
	
	// Returns a unique identifier
	uuid:function(len, radix) {
		// based on Robert Kieffer's randomUUID.js at http://www.broofa.com
	  	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 
		var uuid = [];
	    radix = radix || chars.length;

	    if (len) {
	      	for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
	    } else {
	      	// rfc4122, version 4 form
	      	var r;

	      	// rfc4122 requires these characters
	      	uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	      	uuid[14] = '4';

	      	// Fill in random data.  At i==19 set the high bits of clock sequence as
	      	// per rfc4122, sec. 4.1.5
	      	for (var i = 0; i < 36; i++) {
	        	if (!uuid[i]) {
	          		r = 0 | Math.random()*16;
	          		uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	        	}
	      	}
		}
	    return uuid.join('');
	},
	
	// Serialize a JSON object as a string. 
	serialize:function(obj) {
		var r = '';
		
		if (typeof JSON != 'undefined') {
			r = JSON.stringify(obj);
		} else {
			// FIXME needs to be more robust! Native JSON support is cheating. ;)
			r = '{';
			var size = 0;
			for (var x in obj) {
				size++;
			}
			var len = 0;
			for (var i in obj) {
				len++
				// add the key
				r += '"' + i + '":'
				// add the value
				r += typeof obj[i] == 'string' ? '"' + obj[i] + '"' : obj[i];
				// add the comma if there are more pairs
				r += len < size ? ',' : '';
			}
			r += '}'	
		}
		
		return r;
	},
	
	// Deserialize JSON.
	deserialize:function(json) {
		return eval('(' + json + ')');
	}	
};



/**
 * WebkitSQLiteAdaptor
 * ===================
 * Sqlite implementation for Lawnchair.
 * 
 */
var WebkitSQLiteAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};


WebkitSQLiteAdaptor.prototype = {
	init:function(options) {
		var that = this;
		var merge = that.merge;
		var opts = (typeof arguments[0] == 'string') ? {table:options} : options;

		// default properties
		this.name 		= merge('Lawnchair', opts.name	  	);
		this.version 	= merge('1.0',       opts.version 	);
		this.table 		= merge('field',     opts.table	  	);
		this.display 	= merge('shed',      opts.display 	);
		this.max 		= merge(65536,       opts.max	  	);
		this.db 		= merge(null,        opts.db		);

		// default sqlite callbacks
		this.onError 	= function(){}; // merge(function(t,e){console.log(e.message)}, options.onError);
		this.onData  	= function(){}; // merge(function(r){console.log(r)}, options.onData);

		// error out on shit browsers 
		if (!window.openDatabase) 
			throw('Lawnchair, "This browser does not support sqlite storage."');

		// instantiate the store
		this.db = openDatabase(this.name, this.version, this.display, this.max);

		// create a default database and table if one does not exist
		this.db.transaction(function(tx) {
			tx.executeSql("SELECT COUNT(*) FROM " + that.table, [], function(){}, function(tx, error) {
				tx.executeSql("CREATE TABLE "+ that.table + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)", [], function(){}, that.onError);
			});
		});
	},
	save:function(obj, callback) {
		var that = this;

		// check to see if the object.key is present
		if (obj.key != undefined) {
			// FIXME ensure that the object id being saved is valid
			this.get(obj.key, function(r) {
				// update the object in the database
				that.db.transaction(function(t) {
					var id = obj.key;    // grab a copy and then..
					delete(obj.key) 	 // remove the key from the store
					t.executeSql(
						"UPDATE " + that.table + " SET value=?, timestamp=? WHERE id=?",
						[that.serialize(obj), that.now(), id], 
						function(tx, results) {
							if (callback != undefined) {
								obj.key = id;
								callback(obj);	
							}
						}, 
						that.onError
					);
				});
			});
		} else {
			// add the object to the storage
			this.db.transaction(function(t) {
				if (obj.key == undefined) {
					var id = that.uuid()
				} else {
					var id = obj.key;
					delete(obj.key) 
				}
				t.executeSql(
					"INSERT INTO " + that.table + " (id, value,timestamp) VALUES (?,?,?)", 
					[id, that.serialize(obj), that.now()], 
					function(tx, results) {
						if (callback != undefined) {
							obj.key = id;
							callback(obj);	
						}
					}, 
					that.onError
				);
			});
		}
		
	},
	get:function(key, callback) {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql(
				"SELECT value FROM " + that.table + " WHERE id = ?", 
				[key], 
				function(tx, results) { 
					if (results.rows.length == 0) {
						callback(null);
					} else {
						var o = that.deserialize(results.rows.item(0).value);
						o.key = key;
						callback(o);
					}
				}, 
				this.onError
			);
		});
	},
	all:function(callback) {
		var cb = this.terseToVerboseCallback(callback);
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("SELECT * FROM " + that.table, [], function(tx, results) {
				if (results.rows.length == 0 ) {
					cb([]);
				} else {
					var r = [];
					var l = results.rows.length;
					for (var i = 0; i < l; i++) {
						var raw = results.rows.item(i).value;
						var obj = that.deserialize(raw)
						obj.key = results.rows.item(i).id;
						r.push(obj);
					}
					cb(r) 
				}
			}, 
			that.onError);
		});
	},
	remove:function(keyOrObj) {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql(
				"DELETE FROM " + that.table + " WHERE id = ?", 
				[(typeof keyOrObj == 'string') ? keyOrObj : keyOrObj.key], 
				that.onData, 
				that.onError
			);
		});
	},
	nuke:function() {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("DELETE FROM " + that.table, [], that.onData, that.onError);
		});		
		return this || that;
	}
};
