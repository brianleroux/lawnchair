// I would mark my relationship with javascript as 'its complicated'
Lawnchair.plugin((function(){
    
    // methods we want to augment with before/after callback registery capability 
    //var methods = 'save batch get remove nuke'.split(' ')
    var methods = 'save'.split(' ')
    ,   registry = {before:{}, after:{}}
    
    // fill in the blanks
    for (var i = 0, l = methods.length; i < l; i++) {
        registry.before[methods[i]] = []
        registry.after[methods[i]] = []
    }
    

    return {
    // start of module 
        
        // roll thru each method we with to augment
        init: function () {
            for (var i = 0, l = methods.length; i < l; i++) {
                this.evented(methods[i])
            }
        },

        // rewrites a method with before/after callback capability
        evented: function (methodName) {
            var oldy = this[methodName], self = this
            // overwrite the orig method
            this[methodName] = function() {
                var args = [].slice.call(arguments)
                ,   beforeObj = args[0] 
                ,   oldCallback = args[args.length - 1]
                // call before with obj
                this.fire('before', methodName, beforeObj)
                // overwrite final callback with after method injection 
                args[args.length - 1] = function(record) {
                    oldCallback.call(self, record)
                    self.fire('after', methodName, record)
                }
                // finally call the orig method
                oldy.apply(self, args)
            }
        },

        // private method for invoking callbacks
        fire: function (when, methodName, record) {
            var callbacks = registry[when][methodName]
            for (var i = 0, l = callbacks.length; i < l; i++) {
                callbacks[i].call(this, record)
            }
        },

        // register before callbacks
        before: function (key, callback) {
            registry.before[key].push(callback)
        },

        // register after callbacks 
        after: function (key, callback) {
            registry.after[key].push(callback)
        }
    
    // end module
    }
})())

