Lawnchair.plugin((function(){
//
// searching
//
// store.where('name === "brian"') 
// store.where('user.name != {user}')
// store.where('shoe === {shoe} && shoe.active === {true}', function(results) { 
//
// })  
//
// sorting
//
// store.where('name === "brian").asc('active')
// store.where('name === "brian").desc('active')
// 
// plugin compatability
//
// Products.where('price > 0').count('console.log(count)')
// Fluids.where('!empty && contents === "beer"').sum('amount', 'console.log(sum)')
// People.where('active').each('person.active = false; this.save(person)') 
// Movies.where('category === "scifi"').asc('rating').page(1, function(movie) { console.log(movie}))  
//
// features
// ---
// - simple query syntax 'its just javascript'
// - string interpolation 
// - chainable and plugin aware
// - sorting
//

// begin module
return {

	/**
	 * Iterator that accepts two paramters (methods or eval strings):
	 *
	 * - conditional test for a record
	 * - callback to invoke on matches
	 *
	 */
	find:function(condition, callback) {
		var is = (typeof condition == 'string') ? function(r){return eval(condition)} : condition
		  , cb = this.lambda(callback)
	
		this.each(function(record, index) {
			if (is(record)) cb.call(this, record, index); // thats hot
		});
	},

    // query the storage obj
    where: function() {
        var args = [].slice.call(arguments)
        this.__is = function() {return eval(args[0])}
        this.__results = []
        this.each(function(r){
            if (__is(r)) this.__results.push(r)
        }) 
        // are we  chaining?   
        (args.length === 1) ? return this : this.lambda(cb).call(this, this.__results)
    }, 
    
    // ascending sort the working storage obj on a property (or nested property)
    asc: function(property, callback) {
       this.fn('r', callback).call(this, this.__results.sort(property)) 
    },

    // descending sort on working storage object on a property 
    desc: function() {
       this.fn('r', callback).call(this, this.__results.sort(property).reverse())
    }
} 
// end module
})())
