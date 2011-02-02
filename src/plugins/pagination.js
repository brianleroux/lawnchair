/*
var p = new Lawnchair({name:'people', record:'person'}, function() {
 
    People = this

    People.page(2, function (page) {
        // scoped iterator
        this.each('console.log(person)')
        // also correctly scoped callback data
        console.log(page.people) 
        console.log(page.max)
        console.log(page.next)
        console.log(page.prev)
    })
})
// chaining friendly
p.page(1, 'console.log(page.people)').each('console.log(person)')
*/ 
Lawnchair.plugin({

    page: function (page, callback) {
        // some defaults
	    var objs  = []
	    ,   count = 5 // TODO make this configurable
	    ,   cur   = ~~page || 1
	    ,   next  = cur + 1
	    ,   prev  = cur - 1
	    ,   start = cur == 1 ? 0 : prev*count
	    ,   end   = start >= count ? start+count : count
              
        // grab all the records	
        // FIXME if this was core we could use this.__results for faster queries
		this.all(function(r){
	 		objs = r
 		})
        
        // grab the metadata	
        var max  = Math.ceil(objs.length/count)
	    ,   page = { max: max 
	               , next: next > max ? max : next
	               , prev: prev == 0 ? 1 : prev
	               }

        // reassign to the working resultset
        this.__results = page[this.name] = objs.slice(start, end)

        // callback / chain
        if (callback) this.fn('page', callback).call(this, page)
        return this
	}
});
