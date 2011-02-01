Lawnchair.plugin({
    // TODO move to core?
	/**
	 * Classic iterator.
	 * - Passes the record and the index as the second parameter to the callback.
	 * - Accepts a string for eval or a method to be invoked for each document in the collection.
	 */
	each:function(callback) {
        var cb = this.lambda(callback)
        // iterate from chain
        if (this.__results) {
            for (var i = 0, l = this.__results.length; i < l; i++) {
               cb.call(this, this.__results[i], i) 
            } 
        } 
        // otherwise iterate the entire collection 
        else {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) {
                    cb.call(this, r[i], i)
                }
            });
        }
        return this
	}
});
