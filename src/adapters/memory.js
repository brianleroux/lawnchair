Lawnchair.adapter('memory', (function(){

    var storage = {}, index = []

    return {
        valid: function() { return true },

        init: function(opts, cb) {
            this.fn(this.name, cb).call(this, this)
            return this
        },

        keys: function() { return index },

        save: function(obj, cb) {
            var key = obj.key || this.uuid()
            
            if (obj.key) delete obj.key 
           
            this.exists(key, function(exists) {
                if (!exists) index.push(key)

                storage[key] = obj
                
                if (cb) {
                    obj.key = key
                    this.lambda(cb).call(this, obj)
                }
            })

            return this
        },

        batch: function (objs, cb) {
            var r = []
            for (var i = 0, l = objs.length; i < l; i++) {
                this.save(objs[i], function(record) {
                    r.push(record)
                })
            }
            if (cb) this.lambda(cb).call(this, r)
            return this
        },

        get: function (keyOrArray, cb) {
            var r;
            if (this.isArray(keyOrArray)) {
                r = []
                for (var i = 0, l = keyOrArray.length; i < l; i++) {
                    r.push(storage[keyOrArray[i]]) 
                }
            } else {
                r = storage[keyOrArray]
                if (r) r.key = keyOrArray
            }
            if (cb) this.lambda(cb).call(this, r)
            return this 
        },

        exists: function (key, cb) {
            this.lambda(cb).call(this, !!(storage[key]))
            return this
        },

        all: function (cb) {
            var r = []
            for (var i = 0, l = index.length; i < l; i++) {
                var obj = storage[index[i]]
                obj.key = index[i]
                r.push(obj)
            }
            this.fn(this.name, cb).call(this, r)
            return this
        },

        remove: function (keyOrArray, cb) {
            var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
            for (var i = 0, l = del.length; i < l; i++) {
                delete storage[del[i]]
                index.splice(index.indexOf(del[i]), 1)
            }
            if (cb) this.lambda(cb).call(this)
            return this
        },

        nuke: function (cb) {
            storage = {}
            index = []
            if (cb) this.lambda(cb).call(this)
            return this
        }
    }
/////
})())
