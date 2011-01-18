module('Lawnchair', {
    setup:function() {
        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke();
    },
    teardown:function() {
        me = null;
    }
});

test('ctor', function() {
    QUnit.stop();
    expect(3);
    // should init and call callback
    var lc = new Lawnchair({adaptor:store.adaptor}, function() {
        ok(true, 'should call passed in callback');
        equals(this, lc, 'this is bound to the instance');
        start(); 
    }); 
    // raise exception if no ctor callback is supplied
    try {
        var lc2 = new Lawnchair({adaptor:store.adaptor});    
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init');
    }
});
	/*

test( 'nuke()', function() {
    QUnit.stop();
    expect(4);
    store.nuke();
    store.all(function(r) {
        equals(r.length, 0, "should have 0 length when using full callback syntax");
        store.nuke();
        furtherassertions = function() {
            same(store.nuke(), store, "should be chainable on nuke");
            store.save(me);
            store.nuke();
            store.all(function(r) {
                equals(r.length, 0, "should have 0 length after saving, then nuking");
                start();
            });
        }
        store.all('equals(r.length, 0, "should have 0 length when using shorthand syntax"); furtherassertions();');
    });
});
    
test( 'save()', function() {
    QUnit.stop();
    expect(4);
    store.save(me, function() {
        ok(true, 'should call passed in callback');
        furtherassertions = function() {
            store.save({something:'yes'}, function() {
                store.all(function(r) {
                    equals(r.length, 2, 'should have length 2 after saving another object using full callback');
                    var id = 'donotdie';
                    store.save({key:id, foo:'bar'}, function(o){
                        equals(o.key, id, 'should preserve key in save callback on object');
                        start();
                    });
                });
            });
        };
        store.all('equals(r.length, 1, "should have length 1 after saving something using shorthand callback"); furtherassertions();');
    });
});

test( 'all()', function() {
    QUnit.stop();
    expect(2);
    store.all(function(r) {
        furtherassertions = function() {
            start();
        };
        ok(typeof r.length != "undefined" && r.length != null, 'should return an object with a length property in callback, using full callback');
        store.all('ok(typeof r.length != "undefined" && r.length != null, "should return an object with a length property in callback, using shorthand callback"); furtherassertions();');
    });
});

test( 'get()', function() {
    QUnit.stop();
    expect(3);
    store.save({key:'xyz123', name:'tim'}, function(){
        store.get('xyz123', function(r) {
            equals(r.name, 'tim', 'should return proper object when calling get with a key');
            start();
        });		    
    });
    store.get('doesntexist', function(r) {
        ok(true, 'should call callback even for non-existent key');
        equals(r, null, 'should return null for non-existent key');
    });
});

test( 'find()', function() {
    QUnit.stop();
    expect(5);
    store.save({dummy:'data'}, function() {
        store.save(me, function() {
            store.save({test:'something'}, function() {
                store.find('r.name == "brian"', function(r, i) {
                equals(r.name, me.name, 'should return same record that was saved, matching the condition, using shorthand condition and full callback');
                equals(i, 1, 'should return proper index in callback function');
                store.find(function(rec) {
                    return rec.name == 'brian';
                }, function(re, ind) {
                    equals(re.name, me.name, 'should return same record that was saved, matching the condition, using full condition and full callback');
                    store.find(function(reco) {
                        return reco.name == 'brian';
                    }, function(r) {
                        equals(r.name, me.name, "should return same record that was saved, matching the condition, using full condition and shorthand callback");
                        store.find(
                            'r.name == "brian"',
                            function(recor){
                                // change my age
                                recor.age = 31;
                                store.save(recor, function() {
                                    store.find('r.name == "brian"', function(record) {
                                        equals(record.age, 31, "should return updated record data after finding, changing something, saving, and finding the same record");
                                        start();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

test( 'remove()', function() {
    QUnit.stop();
    expect(4);
    store.save({name:'joni'});
    store.find(
        "r.name == 'joni'",
        function(r){
            furtherassertions = function() {
                var callback = function() {
                    store.all(function(r) {
                        equals(r.length, 0, "should have length 0 after saving, finding and removing a record and using a callback");
                        store.save({key:'die', name:'dudeman'});
                        store.remove('die');
                        store.all(function(rec) {
                            equals(r.length, 0, "should have length 0 after saving and removing by key");
                            var cb = function() {
                                store.all('equals(r.length, 0, "should have length 0 after saving and removing by key when using a callback"); start();');
                            };
                            store.save({key:'die', name:'dudeman'});
                            store.remove('die', cb);
                        });
                    });
                };
                store.save({name:'joni'});
                store.find(
                    "r.name == 'joni'",
                    function(r){
                        store.remove(r, callback);
                });
            };
            store.remove(r);
            store.all('equals(r.length, 0, "should have length 0 after saving, finding, and removing a record"); furtherassertions();');
    });
});

test( 'Lawnchair helpers', function() {
    equals(store.adaptor.uuid().length, 36, "uuid() function should create a 36 character string (is this a test, really?)");
});
*/
/*	

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
    QUnit.stop();
    dba.nuke();
    dbb.nuke();
    dba.all(function(rs){
        equals(rs.length, 0);
        dbb.all('equals(r.length, 0); start();');
    });
});

should( 'save one key in each store.', function(){
    QUnit.stop();
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
*/
