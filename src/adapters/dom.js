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
        return !!window.Storage 
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
