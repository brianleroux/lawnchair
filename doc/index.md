Lawnchair
===

Lawnchair is an adaptive json storage solution. Designed for mobile but
it will work anywhere JavaScript does. Its designed to abstract the
disparate persistent implemenations out there. 

By default, Lawnchair will persist using DOM Storage but if other
adapters are available and DOM Storage isn't supported by the currently
executing JavaScript runtime. Lawnchair will attempt each successive
adapter until it finds one that works. Easy.

Quick Example
---
	
	var flavors = new Lawnchair({name:flavors}, function(){
		
		// creating a record
		this.save({ key:1, name:'brian' })

		// read it back at another time
		this.get(1, function(record){
			
		})
	
		// delete
	})

Key concepts
---

- collections contains objects; or.. a lawnchair instance is really just an array of objects
- adaptive persistence. the underlying store is abstracted behind a consistent interface
- pluggable collection behavior. sometimes we need collection helpers but not always


Basic Usage

- installation and adapters
- adding records
- finding records
- removing records

Sugar

- terse callbacks
- scoped callbacks
- crazy constructoring

Plugins
---

- aggregation
- callbacks
- pagination
- query

