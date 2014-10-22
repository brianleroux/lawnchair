// - NOT jsonPath or jsonQuery which are horrendously complex and fugly
// - simple query syntax 'its just javascript'
// - simple string interpolation 
// - search then sorting
Lawnchair.plugin((function(){        
    // 
    var interpolate = function(template, args) {
        var parts = template.split('?').filter(function(i) { return i != ''})
        ,   query = ''

        for (var i = 0, l = parts.length; i < l; i++) {
            query += parts[i] + args[i]    
        }
        return query
    }
     
    var sorter = function(p) {
        return function(a, b) {
            if (a[p] < b[p]) return -1
            if (a[p] > b[p]) return 1
            return 0
        }
    }
    //
    return {
        // query the storage obj
        where: function() {
            // ever notice we do this sort thing lots?
            var args = [].slice.call(arguments)
            ,   tmpl = args.shift()
            ,   last = args[args.length - 1]
            ,   qs   = tmpl.match(/\?/g)
            ,   q    = qs && qs.length > 0 ? interpolate(tmpl, args.slice(0, qs.length)) : tmpl
            ,   is   = new Function(this.record, 'return !!(' + q + ')')
            ,   r    = []
            ,   cb
            // iterate the entire collection
            // TODO should we allow for chained where() to filter __results? (I'm thinking no b/c creates funny behvaiors w/ callbacks)
            this.all(function(all){
                for (var i = 0, l = all.length; i < l; i++) {
                    if (is.call(all[i], all[i])) r.push(all[i])
                }
                // overwrite working results
                this.__results = r
                // callback / chain
                if (args.length === 1) this.fn(this.name, last).call(this, this.__results)   
            })
            return this 
        },  

	    // FIXME should be able to call without this.__results	
        // ascending sort the working storage obj on a property (or nested property)
        asc: function(property, callback) {
            this.fn(this.name, callback).call(this, this.__results.sort(sorter(property))) 
            return this
        },

        // descending sort on working storage object on a property 
        desc: function(property, callback) {
            this.fn(this.name, callback).call(this, this.__results.sort(sorter(property)).reverse())
            return this
        }
    } 
///// 
})());
