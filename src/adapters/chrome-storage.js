/**
 * chrome.storage storage adapter 
 * === 
 * - originally authored by Joseph Pecoraro
 *
 */ 
//
// Oh, what a tangled web we weave when a callback is what we use to receive - jrschifa
//
Lawnchair.adapter('chrome-storage', (function() {
    var storage = chrome.storage.local

    var indexer = function(name) {
        return {
            // the key
            key: name + '._index_',
            // returns the index
            all: function(callback) {
                var _this = this

                var initStorage = function() {
                    var obj = JSON.stringify([])
                    var _set = {}
                    _set[_this.key] = obj
                    storage.set(_set)

                    obj = JSON.parse(obj)

                    return obj
                }

                storage.get(this.key, function(items) {
                    var obj
                    if (Object.keys(items).length > 0) {
                        for (itemKey in items) {
                            obj = items[itemKey]
                            if (obj) {
                                obj = JSON.parse(obj)
                            }

                            if (obj === null || typeof obj === 'undefined') {
                                obj = initStorage()
                            } 
                            
                            if (callback) {
                                callback(obj)
                            }
                        }
                    } else {
                        obj = initStorage()
                        callback(obj)
                    }
                })
            },
            // adds a key to the index
            add: function (key) {
                this.all(function(a) {
                    a.push(key)
                
                    var _set = {}
                    _set[this.key] = JSON.stringify(a)
                    storage.set(_set)
                })  
            },
            // deletes a key from the index
            del: function (key) {
                var r = []
                this.all(function(a) {    
                    for (var i = 0, l = a.length; i < l; i++) {
                        if (a[i] != key) r.push(a[i])
                    } 

                    var _set = {}
                    _set[this.key] = JSON.stringify(r) 
                    storage.set(_set)
                })
            },
            // returns index for a key
            find: function (key, callback) {
                this.all(function(a) {
                    for (var i = 0, l = a.length; i < l; i++) {
                        if (key === a[i]) {
                            if (callback) callback(i)
                        } 
                    }
                    
                    if (callback) callback(false)
                })    
            }
        }
    }
    
    // adapter api 
    return {
    
        // ensure we are in an env with chrome.storage 
        valid: function () {
            return !!storage && function() {
                // in mobile safari if safe browsing is enabled, window.storage
                // is defined but setItem calls throw exceptions.
                var success = true
                var value = Math.random()
                value = "" + value + "" //ensure that we are dealing with a string
                try {
                    var _set = {}
                    _set[value] = value;
                    storage.set(_set)
                } catch (e) {
                    success = false
                }
                storage.remove(value)
                return success
            }()
        },

        init: function (options, callback) {
            this.indexer = indexer(this.name)
            if (callback) this.fn(this.name, callback).call(this, this)  
        },
        
        save: function (obj, callback) {
            var key = obj.key ? this.name + '.' + obj.key : this.name + '.' + this.uuid()
            // if the key is not in the index push it on
            if (this.indexer.find(key) === false) this.indexer.add(key)
            // now we kil the key and use it in the store colleciton    
            delete obj.key;
            var _set = {}
            _set[key] = JSON.stringify(obj)
            storage.set(_set)
            obj.key = key.slice(this.name.length + 1)
            if (callback) {
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
        keys: function(callback) {
            if (callback) { 
                var _this = this
                var name = this.name
                var keys

                this.indexer.all(function(data) {
                    keys = data.map(function(r) {
                       return r.replace(name + '.', '')   
                    })

                    _this.fn('keys', callback).call(_this, keys)
                })
            }
            return this
        },
        
        get: function (key, callback) {
            var _this = this
            var obj

            if (this.isArray(key)) {
                var r = []
                for (var i = 0, l = key.length; i < l; i++) {
                    var k = this.name + '.' + key[i]

                    storage.get(k, function(items) {
                        if (items) {
                            for (itemKey in items) {
                                obj = items[itemKey]
                                obj = JSON.parse(obj)
                                obj.key = itemKey.replace(_this.name + '.', '')
                                r.push(obj)
                            }
                        }

                        if (i == l) {
                            if (callback) _this.lambda(callback).call(_this, r)
                        }
                    })
                }
            } else {
                var k = this.name + '.' + key
                
                storage.get(k, function(items) {
                    if (items) {
                        for (itemKey in items) {
                            obj = items[itemKey]
                            obj = JSON.parse(obj)
                            obj.key = itemKey.replace(_this.name + '.', '')
                        }
                    }  
                    if (callback) _this.lambda(callback).call(_this, obj)
                })        
            }
            return this
        },

        exists: function (key, callback) {
            var _this = this
            this.indexer.find((this.name+'.'+key), function(response) {
                response = (response === false) ? false : true;
                _this.lambda(callback).call(_this, response)            
            })
            
            return this;
        },
        // NOTE adapters cannot set this.__results but plugins do
        // this probably should be reviewed
        all: function (callback) {
            var _this = this

            this.indexer.all(function(idx) {
                //console.log('adapter all');
                //console.log(idx);
                var r = []
                ,   o
                ,   k

                //console.log(idx);
                if (idx.length > 0) {
                    for (var i = 0, l = idx.length; i < l; i++) {
                        storage.get(idx[i], function(items) {
                            for (k in items) {
                                o = JSON.parse(items[k])
                                o.key = k.replace(_this.name + '.', '')
                                r.push(o)
                            }

                            if (i == l) {
                                if (callback) _this.fn(_this.name, callback).call(_this, r)
                            } 
                        })
                    }
                } else {
                    if (callback) _this.fn(_this.name, callback).call(_this, r)
                }    
            })
            return this  
        },
        
        remove: function (keyOrObj, callback) {
            var key = this.name + '.' + ((keyOrObj.key) ? keyOrObj.key : keyOrObj)
            this.indexer.del(key)
            storage.remove(key)
            if (callback) this.lambda(callback).call(this)
            return this
        },
        
        nuke: function (callback) {
            //could probably just use storage.clear() hear
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) {
                    r[i] = "" + r[i] + ""
                    this.remove(r[i]);
                }
                if (callback) this.lambda(callback).call(this)
            })
            return this 
        }
}})());
