Lawnchair
===

A `Lawnchair` is sorta like a couch except smaller and outside. Perfect for HTML5 mobile apps that need a lightweight, adaptive, simple and elegant persistence solution.

- *Collections.* A `lawnchair` instance is really just an array of objects.
- *Adaptive persistence.* The underlying store is abstracted behind a consistent interface.
- *Pluggable collection behavior.* Sometimes we need collection helpers but not always.

Try it! Open Firebug, Web Inspector or pull out your [Weinre](http://people.apache.org/~pmuellr/weinre/docs/1.x/1.5.0/)...

    :::JavaScript
    var store = new Lawnchair({name:'testing'}, function(store) {

        // Create an object
        var me = {key:'brian'};

        // Save it
        store.save(me);

        // Access it later... Yes even after a page refresh!
        store.get('brian', function(me) {
            console.log(me);
        });
    });


Features
---

- Super micro tiny storage without the nasty SQL: pure and delicious JSON.
- Default build weighs in at *3.4K* minified; 1.5 gzip'd!
- Adapters for any client-side store.
- Designed with mobile in mind.
- Clean and simple API.
- Key/value store ...key is optional.
- Terse syntax for searching/finding.
- Battle tested in app stores and on the open mobile web.
- Framework agnostic. (If not a framework atheist!)
- MIT licensed.

By default, `Lawnchair` will persist using DOM Storage but if other adapters are available and DOM Storage isn't supported by the currently executing JavaScript runtime. `Lawnchair` will attempt each successive adapter until it finds one that works. Easy.

