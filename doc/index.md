Lawnchair
===

A Lawnchair is sorta like a couch except smaller and outside. Perfect for HTML5 mobile apps that need a lightweight, adaptive, simple and elegant persistence solution. 


<pre>
    // Try it! Open Firebug or Web Inspector
    Lawnchair({name:'testing', adaptor:'dom'}, function(store) {
        // Create an object
        var me = {name:'brian'};
        // Save it
        store.save(me);
        // Access it later... Yes even after a page refresh!
        store
    })
</pre>

Features
---

- Super micro tiny storage without the nasty SQL: pure and delicious JSON
- Adaptors for any clientside store
- Designed with mobile in mind
- Clean and simple OO design
- Key/value store …key is optional
- Happily and handily will treats things as a simple array of objects
- Terse syntax for searching/finding
- Battle tested in app stores and on the open mobile web
- Framework agnostic (if not a framework athiest!)
- MIT licensed


Key concepts
---

- Collections contains objects; or.. a lawnchair instance is really just an array of objects.
- Adaptive persistence. the underlying store is abstracted behind a consistent interface.
- Pluggable collection behavior. Sometimes we need collection helpers but not always.

By default, Lawnchair will persist using DOM Storage but if other
adapters are available and DOM Storage isn't supported by the currently
executing JavaScript runtime. Lawnchair will attempt each successive
adapter until it finds one that works. Easy.


Quick Example
---

This page has a Lawnchair. If your browser supports a console pop it
open and take it for a test drive!

Downloads



<nav>
License

Basics

- Installation 
- Adapters
- Instantiation 
- Adding records
- Finding records
- Removing records

Sugar

- Terse callbacks
- Scoped callbacks
- Crazy(ier) constructoring

Plugins
---

- Aggregation
- Callbacks
- Pagination
- Query
</nav>
