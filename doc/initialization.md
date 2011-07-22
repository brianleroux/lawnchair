init
---

You have many options for kicking up a lawnchair.

    
    :::JavaScript
    new Lawnchair(function() {
        // Default params: records and record in terse callbacks
    })
    

though `new` is something of an overkill for a js constructor and maybe
we want to setup our own parameter names for terse callbacks

    
    :::JavaScript
    var ppl = Lawnchair({name:'people', record:'person'}, function(people){
        
        // Something to save...
        var me = {name:'brian'}
        
        // Anon fn bound to the instance
        this.save({a:1})

        // Hmm... but `this` won't work inside an anon handler
        document.getElementById('btn').addEventListener('click', function(){
            
            // Refer to the callback param (mapped to `name` in ctor options)
            // - also notice the terse callback in the second param 
            // - it uses the named variable person
            people.save({me:'brian'}, 'console.log(person)')

            // Or just use the orig reference created w/ the ctor
            ppl.remove(me) 

        }, false)

    })
    

As you can see, `lawnchair` gives you plenty of methods for accessing
the persisted data in a very javascript closure and callback world friendly manner. 
