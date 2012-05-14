/**
 * indexed db adapter
 * === 
 * - originally authored by Vivian Li
 *
 */ 

Lawnchair.adapter('indexed-db', (function(){
    
  function fail(e, i) { console.log('error in indexed-db adapter!', e, i); debugger; } ;
     
  function getIDB(){
    return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
  }; 
  
  
    
  return {
    
    valid: function() { return !!getIDB(); },
    
    init:function(options, callback) {
        this.idb = getIDB();
        this.waiting = [];
        var request = this.idb.open(this.name);
        var self = this;
        var cb = self.fn(self.name, callback);
        var win = function(){ return cb.call(self, self); }
        
        request.onsuccess = function(event) {
           self.db = request.result; 
            
            if(self.db.version != "1.0") {
              var setVrequest = self.db.setVersion("1.0");
              // onsuccess is the only place we can create Object Stores
              setVrequest.onsuccess = function(e) {
                  self.store = self.db.createObjectStore("teststore", { autoIncrement: true} );
                  for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                  }
                  self.waiting = [];
                  win();
              };
              setVrequest.onerror = function(e) {
                  console.log("Failed to create objectstore " + e);
                  fail(e);
              }
            } else {
                self.store = {};
                for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                }
                self.waiting = [];
                win();
            }
        }
        request.onerror = fail;
    },

    save:function(obj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.save(obj, callback);
            });
            return;
         }
         
         var self = this;
         var win  = function (e) { if (callback) { obj.key = e.target.result; self.lambda(callback).call(self, obj) }};
         
         var trans = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE);
         var store = trans.objectStore("teststore");
         var request = obj.key ? store.put(obj, obj.key) : store.put(obj);
         
         request.onsuccess = win;
         request.onerror = fail;
         
         return this;
    },
    
    // FIXME this should be a batch insert / just getting the test to pass...
    batch: function (objs, cb) {
        
        var results = []
        ,   done = false
        ,   self = this

        var updateProgress = function(obj) {
            results.push(obj)
            done = results.length === objs.length
        }

        var checkProgress = setInterval(function() {
            if (done) {
                if (cb) self.lambda(cb).call(self, results)
                clearInterval(checkProgress)
            }
        }, 200)

        for (var i = 0, l = objs.length; i < l; i++) 
            this.save(objs[i], updateProgress)
        
        return this
    },
    

    get:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.get(key, callback);
            });
            return;
        }
        
        
        var self = this;
        var win  = function (e) { if (callback) { self.lambda(callback).call(self, e.target.result) }};
        
        
        if (!this.isArray(key)){
            var req = this.db.transaction("teststore").objectStore("teststore").get(key);

            req.onsuccess = win;
            req.onerror = function(event) {
                console.log("Failed to find " + key);
                fail(event);
            };
        
        // FIXME: again the setInterval solution to async callbacks..    
        } else {

            // note: these are hosted.
            var results = []
            ,   done = false
            ,   keys = key

            var updateProgress = function(obj) {
                results.push(obj)
                done = results.length === keys.length
            }

            var checkProgress = setInterval(function() {
                if (done) {
                    if (callback) self.lambda(callback).call(self, results)
                    clearInterval(checkProgress)
                }
            }, 200)

            for (var i = 0, l = keys.length; i < l; i++) 
                this.get(keys[i], updateProgress)
            
        }

        return this;
    },

    all:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.all(callback);
            });
            return;
        }
        var cb = this.fn(this.name, callback) || undefined;
        var self = this;
        var objectStore = this.db.transaction("teststore").objectStore("teststore");
        var toReturn = [];
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
               toReturn.push(cursor.value);
               cursor.continue();
          }
          else {
              if (cb) cb.call(self, toReturn);
          }
        };
        return this;
    },

    remove:function(keyOrObj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.remove(keyOrObj, callback);
            });
            return;
        }
        if (typeof keyOrObj == "object") {
            keyOrObj = keyOrObj.key;
        }
        var self = this;
        var win  = function () { if (callback) self.lambda(callback).call(self) };
        
        var request = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE).objectStore("teststore").delete(keyOrObj);
        request.onsuccess = win;
        request.onerror = fail;
        return this;
    },

    nuke:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.nuke(callback);
            });
            return;
        }
        
        var self = this
        ,   win  = callback ? function() { self.lambda(callback).call(self) } : function(){};
        
        try {
            this.db
                .transaction(["teststore"], webkitIDBTransaction.READ_WRITE)
                .objectStore("teststore").clear().onsuccess = win;
            
        } catch(e) {
            fail();
        }
        return this;
    }
    
  };
  
})());