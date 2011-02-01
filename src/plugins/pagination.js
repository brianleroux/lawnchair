/*
new Lawnchair({name:'people', record:'person'}, function() {

    People = this

    People.page(2, function (pages) {
        this.each('console.log(person)')
        console.log(pages.max)
        console.log(pages.next)
        console.log(pages.prev)
    })
})
*/ 
Lawnchair.plugin({

    page: function (page, callback) {
	    var objs  = []
	    ,   count = 5
	    ,   cur   = ~~page || 1
	    ,   next  = cur + 1
	    ,   prev  = cur - 1
	    ,   start = cur == 1 ? 0 : prev*count
	    ,   end   = start >= count ? start+count : count
        
        // grab all the records	
		this.all(function(r){
			objs = r
		});
        
        // assign to the working resultset
        this.__results = objs.slice(start, end)
	    
        // grab the metadata	
	    var pages = { max:  Math.ceil(this.__results.length/count)
	                , next: next > this.max ? this.max : next
	                , prev: prev == 0 ? 1 : prev
	                }

        if (callback) this.lambda(callback).call(this, pages)
	}
});
