Plugins
===

The `Lawnchair` deals in collections of json documents. Plugins augment Lawnchair collections with particular behaviors. If you'd like to create a plugin there are some great ideas listed in the road map. ;)

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
        this.min('temperature', 'console.log(min)')

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

When you have lots of data it is common to page it. BONUS: the opposite
sex loves the word _paginate_. Gets 'em every time.


    :::JavaScript
    var p = new Lawnchair({name:'people', record:'person'}, function() {

        this.page(2, function (page) {
            this.each('console.log(person)')
            console.log(page.people)
            console.log(page.max)
            console.log(page.next)
            console.log(page.prev)
        })
    })

    p.page(1, 'console.log(page.people)').each('console.log(person)')


Query
---

Querying data can be tedious and ugly. The query plugin proposes a
JavaScript syntax for accessing data.


    :::JavaScript
    Lawnchair(function() {

        // basic searching
        this.where('record.name === "brian"', 'console.log(records)')
        this.where('record.name != ?', username, 'console.log(records)')

        // sorting results
        this.where('name === "brian"').asc('active', 'console.log(records)')

        // in any direction!
        this.where('name === "brian"').desc('active', function(r) {
            console.log('why hello there ' + r.name)
        })
    })

