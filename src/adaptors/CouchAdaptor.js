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

// FIXME - should the constructor accept a callback? init of db could take a while..
CouchAdaptor.prototype = {
	init: function(options) {
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

	save: function(obj, callback) {
        if (obj.key) obj._id = obj.key;
        var result = this.db.save(obj)
          , cb = this.terseToVerboseCallback(callback);
        if (cb)
            cb(obj);
	},
    
    get: function(keyOrObject, callback) {
        var key = typeof keyOrObject == 'object' ? keyOrObject.key : keyOrObject
          , cb  = this.terseToVerboseCallback(callback);
        cb(this.db.open(key));
    },

	all: function(callback) {
        var map = function(doc) {
            if (!doc.key) doc.key = doc._id;  
            emit(doc.key, doc);
          }
          , docs = this.db.query(map)
          , cb = this.terseToVerboseCallback(callback)
          , result = []
          // FIXME - seems inefficient 
          for (var i = 0, l = docs.rows.length; i < l; i++) {
             result.push(docs.rows[i].value);
          }
        if (cb)   
            cb(result);
	},

	remove: function(keyOrObj, callback) {
        var cb = this.terseToVerboseCallback(callback)
          , me = this;
        if (typeof keyOrObj == 'object') {
            this.db.deleteDoc(keyOrObj);
            if (cb) 
                cb();
        } else {
            this.get(keyOrObj, function(r){ 
                me.db.deleteDoc(r);
                if (cb) 
                    cb();
            });
        }
	},

	nuke: function(cb) {
        this.db.deleteDb();
        this.db.createDb();
        if (cb)
            cb();
	}, 
    // FIXME - not sure this is the right way to do this; would be useful for conditional code
    // that wants to check for capabilties on adaptor. (Eg, store.adaptor.db.replicate())
    toString: function() {
        return 'couch'
    }
};
