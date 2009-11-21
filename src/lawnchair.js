/**
 * Lawnchair
 * =========
 * A lightweight key / value store wherein the value is expected to be a JSON object. 
 * 
 * Features
 * --------
 * - micro tiny storage without the nasty SQL: pure and delicious JSON
 * - clean and simple oo design with one db table per store
 * - key/value store.. except you don't even have to care about the keys if you don't want to
 * - happily and handily will treat your store as an array of objects
 * - built on SQLite CRUD
 * - searching and therefore finding of objects
 * - conforms to the jetpack spec and adds some love based on pragmatic usage. 
 * 
 */
var Lawnchair = function(options) {
	this.init(options);
}

Lawnchair.prototype = {
	
	init:function(options) {
		var that = this;
		var merge = that.merge;
		
		// default properties
		this.name 		= merge('Lawnchair', options.name	 );
		this.version 	= merge('1.0',       options.version );
		this.table 		= merge('field',     options.table	 );
		this.display 	= merge('shed',      options.display );
		this.max 		= merge(65536,       options.max	 );
		this.db 		= merge(null,        options.db		 );
		
		// default sqlite callbacks
		this.onError 	= function(){}; // merge(function(t,e){console.log(e.message)}, options.onError);
		this.onData  	= function(){}; // merge(function(r){console.log(r)}, options.onData);
		
		// error out on shit browsers 
		if (!window.openDatabase) throw('Lawnchair, "wtf man. weak sauce is weak. this browser is not sqlite storage friendly."');
		
		// instantiate the store
		this.db = openDatabase(this.name, this.version, this.display, this.max);
		
		// create a default database and table if one does not exist
		this.db.transaction(function(tx) {
			tx.executeSql("SELECT COUNT(*) FROM " + that.table, [], function(){}, function(tx, error) {
				tx.executeSql("CREATE TABLE "+ that.table + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)", [], function(){}, that.onError);
			});
		});
	},

	
	/**
	 * Invokes a callback on an object with the matching key.
	 * 
	 */
	get:function(key, callback) {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("SELECT value FROM " + that.table + " WHERE id = ?", [key], 
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
	
	
	/**
	 * Saves an object in the store. If the key exists it will be updated otherwise the record will be created.
	 * 
	 */
	set:function(key, val, callback) {
		val.key = key;
		this.save(val);
	},
	
	
	/**
	 * Removes a json object from the store.
	 * 
	 */
	remove:function(obj) {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("DELETE FROM " + that.table + " WHERE id = ?", [obj.key], that.onData, that.onError);
		});
	},
	
	
	/**
	 * Save an object to the store. If an key is present then it is updated. Otherwise a new record is created. Reads cleaner to me.
	 * 
	 */
	save:function(obj, callback) {
		var that = this;
		// check to see if the object.key is present
		if (obj.key != undefined) {
			// ensure that the object id being saved is valid
			this.get(obj.key, function(r) {
				// update the object in the database
				that.db.transaction(function(t) {
					var id = obj.key;    // grab a copy and then..
					delete(obj.key) 	 // remove the key from the store
					t.executeSql("UPDATE " + that.table + " SET value=?, timestamp=? WHERE id=?",[that.serialize(obj), that.now(), id], that.onData, that.onError);
				});
			});
		} else {
			// add the object to the storage
			this.db.transaction(function(t) {
				t.executeSql("INSERT INTO " + that.table + " (value,timestamp) VALUES (?,?)", [that.serialize(obj), that.now()], that.onData, that.onError);
			});
		}
	},
	
	
	/**
	 * Cleans out a table and returns self. FIXME should nuke the store comletely?
	 * 
	 */
	nuke:function() {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("DELETE FROM " + that.table, [], that.onData, that.onError);
		});		
		return this || that;	
	},
	
	
	/**
	 * Iterator that accepts two function paramters: the first to test for a record and the second invoke on matches.
	 * 
	 */
	find:function(condition, callback) {
		this.each(function(record, index) {
			if (condition(record)) callback(record, index)
		});
	},
	
	
	/**
	 * Iterates all the rows invoking the callback. Passes the record and the index as the second parameter to the callback.
	 * 
	 */
	each:function(callback) {
		this.all(function(results) {
			for (var i = 0; i < results.length; i++) {
				callback(results[i], i)
			}
		});
	},
	
	
	/**
	 * Returns all rows to a callback.
	 * 
	 */
	all:function(callback) {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("SELECT * FROM " + that.table, [], function(tx, results) {
				if (results.rows.length == 0 ) {
					callback([]);
				} else {
					var r = [];
					for (var i = 0; i < results.rows.length; i++) {
						var raw = results.rows.item(i).value;
						var obj = that.deserialize(raw)
						obj.key = results.rows.item(i).id;
						r.push(obj);
					}
					callback(r) 
				}
			}, 
			that.onError);
		});
	},
	
	//
	// helper methods
	// --------------
	// - consider these semiprivate however...
	// - do not care for those sorts of abstractions and would prefer to use tests/specs to prove the API
	//
	
	// merging default properties with user defined args
	merge:function(defaultOption, userOption) {
		return (userOption == undefined || userOption == null) ? defaultOption : userOption;
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
	
// --	
};