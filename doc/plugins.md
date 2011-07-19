Plugins
===

The `Lawnchair` deals in collections of json documents. Plugins augment lawnchair collections with particular behaviors. If you'd like to create a plugin there are some great ideas listed in the roadmap. ;)

Aggregation
---

Aggregate data happens and when it does these sorts of methods can come
in handy.

    
    :::JavaScript
    Lawnchair(function() {
        // sum on a property
        this.sum('transactions', 'console.log(sum)')

        // get the average value of a property
        this.avg('score', 'console.log(avg)')

        // min value in the collection for a property
        this.min('temprature', 'console.log(min)')

        // max value in the collection for a property
        this.max('height', 'console.log(max)')
    })
    

Callbacks
---

Callbacks augment the `Lawnchair` api with `before` and `after` events.
Great for validations or conditional behavior.

    
    :::JavaScript
    Lawnchair(function() {
        
        // setup some callbacks
        this.before('save', 'console.log("about to save " + record.name)')
        this.after('save', 'console.log(record.name + " has been saved")')
        
        this.save({name:'brian'})
        // about to save brian
        // brian has been saved
    })
    

Pagination
---

When you have lots of data it is common to page it. BONUS: the oposite
sex loves the word _paginate_. Gets 'em every time.

    
    :::JavaScript
    Lawnchair(function() {

    })
    

Query
---

Querying data can be tedious and ugly. The query plugin proposes a
JavaScript syntax for accessing data. 

    
    :::JavaScript
    Lawnchair(function() {

    })
    
