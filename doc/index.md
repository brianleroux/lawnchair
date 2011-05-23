Lawnchair
===

Lawnchair is an adaptive json storage solution. Designed for mobile but
it will work anywhere JavaScript does.

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
	
	var flavors = new Lawnchair({ name:'flavors' }, function(){
		
		// creating a record
		this.save({ key:'strawberry', rating:10 })

		// read it back at another time
		this.get('strawberry', function(record) {
			console.log(record.rating)
            // 10
		})
	})

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
