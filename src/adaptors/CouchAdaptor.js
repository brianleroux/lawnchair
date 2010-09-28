/**
 * CouchAdaptor 
 * ============
 * Assumes http://localhost:5984/_utils/script/couch.js has been included. Not an unreasonable assumption.
 *
 */
var CouchAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};


CouchAdaptor.prototype = {
	init:function(options) {
        // TODO - make name required in all lawnchairs
        if (options.name == undefined)
            throw("name required for the couch adaptor. try: new Lawnchair({name:'store', adaptor:'couch'})");
        // FIXME - need to allow for running via CouchApp (rel path / no prefix)
        CouchDB.urlPrefix = "http://127.0.0.1:5984";         
        this.db = new CouchDB(options.name);
        // only create a db if it hasn't been
        if (CouchDB.allDbs().indexOf(options.name) == -1) 
            this.db.createDb();
	},

	save:function(obj, callback) {
        var result = this.db.save(obj)
          , cb = this.terseToVerboseCallback(callback);
        if (cb)
            cb(obj);
	},
    // FIXME - replace w/ native map/reduce method
    get:function(keyOrObject, callback) {
        var key = typeof keyOrObject == 'object' ? keyOrObject.key : keyOrObject
          , cb = this.terseToVerboseCallback(callback)
        this.all(function(r) {
            if (r.length) {
                for (var i = 0, l = r.length; i < l; i++) {
                    if (r[i].key == key) {
                        cb(r[i]);
                        return; 
                    };
                }
                cb(null); 
                return;
            } else {
                cb(null); 
            }
        });
    },

	all:function(callback) {
        var map = function(doc) {
            if (!doc.key) doc.key = doc._id;  
            //delete doc._rev; 
            //delete doc._id; 
            emit(doc.key, doc);
          }
          , docs = this.db.query(map)
          , cb = this.terseToVerboseCallback(callback)
          , result = []
          // FIXME - this is likely a reduce method eh
          for (var i = 0, l = docs.rows.length; i < l; i++) {
             result.push(docs.rows[i].value);
          }
        if (cb)   
            cb(result);
	},

	remove:function(keyOrObj, callback) {
        var cb = this.terseToVerboseCallback(callback)
          , me = this;
        if (typeof keyOrObj == 'object') {
            this.db.deleteDoc(keyOrObj);
            if (cb) cb();
        } else {
            this.get(keyOrObj, function(r){ 
                me.db.deleteDoc(r);
                if (cb) cb();
            });
        }
	},

	nuke:function(callback) {
        this.db.deleteDb();
        this.db.createDb();
	}
};
