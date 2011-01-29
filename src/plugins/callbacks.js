
Lawnchair.plugin({

    init: function() {
        // methods we want to augment with before/after callback registery capability 
        var methods = 'all init save batch get exists all remove nuke'.split(' ')
        ,   self    = this
        // roll thru each method we with to augment
        for (var i = 0, l = methods.length; i < l; i++) {
            // catch a reference to the old obj
            var m = methods[i]
            ,   oldy = this[m]
            // rewrite the method
            this[m] = function() {
                var args = [].slice.call(arguments)
                this._befores()
                oldy.apply(self, args)
                this._afters()
            }
        }
    },

    _befores:[],
    _afters:[],

    // register before callbacks
    before: function (key, callback) { 
    },

    // register after callbacks 
    after: function (key, callback) {

    }
});
