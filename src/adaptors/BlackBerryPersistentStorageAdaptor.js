/**
 * BlackBerryPersistentStorageAdaptor
 * ===================
 * Implementation that uses the BlackBerry Persistent Storage mechanism. This is only available in PhoneGap BlackBerry projects
 * See http://www.github.com/phonegap/phonegap-blackberry
 *
 */
var BlackBerryPersistentStorageAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};

BlackBerryPersistentStorageAdaptor.prototype = {
	init:function() {
		// Check for the existence of the phonegap blackberry persistent store API
		if (!navigator.store)
			throw('Lawnchair, "This browser does not support BlackBerry Persistent Storage; it is a PhoneGap-only implementation."');
	},
	get:function(key, callback) {
		var that = this;
		navigator.store.get(function(value) { // success cb
			if (callback)
            	that.terseToVerboseCallback(callback)(value);
		}, function() {}, // empty error cb
		key);
	},
	save:function(obj, callback) {
		var id = obj.key || this.uuid();
		delete obj.key;
		var that = this;
		navigator.store.put(function(){
			var cbObj = obj;
			cbObj.key = id;
			if (callback)
				that.terseToVerboseCallback(callback)(cbObj);
		}, function(){}, id, this.serialize(obj));
	},
	all:function(callback) {
		var that = this;
		navigator.store.getAll(function(json) { // success cb
			if (callback)
				that.terseToVerboseCallback(callback)(json);
		}, function() {}); // empty error cb
	},
	remove:function(keyOrObj, callback) {
		var key = (typeof keyOrObj == 'string') ? keyOrObj : keyOrObj.key;
		var that = this;
		navigator.store.remove(function() {
			if (callback)
		    	that.terseToVerboseCallback(callback)();
		}, function() {}, key);
	},
	nuke:function(callback) {
		var that = this;
		navigator.store.nuke(function(){
			if (callback)
		    	that.terseToVerboseCallback(callback)();
		},function(){});
	}
};