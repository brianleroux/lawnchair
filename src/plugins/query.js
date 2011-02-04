// - NOT jsonPath or jsonQuery which are horrendously complex and fugly
// - simple query syntax 'its just javascript'
// - string interpolation 
// - chainable and plugin aware
// - sorting
// 
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
            ,   cb   = typeof last === 'function' ? args.pop() : undefined // FIXME need to make this check #of ?s
            ,   q    = args.length ? interpolate(tmpl, args) : tmpl
            ,   is   = new Function(this.record, 'return ' + q)
            ,   r    = []
            // iterate the working collection  
            this.each(function(record){
                console.log('should see five of these')
                if (is(record)) r.push(record)
                console.log(record)
            })
            // overwrite working results
            this.__results = r
            // callback / chain
            if (cb) this.fn(this.name, cb).call(this, this.__results)   
            return this 
        }, 

        // FIXME lambda followed by return this common... needs to be abstracted out
        
        // ascending sort the working storage obj on a property (or nested property)
        asc: function(property, callback) {
            console.log(this.__results)
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
})())
