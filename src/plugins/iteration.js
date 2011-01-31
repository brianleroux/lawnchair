Lawnchair.plugin({

    // TODO move to query
	/**
	 * Iterator that accepts two paramters (methods or eval strings):
	 *
	 * - conditional test for a record
	 * - callback to invoke on matches
	 *
	 */
	find:function(condition, callback) {
		var is = (typeof condition == 'string') ? function(r){return eval(condition)} : condition
		  , cb = this.lambda(callback)
	
		this.each(function(record, index) {
			if (is(record)) cb.call(this, record, index); // thats hot
		});
	},

    // TODO move to core
	/**
	 * Classic iterator.
	 * - Passes the record and the index as the second parameter to the callback.
	 * - Accepts a string for eval or a method to be invoked for each document in the collection.
	 */
	each:function(callback) {
        var cb = this.lambda(callback)

        this.all(function(r) {
            for (var i = 0, l = r.length; i < l; i++) {
                cb.call(this, r[i], i)
            }
        });
	}
});
