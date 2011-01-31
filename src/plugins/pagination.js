Lawnchair.plugin({

    page: function (page) {
	    var posts = []
	    ,   count = 5
	    ,   cur   = ~~page || 1
	    ,   next  = cur + 1
	    ,   prev  = cur - 1
	    ,   start = cur == 1 ? 0 : prev*count
	    ,   end   = start >= count ? start+count : count
	
		this.all(function(r){
			posts = r
		});
		
	    return { records:  posts.slice(start, end)
	           , page:     cur
	           , maxPages: Math.ceil(posts.length/count)
	           , nextPage: next > this.maxPages ? this.maxPages : next
	           , prevPage: prev == 0 ? 1 : prev
	           }
	}
});
