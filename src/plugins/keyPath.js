// Allows customization of primary key with 'keyPath' option.  Follows the 
//    most complex IndexedDB specification, but works in other adapters.
Lawnchair.plugin({
    keyEmbellish:function(object) {
        var self=this;
        var value=null;
        // If this 'keyPath' (not 'key_path') is a simple (i.e. top level, single value) key...
        if(typeof(self.keyPath)==='string'&&self.keyPath.indexOf(',')==-1&&self.keyPath.indexOf('.')==-1) {
            // Return what is already defined.
            if(self.keyPath in object) {value=object[self.keyPath];}
            // Provide a unique identifier for the object and assign the identifier to key.
			else {value=self.uuid();object[self.keyPath]=value;}
        }
        return value;
    },
    keyExtraction:function(object, key_path) {
        // http://www.w3.org/TR/IndexedDB/#dfn-steps-for-extracting-a-key-from-a-value-using-a-key-path
        var self=this;
        key_path=key_path||self.keyPath;
        var value=null;
        if(typeof(key_path)==='string') {
            //3.3.6#2
            if(key_path.length==0) {
                value=object;
            } else {
                //3.3.6#1
                if(key_path.indexOf(',')>-1) {
                    var sequence_values=[];
                    key_path.split(',').forEach(function(key_sequence, s, key_sequences) {
                        var sub_key = self.keyExtraction(object, key_sequence);
                        if(!!sub_key) {sequence_values.push(sub_key);}
                    }, this);
                    value=sequence_values;
                } else {
                    var identifier_value=null;
                    var key_identifiers=key_path.split('.');
                    var key_identifier=key_identifiers[0];
                    if(key_identifier in object) {
                        var sub_object=object[key_identifier];
                        if(key_identifiers.length==1) {value=sub_object;}
                        else {
                            var remaining_key_path=key_identifiers.slice(1).join('.');
                            identifier_value=self.keyExtraction(sub_object, remaining_key_path);
                            if(!!identifier_value) {value=identifier_value;}
                        }
                    }
                }//indexOf
            }//length
            if(!value) {value=self.keyEmbellish(object);}
        }//typeof
        return value;
    },
    keyIsValid:function(key_value, every_index, every_array) {
        // http://www.w3.org/TR/IndexedDB/#key-construct
        // 'key_value' is "scalar" or Array value returned by 'keyExtraction', or not.
        // 'every_index' and 'every_array' are optional and only including for debugging array key values.
        // Returns whether 'key_value' is valid.
        var self = this;
        var key_values = ((key_value instanceof Array)?(key_value):([key_value]));
        var key_is_valid = key_values.every(function every_key_is_valid(value, v, values) {
            var value_is_valid = false;
            if(value instanceof Date) {value_is_valid = !window.isNaN(value.getTime());}
            else if(typeof(value) === 'number') {value_is_valid = !window.isNaN(value);}
            else if(typeof(value) === 'string') {value_is_valid = true;}
            else if(value instanceof Array) {value_is_valid = value.every(self.keyIsValid, value);}
            return value_is_valid;
        }, key_values);
        return key_is_valid;
    },
    keyObjectComparator:function(key_path) {
        // http://www.w3.org/TR/IndexedDB/#key-construct
        // 'key_path' is optional, defaults to this 'keyPath'.
        // Returns comparator function to compare objects based on 'key_path'.
        var self = this;
        // Pre-default 'key_path's value for...sanity.
        key_path = key_path || self.keyPath;
        return function key_object_comparator(leftObj, rightObj) {
            var left_key = self.keyExtraction(leftObj, key_path);
            if(!self.keyIsValid(left_key)) {
                throw(new SyntaxError("keyObjectComparator: ".concat(
                    "key value '", left_key, "' is invalid.  Evaluated using key path '", key_path, "'." 
                )));
            }
            var right_key = self.keyExtraction(rightObj, key_path);
            if(!self.keyIsValid(right_key)) {
                throw(new SyntaxError("keyObjectComparator: ".concat(
                    "key value '", right_key, "' is invalid.  Evaluated using key path '", key_path, "'." 
                )));
            }
            var comparison = self.keyValueComparator()(left_key, right_key);
            // 'comparison' is already clamped to [-1,+1].
            return comparison;
        };
    },
    keyValueComparator:function()
    {
        // http://www.w3.org/TR/IndexedDB/#key-construct
        // Although no parameters are passed, it is a comparator factory to be analogous to 'keyObjectComparator'.
        var self = this;
        return function key_value_comparator(left_key, right_key) {
            var comparison = 0;
            var leftKeyIs = {
                'anArray':self.isArray(left_key),
                'aDate':left_key instanceof Date,
                'aNumber':typeof(left_key) === 'number',
                'aString':typeof(left_key) === 'string',
            };
            var rightKeyIs = {
                'anArray':self.isArray(right_key),
                'aDate':right_key instanceof Date,
                'aNumber':typeof(right_key) === 'number',
                'aString':typeof(right_key) === 'string',
            };
            if(leftKeyIs.anArray) {
                if(rightKeyIs.anArray) {
                    comparison = right_key.length - left_key.length;
                    if(comparison == 0) {
                        // Use for-loop to facilitate 'break'.
                        for(var i = 0, l = left_key.length; i < l; ++i) {
                            var comp = self.keyValueComparator()(left_key[i], right_key[i]);
                            if(comp != 0) {comparison = comp;break;}
                        }
                    }
                }
                else {comparison = -1;}
            }
            else if(leftKeyIs.aDate) {
                if(rightKeyIs.aDate) {comparison = right_key.getTime() - left_key.getTime();}
                else if(rightKeyIs.anArray) {comparison = +1;}
                else {comparison = Number.NaN;}
            }
            else if(leftKeyIs.aNumber) {
                if(rightKeyIs.aNumber) {comparison = right_key.valueOf() - left_key.valueOf();}
                else if(rightKeyIs.anArray || rightKeyIs.aDate) {comparison = +1;}
                else {comparison = Number.NaN;}
            }
            else if(leftKeyIs.aString) {
                if(rightKeyIs.aString) {comparison = left_key.localeCompare(right_key);}
                else if(rightKeyIs.anArray || rightKeyIs.aDate || rightKeyIs.aNumber) {comparison = +1;}
                else {comparison = Number.NaN;}
            }
            else {comparison = Number.NaN;}
            // Clamp comparison.
            comparison = Math.max(-1, Math.min(comparison, +1));
            return comparison;
        };
    }
});