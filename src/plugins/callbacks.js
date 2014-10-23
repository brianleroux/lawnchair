// I would mark my relationship with javascript as 'its complicated'
Lawnchair.plugin((function(){
    
    // methods we want to augment with before/after callback registery capability 
    var methods = 'save batch get remove nuke'.split(' ')
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
        // TODO make private?
        // rewrites a method with before/after callback capability
        evented: function (methodName) {
            var oldy = this[methodName], self = this
            // overwrite the orig method
            this[methodName] = function() {
                var args              = [].slice.call(arguments)
                ,   beforeObj         = args[0] 
                ,   oldCallback       = args[args.length - 1]
                ,   overwroteCallback = false
                
                // call before with obj
                this.fire('before', methodName, beforeObj)

                if (typeof oldCallback === 'function') {
                    // overwrite final callback with after method injection 
                    args[args.length - 1] = function(record) {
                        oldCallback.call(self, record)
                        self.fire('after', methodName, record)
                    }
                    overwroteCallback = true
                }

                // finally call the orig method
                oldy.apply(self, args)

                // if there was no callback to override for after we invoke here
                if (!overwroteCallback) 
                    self.fire('after', methodName, beforeObj)
            }
        },

        // TODO definitely make private method 
        // for invoking callbacks
        fire: function (when, methodName, record) {
            var callbacks = registry[when][methodName]
            for (var i = 0, l = callbacks.length; i < l; i++) {
                callbacks[i].call(this, record)
            }
        },

        // TODO cleanup duplication that starts here..
        clearBefore: function(methodName) {
            registry.before[methodName] = []
        },

        clearAfter: function(methodName) {
            registry.after[methodName] = []
        },

        // register before callback for methodName
        before: function (methodName, callback) {
            registry.before[methodName].push(callback)
        },

        // register after callback for methodName 
        after: function (methodName, callback) {
            registry.after[methodName].push(callback)
        }
    
    // end module
    }
})());

