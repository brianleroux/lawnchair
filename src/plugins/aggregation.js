Lawnchair.plugin({
    
    // count of rows in the lawnchair collection with property
    count: function (property, callback) {
        var c = 0 
        this.each(function(e){
            if (e[property]) c++
        })
        this.lambda(callback).call(this, c)
    },
    
    // adds up property and returns sum
    sum: function (property, callback) {
        var sum = 0
        this.each(function(e){
            if (e[property]) sum += e[property]
        })
        this.lambda(callback).call(this, sum)
    },

    // averages a property 
    avg: function (property, callback) {
        this.sum(property, function (sum) {
            this.count(property, function (count) {
                this.lambda(callback).call(this, sum/count)
            })
        })
    },

    // lowest number
    min: function (property, callback) {
        this._minOrMax('min', property, callback)
    },

    // highest number
    max: function (property, callback) {
        this._minOrMax('max', property, callback)
    },

    // helper for min/max
    _minOrMax: function (m, p, c) {
        var r, all
        this.all(function(a){
            all = a.map(function(e){ return e[p] })
            r = Math[m].apply(Math, all)
        })
        this.lambda(c).call(this, r)
    }
// --
});
