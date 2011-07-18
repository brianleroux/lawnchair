init
---

You have many options for kicking up a lawnchair.

    
    new Lawnchair(function() {
        // default params "records" and "record" in terse callbacks
    })
    

though `new` is something of an overkill for a js constructor and maybe
we want to setup our own parameter names for terse callbacks

    
    // assign lawnchair instance to variable ppl
    var ppl = Lawnchair({name:'people', record:'person'}, function(people){
        
        // something to save...
        var me = {name:'brian'}
        
        // "this" is bound to the lawnchair instance
        this.save({a:1})

        // hmm... but "this" won't work inside an anon handler
        document.getElementById('btn').addEventListener('click', function(){
            
            // so, you can also refer to a named argument...
            // also notice the terse callback in the second param 
            // uses the named variable "person"
            people.save({me:'brian'}, 'console.log(person)')

            // or just use the orig reference created w/ the ctor
            ppl.destroy(me) 

        }, false)
    })
    

As you can see, `lawnchair` gives you plenty of methods for accessing
the persisted data in a very javascript closure and callback world friendly manner. 
