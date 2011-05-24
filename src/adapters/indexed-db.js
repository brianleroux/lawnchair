/**
 * indexed db adapter
 * === 
 * - originally authored by Vivian Li
 *
 */ 

Lawnchair.adapter('indexed-db', {
    init:function(options) {
        this.idb = webkitIndexedDB || mozIndexedDB;
        this.waiting = [];
        var request = this.idb.open("atedzfdsts1db93z3441529");
        var self = this;
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
              };
              setVrequest.onerror = function(e) {
                  console.log("Failed to create objectstore " + e);
              }
            } else {
                self.store = {};
                for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                  }
                  self.waiting = [];
            }
        }
        request.onerror = function(e) {
            console.log(e);
        }
    },

    save:function(obj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.save(obj, callback);
            });
            return;
         }
         var trans = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE, 0);
         var store = trans.objectStore("teststore");
         var request = obj.key ? store.put(obj, obj.key) : store.put(obj);
         request.onsuccess = function(e) {
           obj.key = e.target.result;
           callback && callback(obj);
         };
  
         request.onerror = function(e) {
           console.log(e.value);
         };
    },

    get:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.get(key, callback);
            });
            return;
        }
        var req = this.db.transaction("teststore").objectStore("teststore").get(key);
        req.onsuccess = function(event) {
            callback & callback(event.target.result);
        };
        req.onerror = function(event) {
            console.log("Failed to find " + key);
            callback && callback(null);
        }
    },

    all:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.all(callback);
            });
            return;
        }
        var cb = this.terseToVerboseCallback(callback);
        var objectStore = this.db.transaction("teststore").objectStore("teststore");
        var toReturn = [];
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
               toReturn.push(cursor.value);
               cursor.continue();
          }
          else {
              cb(toReturn);
          }
        };
            
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
        var request = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE).objectStore("teststore").delete(keyOrObj);
        request.onsuccess = function(event) {
            callback && callback();
        };
    },

    nuke:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.nuke(callback);
            });
            return;
        }
        try {
        var transaction = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE);
        transaction.objectStore("teststore").clear().onsuccess = function(e) {
            callback && callback();
        }
        } catch(e2) {
            callback && callback();
        }
    }
});
