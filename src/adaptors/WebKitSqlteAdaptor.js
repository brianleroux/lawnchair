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
		this.db.transaction(function(tx) {
			tx.executeSql(
				"DELETE FROM " + that.table, 
				[], 
				that.onData, 
				that.onError
			);
		});		
	}
};
