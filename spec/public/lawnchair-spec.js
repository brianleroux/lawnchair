context('Lawnchair', function(){

	var	me = {name:'brian', age:30};
	
	should( 'be empty.', function(){
		stop();
		store.nuke();
		store.all('equals(r.length, 0); start();');
	});
	
	should("store a doc to be deleted by the nuke callback", function() {
	  stop();
	  store.save({name: "Nick", age: 29}, function(){
	    store.all('equals(r.length, 1); start();');
	  });
	});
	
  should( 'be empty and execute a callback.', function(){
		stop();
		var callback = function() {
		  store.all('equals(r.length, 0); start();');
		};
		store.nuke(callback);
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

	should( 'get an object for key', function() {
		stop();
		store.save({key:'xyz123', name:'tim'}, function(){
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
			"r.name == 'joni'",
			function(r){
				store.remove(r);
				store.all('equals(r.length, 2); start();');
		});
	});
	
	should( 'remove one document and execute a callback.', function(){
		stop();
		var callback = function() {
		  store.all('equals(r.length, 2); start();');
		};
		store.save({name:'joni'});
		store.find(
			"r.name == 'joni'",
			function(r){
				store.remove(r, callback);
		});
	});
	
	should( 'remove a doc by key.', function(){
		stop();
		store.save({key:'die', name:'dudeman'});
		store.remove('die');
		store.all('equals(r.length, 2); start();');
	});
	
	should( 'remove a doc by key and execute a callback.', function(){
		stop();
		var callback = function() {
		  store.all('equals(r.length, 2); start();');
		};
		store.save({key:'die', name:'dudeman'});
		store.remove('die', callback);
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
	
	
	should( 'still call callback for missing record.', function() {
        stop(); expect(1);
        store.get('NOTREAL', function(r) {
            equals(r, null);
            start();
        });
    });
    
    
    should( 'preserve key in callback after save.', function() {
        stop();
        var id = 'donotdie';
        store.save({key:id, foo:'bar'}, function(o){
           equals(o.key, id);
           start();
        });
    });
    
    should( 'get 10 items in a page.', function() {
        store.nuke();
        for (var i = 0; i < 300; i++) {
        	store.save({key: i, value: "test" + i});
        }
        store.paged(1,'equals(r.length, 10); start();');
    });
    
// ---

});


context('Lawnchair with multiple collections', function(){
	
	var dba = new Lawnchair({table: 'a'});
	var dbb = new Lawnchair({table: 'b'});

	should( 'be empty.', function(){
		stop();
		dba.nuke();
		dbb.nuke();
		dba.all(function(rs){
			equals(rs.length, 0);
			dbb.all('equals(r.length, 0); start();');
		});
	});

	should( 'save one key in each store.', function(){
		stop();
		dba.save({key:'a'}, function() {
			dbb.save({key:'b'}, function() {
				dba.all( function(rs){
					equals(rs.length, 1);
					dbb.all('equals(r.length, 1); start();');
				});
			});
		});
	});
/// ---
});
