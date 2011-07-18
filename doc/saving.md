Saving
======

A `lawnchair` instance saves documents using the save method:

    
    :::JavaScript
    new Lawnchair(function() {
        this.save({me:'brian'})
    })
    

A callback is, as always, your option:

    
    :::JavaScript
    var ppl = Lawnchair(function() {
        
        // traditional callback code
        this.save({key:'config', options:[1,2,3]}, function(obj){
            console.log(obj)
        })

        // terse callback style
        this.save({person:'joni'}, 'console.log(record)')
    })
    

If you pass an object with a key then that record is updated (if it is
in the store already).
