Lawnchair
===

A Lawnchair is sorta like a couch except smaller and outside. Perfect for HTML5 mobile apps that need a lightweight, adaptive, simple and elegant persistence solution. 

- Collections contains objects; or.. a lawnchair instance is really just an array of objects.
- Adaptive persistence. the underlying store is abstracted behind a consistent interface.
- Pluggable collection behavior. Sometimes we need collection helpers but not always.

<pre>
    // Try it! Open Firebug, Web Inspector or pull out your Weinre
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
</pre>

Features
---

- Super micro tiny storage without the nasty SQL: pure and delicious JSON
- Default build weighs in at 3.4K minified; 1.5 gzip'd!
- Adaptors for any clientside store
- Designed with mobile in mind
- Clean and simple API
- Key/value store …key is optional
- Happily and handily will treats things as a simple array of objects
- Terse syntax for searching/finding
- Battle tested in app stores and on the open mobile web
- Framework agnostic (if not a framework athiest!)
- MIT licensed

By default, Lawnchair will persist using DOM Storage but if other
adapters are available and DOM Storage isn't supported by the currently
executing JavaScript runtime. Lawnchair will attempt each successive
adapter until it finds one that works. Easy.



Suger
---

- Terse callbacks
- Scoped callbacks
- Crazy(ier) constructoring

Plugins
---

- Aggregation
- Callbacks
- Pagination
- Query
