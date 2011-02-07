/**
 * ServerAdaptor
 * ===================
 * Lawnchair implementation that leverages a server-side endpoint with a basic key/value store API available.
 * Requires that you have a server-side implementation exposed that returns JSON and accepts GET parameters as follows:
   *COMING SOON* id (optional, pass with all requests): some unique ID to differentiate between clients. Optional, up to you if you want to support it in your server-side implementation. 
   * nuke: presence of this parameter destroys the store.
   * get=key: returns object associated with key passed into 'get' parameter.
   * save=key: saves an object with key passed into the 'save' querystring parameter. server-side should read POST data for the JSON object to save.
   * all: presence of this parameter should return an array of all JSON objects stored.
   * remove=key: removes an object with key passed into the 'remove' querystring parameter.
 * 
 * NOTE: Initial purpose of this adapter is to use together with session-based server-side storage, for clients that have weak client-side storage support.
 */
var ServerAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};

ServerAdaptor.prototype = {
	init:function(options){
        if (typeof options.endpoint == 'undefined') throw "Server adapter requires an 'endpoint' parameter, defining a server-side endpoint/API to use.";
        this.endpoint = options.endpoint;
        if (typeof options.id != 'undefined') this.id = options.id
        else options.id = null;
        try {
            var testxhr = new XMLHttpRequest();
        } catch(e) {
            throw "This browser doesn't seem to support XHRs very well. Shit eh?";
        }
        // xhr wrapper, taken from quirksmode.org
        var self = this;
        this.sendRequest = function(url,callback,postData) {
            var req = new XMLHttpRequest();
            if (!req) return;
            var method = (typeof postData != 'undefined') ? "POST" : "GET";
            req.open(method,url,true);
            req.onreadystatechange = function () {
                if (req.readyState != 4) return;
                if (req.status != 200 && req.status != 304) return;
                eval('var json = ' + this.responseText);
                callback.call(self, json);
            }
            if (req.readyState == 4) return;
            req.send((typeof postData != 'undefined'?postData:null));
        }
	},
	get:function(key, callback){
        this.sendRequest(this.endpoint + '?get=' + key, function(json) {
            if (json != null && typeof json.key != 'undefined') json.key = key;
            if (typeof callback != 'undefined') this.terseToVerboseCallback(callback)(json);
        });
	},
	save:function(obj, callback){
        if (typeof obj.key == 'undefined') {
            obj.key = this.uuid();
        }
        var id = obj.key;
		this.sendRequest(this.endpoint + '?save=' + id, function(json) {
            if (typeof callback != 'undefined') this.terseToVerboseCallback(callback)(json);
        }, JSON.stringify(obj));
	},
	all:function(callback){
		this.sendRequest(this.endpoint + '?all=true', function(json) {
            if (typeof callback != 'undefined') this.terseToVerboseCallback(callback)(json);
        });
	},
	remove:function(keyOrObj, callback) {
		var key = (typeof keyOrObj == 'string') ? keyOrObj : keyOrObj.key;
        this.sendRequest(this.endpoint + '?remove=' + key, function(json) {
            if (typeof callback != 'undefined') this.terseToVerboseCallback(callback)(json);
        });
	},
	nuke:function(callback) {
        this.sendRequest(this.endpoint + '?nuke=true', function(json) {
            if (typeof callback != 'undefined') this.terseToVerboseCallback(callback)(json);
        });
	}
};