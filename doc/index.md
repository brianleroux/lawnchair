Lawnchair
===

A Lawnchair is sorta like a couch except smaller and outside. Perfect for html5 mobile apps that need a lightweight, adaptive, simple and elegant persistence solution. 


<pre>
    // try it! open firebug or web inspector
    Lawnchair({name:'testing', adaptor:'dom'}, function(store) {
        // create an object
        var me = {name:'brian'};
        // save it
        store.save(me);
        // access it later... yes even after a page refresh!
        store
    })
</pre>

Features
---


- super micro tiny storage without the nasty SQL: pure and delicious JSON
- adaptors for any clientside store
- designed with mobile in mind
- clean and simple oo design
- key/value store ...key is optional
- happily and handily will treats things as a simple array of objects
- terse syntax for searching/finding
- battle tested in app stores and on the open mobile web
- framework agnostic (if not a framework athiest!)
- mit licensed


Key concepts
---

- collections contains objects; or.. a lawnchair instance is really just an array of objects
- adaptive persistence. the underlying store is abstracted behind a consistent interface
- pluggable collection behavior. sometimes we need collection helpers but not always

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

- installation 
- adapters
- instantiation 
- adding records
- finding records
- removing records

Sugar

- terse callbacks
- scoped callbacks
- crazy(ier) constructoring

Plugins
---

- aggregation
- callbacks
- pagination
- query
</nav>
