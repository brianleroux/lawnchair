// Original author: Chris Anderson jchris@couchbase.com
// Copyright 2013 Couchbase
Lawnchair.adapter('touchdb-couchdb', (function(){
    function makePath (base, path) {
        var k, q, query = [], first = true, uri;
        if (path) {
            if ($.isArray(path)) {
                if (typeof path[path.length-1] == 'object') {
                    q = path[path.length-1];
                    path = path.slice(0, path.length-1);
                    for (k in q) {
                        if (['startkey', 'endkey', 'start_key', 'end_key', 'key'].indexOf(k) !== -1) {
                            v = JSON.stringify(q[k])
                        } else {
                            v = q[k];
                        }
                        query.push(encodeURIComponent(k)+'='+encodeURIComponent(v.toString()));
                    }
                    query = query.join('&');
                }
                uri = (path.map(encodeURIComponent)).join('/');
                if (query.toString()) {
                    uri = uri + "?" + query.toString();
                }
                return base + "/" + uri;
            } else {
                return base + "/" + path;
            }
        } else {
            return base;
        }
    }

    function makeDb(dbName) {
        if (location.protocol === 'file:') {
            console.log("file:// url, so assume TouchDB-iOS is whitelisted at http://localhost.touchdb./")
            dbName = "http://localhost.touchdb./"+dbName;
        } else {
            console.log("assume CouchDB is reachable at "+location.origin);
            dbName = "/"+dbName;
        }
        function dbReq(/* path, json, cb */) {
            var cb, opts = {
                contentType : "application/json",
                type : this
            };
            if (typeof arguments[0] == 'function') {
                // the db path
                cb = arguments[0];
                opts.url = makePath(dbName);
            } else if (typeof arguments[1] == 'function') {
                // new path
                cb = arguments[1];
                opts.url = makePath(dbName, arguments[0]);
            } else {
                // we have a body
                cb = arguments[2];
                opts.url = makePath(dbName, arguments[0]);
                opts.data = JSON.stringify(arguments[1]);
            }
            opts.complete = function(xhr, code) {
                var body;
                try {
                    body = JSON.parse(xhr.responseText);
                } catch(e) {
                    body = xhr.responseText;
                }
                if (xhr.status >= 400) {
                    if (body.error) {
                        cb(body, xhr);
                    } else {
                        cb(xhr.status, body, xhr)
                    }
                } else {
                    cb(null, body);
                }
            };
            return $.ajax(opts);
        }
        function allReq(){
            return dbReq.apply("GET", arguments);
        };
        "get put post head del".split(" ").forEach(function(v){
            allReq[v] = function() {
                var type;
                if (v == "del") {
                    type = "DELETE";
                } else {
                    type = v.toUpperCase();
                }
                return dbReq.apply(type, arguments);
            }
        });
        return allReq;
    }

    function forceSave(db, objs, cb) {
        JSON.stringify(objs); // to catch cyclic errors while we can
        db.post("_all_docs", {keys:objs.map(function(o){return o._id;})},
            function(err, view) {
            if (err) return cb(err);
            for (var i = 0; i < view.rows.length; i++) {
                if (view.rows[i].value) {
                    objs[i]._rev = view.rows[i].value.rev;
                }
            };
            db.post("_bulk_docs", {docs:objs}, function(err, ok) {
                if (err) return cb(err);
                for (var i = 0; i < ok.length; i++) {
                    objs[i]._rev = ok[i].rev;
                };
                cb(null, objs);
            });
        });
    };

    return {
        valid: function() {
            if ($ && typeof $.ajax == "function") {
                return true;
            } else {
                console.log("touchdb-couchdb Lawnchair adapter requires Zepto or jQuery for $.ajax()");
                return false;
            }
        },

        init: function (options, callback) {
            var self = this;
            this.name = options.name;
            this.db = makeDb(this.name);
            this.db.put(function(err, ok) {
                if (err && err.error !== "file_exists") {
                    throw(err);
                } else {
                    self.fn(self.name, callback).call(self, self);
                }
            });
            return this;
        },

        keys: function (cb) {
            var self = this;
            this.db("_all_docs", function(err, view){
                var ids = [];
                if (!err && view.rows) {
                    ids = view.rows.map(function(r){return r.id;});
                }
                self.fn('keys', cb).call(this, ids);
            });
            return this;
        },
        save: function(obj, cb) {
            obj._id = obj.key = obj.key || this.uuid();
            var self = this;
            forceSave(self.db, [obj], function(err){
                if (err) throw(err);
                if (cb) {
                    self.lambda(cb).call(self, obj)
                }
            });
            return this;
        },

        batch: function (objs, cb) {
            var self = this;
            objs = objs.map(function(obj) {
                obj._id = obj.key = obj.key || self.uuid();
                return obj;
            });
            forceSave(self.db, objs, function(err){
                if (err) throw(err);
                if (cb) {
                    self.lambda(cb).call(self, objs)
                }
            });
            return this;
        },

        get: function (keyOrArray, cb) {
            var self = this;
            var keys = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray];
            this.db.post(["_all_docs", {include_docs:true}], {keys:keys}, function(err, view) {
                if (err) throw (err);
                var docs = [];
                view.rows.forEach(function(r){
                    docs.push(r.doc||null);
                });
                if (cb) {
                    if (self.isArray(keyOrArray)) {
                        self.lambda(cb).call(self, docs);
                    } else {
                        self.lambda(cb).call(self, docs[0]);
                    }
                }
            });
            return this;
        },

        exists: function (key, cb) {
            this.get(key, function(doc){
                this.lambda(cb).call(this, !!doc);
            });
            return this;
        },

        all: function (cb) {
            var self = this;
            this.db(["_all_docs", {include_docs:true}], function(err, view){
                var docs = [];
                if (!err && view.rows) {
                    docs = view.rows.map(function(r){return r.doc;});
                }
                self.fn(self.name, cb).call(self, docs);
            });
            return this;
        },

        remove: function (keyOrArray, cb) {
            var dels = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray];
            var self = this;
            dels = dels.map(function(d){
                var id = d.key || d;
                return {_id : id, _deleted : true};
            });
            forceSave(this.db, dels, function(err) {
                if (err) throw (err);
                if (cb) self.lambda(cb).call(self);
            });
            return this;
        },

        nuke: function (cb) {
            // nuke leaves us with an empty database
            var self = this;
            this.db.del(function(err, ok) {
                if (err) {
                    throw(err);
                } else {
                    self.db.put(function(err, ok) {
                        if (err && !(err.error == "file_exists")) {
                            throw (err);
                        }
                        if (cb) self.lambda(cb).call(self)
                    });
                }
            });
            return this;
        }
    }
/////
})())
