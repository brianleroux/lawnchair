/**
 * DOMStorageAdaptor
 * ===================
 * DOM Storage implementation for Lawnchair.
 *
 */
var DOMStorageAdaptor = function(options) {
    for (var i in LawnchairAdaptorHelpers) {
        this[i] = LawnchairAdaptorHelpers[i];
    }
    this.init(options);
};


DOMStorageAdaptor.prototype = {
    init:function(options) {
        this.storage = this.merge(window.localStorage, options.storage);

        if (!(this.storage instanceof window.Storage))
            throw('Lawnchair, "This browser does not support DOM Storage or provided storage was invalid."');
    },

    save:function(obj, callback) {
        var id = obj.key || this.uuid();
        delete obj.key;
        this.storage.setItem(id, this.serialize(obj));
        if (callback)
            callback(obj);
    },

    get:function(key, callback) {
        var obj = this.deserialize(this.storage.getItem(key));
        if (obj) {
            obj.key = key;
            if (callback)
                callback(obj);
        }
    },

    all:function(callback) {
        var cb = this.terseToVerboseCallback(callback);
        var results = [];
        for (var i = 0, len = this.storage.length; i < len; ++i) {
            var key = this.storage.key(i);
            var obj = this.deserialize(this.storage.getItem(key));
            obj.key = key;
            results.push(obj);
        }

        if (cb)
            cb(results);
    },

    remove:function(keyOrObj) {
        var key = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key;
        this.storage.removeItem(key);
    },

    nuke:function() {
        this.storage.clear();
    }
};
