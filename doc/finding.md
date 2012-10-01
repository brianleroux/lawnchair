Finding
-------

you need to find stuff. In a keystore document centric paradigm you likely won't do much
searching since you can just refer to a key.


    :::JavaScript
    Lawnchair(function(){
        this.get('app-config', function(config) {
            // do something w/ config here
        })
    })


That said, sometimes you may want to peruse the `Lawnchair` index.


    :::JavaScript
    Lawnchair(function() {
        // get all the keys
        this.keys(function(keys) {
            keys.forEach(console.log)
        })

        // equiv to above
        this.keys('keys.forEach(console.log)')
    })


Searching keys is annoying and tedious. GAWD! But wait...


    :::JavaScript
    // Test for existence of a key
    Lawnchair(function(){
        this.exists('my-key-name', function(exists) {
            console.log('Existence is: ' + exists)
        })
    })


Of course you can return everything in a `Lawnchair` with `all`. Or checkout
the [query plugin](/plugins) for more advanced querying capabilities
should your app require them client-side.

