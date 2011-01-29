/**
 * dom storage adaptor 
 * === 
 * - originally authored by Joseph Pecoraro
 * - window.name code courtesy Remy Sharp: http://24ways.org/2009/breaking-out-the-edges-of-the-browser
 *
 */
Lawnchair.adaptor('dom', {
    // ensure we are in an env with localStorage or, failing that, window.top.name 
    // this should work in all desktop browsers and most mobile browsers 
    // TODO test older blackberry and nokia for window.name hack
    valid: function () {
        return (window.Storage || typeof(window.top.name) != 'undefined') 
    },
    // TODO options.name default in lawnchair.js base
	init: function (options, callback) {
		this.table   = options && options.name ?  options.name : 'lawnchair'
        this.storage = (function () {
            // default to localStorage
            if (window.Storage) return window.localStorage
            // window.top.name ensures top level, and supports around 2Mb
            var data = window.top.name ? JSON.parse(window.top.name) : {};
            return {
                setItem: function (key, value) {
                    data[key] = value + ''; // force to string
                    window.top.name = JSON.stringify(data);
                },
                removeItem: function (key) {
                    delete data[key];
                    window.top.name = JSON.stringify(data);
                },
                getItem: function (key) {
                    return data[key] || null;
                },
                clear: function () {
                    data = {};
                    window.top.name = '';
                }
            };
        })();

        if (callback) this.lambda(callback).call(this);
	},
	
    save: function (obj, callback) {
		var id = this.table + '::' + (obj.key || this.uuid());
		delete obj.key;
		this.storage.setItem(id, JSON.stringify(obj));
		if (callback) {
		    obj.key = id.split('::')[1];
            this.lambda(callback).call(this, obj);
		}
	},

    batch: function (ary, callback) {
        var saved = []
        for (var i = 0, l = ary.length; i < l; i++) {
            var obj = ary[i]
            if (typeof obj.key === 'undefined') obj.key = this.uuid()
            var id = this.table + '::' + obj.key
            saved.push(obj)
		    this.storage.setItem(id, JSON.stringify(obj));
        }
        if (callback) this.lambda(callback).call(this, saved)
    },
    
    get: function (key, callback) {
        var obj = JSON.parse(this.storage.getItem(this.table + '::' + key))
          , cb = this.lambda(callback);
       
        if (obj) {
            obj.key = key;
            if (callback) cb.call(this, obj);
        } else {
			if (callback) cb.call(this, null);
		}
    },

	all: function (callback) {
		var cb = this.lambda(callback)
		,   results = []
		for (var i = 0, l = this.storage.length; i < l; ++i) {
			var id = this.storage.key(i)
			,   tbl = id.split('::')[0]
			,   key = id.split('::').slice(1).join("::")
			if (tbl == this.table) {
				var obj = JSON.parse(this.storage.getItem(id));
				obj.key = key;
				results.push(obj);
			}
		}
		if (cb)
			cb.call(this, results);
	},
	
    remove: function (keyOrObj, callback) {
		var key = this.table + '::' + (typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key)
		,   cb = this.lambda(callback)
		this.storage.removeItem(key);
		if (cb)
			cb.call(this);
	},

	nuke: function (callback) {
		var self = this
        ,   cb = this.lambda(callback);
		this.all(function(r) {
			for (var i = 0, l = r.length; i < l; i++) {
				self.remove(r[i]);
			}
			if (cb)
			    cb.call(self);
		});
        return self;
	}
});
