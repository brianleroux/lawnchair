/**
 * LawnchairAdaptorHelpers
 * =======================
 * Useful helpers for creating Lawnchair stores. Used as a mixin.
 * 
 */
var LawnchairAdaptorHelpers = {

    // merging default properties with user defined args
    merge: function(defaultOption, userOption) {
        return (userOption == undefined || userOption == null) ? defaultOption: userOption;
    },

    // awesome shorthand callbacks as strings. this is shameless theft from dojo.
    terseToVerboseCallback: function(callback) {
        return (typeof arguments[0] == 'string') ?
        function(r, i) {
            eval(callback)
        }: callback;
    },

    // Returns current datetime for timestamps.
    now: function() {
        return new Date().getTime();
    },

    // Returns a unique identifier
    uuid: function(len, radix) {
        // based on Robert Kieffer's randomUUID.js at http://www.broofa.com
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [];
        radix = radix || chars.length;

        if (len) {
            for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (var i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8: r];
                }
            }
        }
        return uuid.join('');
    },

    // Serialize a JSON object as a string.
    serialize: function(obj) {
        var r = '';

        if (typeof JSON != 'undefined') {
            r = JSON.stringify(obj);
        } else {
            // Art Haedike: 21 Dec 2009
            // Pieced this together from some of the open libraries...handles recursion.  More robust.
            var t = typeof(obj);
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") obj = '"' + obj + '"';
                r = String(obj);
            } else {
                // recurse array or object
                var n,
                v,
                json = [],
                arr = (obj && obj.constructor == Array);
                for (n in obj) {
                    v = obj[n];
                    t = typeof(v);
                    if (t == "string") {
                        v = '"' + v + '"';
                    } else if (t == "object" && v !== null) {
                        //recursion starts here
                        v = this.serialize(v);
                    }
                    json.push((arr ? "": '"' + n + '":') + String(v));
                }
                r = (arr ? "[": "{") + String(json) + (arr ? "]": "}");
            }

        }

        return r;
    },

    // Deserialize JSON.
    deserialize: function(json) {
        return eval('(' + json + ')');
    }
};
