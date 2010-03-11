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
		stop();
		store.save(me, function(r) {
			store.all(function(r) {
				equals(r.length, 1);
				start();
			});
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
		store.find(function(r) { return r.name == "brian"; }, function(r) { equals(r.name, "brian"); start(); });
	});
	
	should( 'get an object for key', function() {
		stop();
		store.save({key:'xyz123', name:'tim'}, function(r) {
			store.get('xyz123', function(r) {
				equals(r.name, 'tim');
				store.remove(r);
				start();
			});
		});
	});
	
	should( 'get null for nonexistant key', function() {
		stop();
		store.get('nonexistant_key', function(r) { equals(r, null); start(); });
	});
	
	should( 'remove one document.', function(){
		stop();
		store.save({name:'joni'});
		store.find(
			function(r) { return r.name == 'joni'; }, 
			function(r){
				store.remove(r);
				store.all(function(r) { equals(r.length, 2); start(); });
		});
	});
	
	
	should( 'remove a doc by key.', function(){
		stop();
		store.save({key:'die', name:'dudeman'});
		store.remove('die');
		store.all(function(r) { equals(r.length, 2); start(); });
	});
	
	
	should( 'update my age to 31.', function() {
		stop();
		store.find( 
			function(r) { return r.name == "brian"; },
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


context('Lawnchair with multiple collections', function(){
	
	var dba = new Lawnchair({table: 'a', adaptor: 'air'});
	var dbb = new Lawnchair({table: 'b', adaptor: 'air'});

	should( 'be empty.', function(){
		stop();
		dba.nuke();
		dbb.nuke();
		dba.all(function(rs){
			equals(rs.length, 0);
			dbb.all(function(r) { equals(r.length, 0); start(); });
		});
	});

	should( 'save one key in each store.', function(){
		stop();
		dba.save({key:'a'}, function() {
			dbb.save({key:'b'}, function() {
				dba.all( function(rs){
					equals(rs.length, 1);
					dbb.all(function(r) { equals(r.length, 1); start(); });
				});
			});
		});
	});
/// ---
});