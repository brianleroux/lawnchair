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

BlackBerryPersistentStorageAdaptor.prototype {
	init:function() {
		// Check for the existence of the phonegap blackberry persistent store API
		if (!navigator.store)
			throw('Lawnchair, "This browser does not support BlackBerry Persistent Storage; it is a PhoneGap-only implementation."');
	},
	get:function(key, callback) {
		var obj = null; // do i even need this? whatever, knowing how this shit works on blackberry it'll probably fail otherwise. same in 'all' i guess
		navigator.store.get(function(value) { // success cb
										obj = value;
									}, function() {}, // empty error cb
									key);
		if (callback)
            this.terseToVerboseCallback(callback)(obj);
	},
	save:function(obj, callback) {
		var id = obj.key || this.uuid();
		delete obj.key;
		// Call put with empty phonegap-level callbacks. Maybe don't call the lawnchair callback unless the phonegap-level success callback returns properly?
		navigator.store.put(function(){}, function(){}, id, this.serialize(obj));
		if (callback)
			this.terseToVerboseCallback(callback)(obj);
	},
	all:function(callback) {
		var obj = null;
		navigator.store.getAll(function(json) { // success cb
											obj = json;
										}, function() {}); // empty error cb
		if (callback)
			this.terseToVerboseCallback(callback)(obj);
	},
	remove:function(keyOrObj, callback) {
		var key = (typeof keyOrObj == 'string') ? keyOrObj : keyOrObj.key;
		navigator.store.remove(function() {}, function() {}, key);
		if (callback)
		    this.terseToVerboseCallback(callback)();
	},
	nuke:function(callback) {
		navigator.store.nuke(function(){},function(){});
		if (callback)
		    this.terseToVerboseCallback(callback)();
	}
};