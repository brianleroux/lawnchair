context('Lawnchair', function(){

	var	me = {name:'brian', age:30};
	
	should( 'be empty.', function(){			
		stop();
		store.nuke();
		store.all( function(r) {
			equals(r.length, 0);
			start();
		});
	});


	should( 'be chainable on nuke.', function(){
		equals(store.nuke().nuke, store.nuke);
	});
	
	
	should( 'save one doc.', function(){
		store.save(me);
		stop();
		store.all(function(r) {
			equals(r.length, 1);
			start();
		});
	});
	
	
	should( 'save a second doc.', function(){
		store.save({name:'fred'});
		stop();
		store.all(function(r) { equals(r.length, 2); start(); });
	});
	
	
	should( 'return all docs as an array.', function(){
		stop();
		store.all(function(r) { ok(r.length); start(); });
	});
	
	
	should( 'find doc with name:brian.', function(){
		stop();
		store.find(function(r) { return r.name == "brian" }, function(r) { equals(r.name, "brian"); start(); });
	});
	
	
	should( 'remove one document.', function(){
		stop();
		store.save({name:'joni'});
		store.find(
			function(r) { return r.name == 'joni' }, 
			function(r){
				store.remove(r);
				store.all(function(r) { equals(r.length, 2); start(); });
		});
	});
	
	
	should( 'remove a doc by key.', function(){
		stop();
		air.trace('saving…');
		store.save({key:'die', name:'dudeman'});
		air.trace('removing…');
		store.remove('die');
		air.trace('counting…');
		store.all(function(r) { equals(r.length, 2); start(); });
	});
	
	
	should( 'update my age to 31.', function() {
		stop();
		store.find( 
			function(r) { return r.name == "brian" },
			function(r){
				// change my age
				r.age = 31;
				store.save(r);
				equals(r.age, 31);
				start();
		});
	});
	
	
	should( 'create a uuid.', function(){
		equals(store.adaptor.uuid().length, 36);
	});
	
// ---	
});
