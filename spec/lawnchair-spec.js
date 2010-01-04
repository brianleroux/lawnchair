context('Lawnchair', function(){

	var	me = {name:'brian', age:30};
	
	should( 'be empty.', function(){			
		stop();
		store.nuke();
		store.all('equals(r.length, 0); start();');
	});


	should( 'be chainable on nuke.', function(){
	    equals(store.nuke().nuke, store.nuke);
    });


	should( 'save one doc.', function(){
		store.save(me);
		stop();
		store.all('equals(r.length, 1); start();');
	});
	
	
	should( 'save a second doc.', function(){
		store.save({name:'fred'});
		stop();
		store.all('equals(r.length, 2); start();');
	});
	
	
	should( 'return all docs as an array.', function(){
		stop();
		store.all('ok(r.length); start();');
	});
	
	
	should( 'find doc with name:brian.', function(){
		stop();
		store.find('r.name == "brian"', 'equals(r.name, "brian"); start();');
	});
	
	
	should( 'remove one document.', function(){
		stop();
		store.save({name:'joni'});
		store.find(
			"r.name == 'joni'", 
			function(r){
				store.remove(r);
				store.all('equals(r.length, 2); start();');
		});
	});
	
	
	should( 'remove a doc by key.', function(){
		stop();
		store.save({key:'die', name:'dudeman'});
		store.remove('die');
		store.all('equals(r.length, 2); start();');
	});
	
	
	should( 'update my age to 31.', function() {
		stop();
		store.find( 
			'r.name == "brian"',
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
	
	var dba = new Lawnchair({table: 'a', adaptor: 'dom'});
	var dbb = new Lawnchair({table: 'b', adaptor: 'dom'});

	should( 'be empty.', function(){			
		stop();
		dba.nuke();
		dbb.nuke();
		dba.all(function(rs){
			equals(rs.length, 0); 
			dbb.all('equals(r.length, 0); start();')
		});
	});

	should( 'save one key in each store.', function(){
		stop();
		dba.save({key:'a'}, function() {
			dbb.save({key:'b'}, function() {
				dba.all( function(rs){
					equals(rs.length, 1);
					dbb.all('equals(r.length, 1); start();')
				});
			});
		});	
	});
/// ---	
});