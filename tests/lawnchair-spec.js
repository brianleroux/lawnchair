module('Lawnchair construction/destruction', {
    setup:function() {
    },
    teardown:function() {
    }
});

test('ctor requires callbacks in each form', function() {
    //expect(8);
    // raise exception if no ctor callback is supplied
    try {
        var lc2 = new Lawnchair();    
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init');
    }
    try {
        var lc3 = new Lawnchair({}, {});
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init, but two args are present');
    }
    try {
        var lc3 = new Lawnchair({});
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init, but one arg is present');
    }

    stop() 
    var lc = new Lawnchair({name:store.name}, function(ref) {
        start()
        ok(true, 'should call passed in callback when using obj+function ctor form')
        ok(this, lc, "lawnchair callback scoped to lawnchair instance")
        ok(ref, lc, "lawnchair passes self into callback too")
    });
});

module('all()', {
    setup:function() {
        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke();
    },
    teardown:function() {
        me = null;
    }
});
test( 'chainable', function() {
    expect(1);
    same(store.all(function(r) {}), store, 'should be chainable (return itself)');
})
test( 'full callback syntax', function() {
    QUnit.stop();
    expect(4);
    store.all(function(r) {
        ok(true, 'calls callback');
        ok(r instanceof Array, 'should provide array as parameter');
        equals(r.length, 0, 'parameter should initially have zero length');
        same(this, store, '"this" should be scoped to the lawnchair object inside callback');
        QUnit.start();
    });
});
test( 'adding, nuking and size tests', function() {
    QUnit.stop();
    expect(2);
    store.save(me, function() {
        store.all(function(r) {
            equals(r.length, 1, 'parameter should have length 1 after saving a single record');
            store.nuke(function() {
                store.all(function(r) {
                    equals(r.length, 0, 'parameter should have length 0 after nuking');
                    QUnit.start();                    
                });
            })
        });
    });
});
test( 'shorthand callback syntax', function() {
    QUnit.stop();
    expect(4);
    store.all('ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();') ;
    stop()
    var tmp = new Lawnchair({name:'temps', record:'tmp'}, function(){
        var Temps = this;
        equals(this, Temps, 'this is bound to Lawnchair')
        stop()
        Temps.all('start(); ok(temps, "this.name is passed to all callback")')
    })
});

test('scoped variable in shorthand callback', function() {
    var tmp = new Lawnchair({name:'temps', record:'tmp'}, function(){
        var Temps = this
        stop()
        Temps.each('start(); ok(tmp, "this.record is passed to each callback")')
    })
})

module('nuke()', {
    setup:function() {
        store.nuke();
    },
    teardown:function() {
    }
});
test( 'chainable', function() {
    expect(1);
    same(store.nuke(function() {}), store, 'should be chainable');
});
test( 'full callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.nuke(function() {
        ok(true, "should call callback in nuke");
        same(this, store, '"this" should be scoped to the Lawnchair instance');
        QUnit.start();
    });
});
test( 'shorthand callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.nuke('ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
});


module('save()', {
    setup:function() {
        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke();
    },
    teardown:function() {
        me = null;
    }
});

test( 'chainable', function() {
    expect(1);
    same(store.save(me), store, 'should be chainable');
});
test( 'full callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.save(me, function(it) {
        ok(true, 'should call passed in callback');
        same(it, me, 'should pass in original saved object in callback');
        QUnit.start();
    });
});
test( 'shorthand callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.save(me, 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
});

test( 'saving objects', function() { 
    QUnit.stop();
    expect(1);
    store.save(me, function() {
        this.save({key:"something", value:"else"}, function(r) {
            store.all(function(r) {
                equals(r.length, 2, 'after saving two keys, num. records should equal to 2');
                QUnit.start();
            });
        });
    })
});

module('batch()', {
    setup:function() {
        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke();
    },
    teardown:function() {
        me = null;
    }
});


test('batch insertion', function(){
    expect(3);
    ok(store.batch, 'batch implemented');
    equals(store.batch([]), store, 'chainable')
    QUnit.stop();
    store.batch([{i:1},{i:2}], function() {
        store.all(function(r){
            equals(r.length, 2, 'should be two records from batch insert with array of two objects');
            QUnit.start();
        });
    });
});

test( 'full callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.batch([{j:'k'}], function() {
        ok(true, 'callback called with full syntax');
        same(this, store, '"this" should be the LAwnchair instance');
        QUnit.start();
    })
});

test( 'shorthand callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.batch([{o:'k'}], 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();')
});

module('get()', {
    setup:function() {
        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke();
    },
    teardown:function() {
        me = null;
    }
});
test( 'should it be chainable?', function() {
    equals(store.get('foo'), store, 'get chainable');
});
test('get functionality', function() {
    QUnit.stop();
    //expect(3);
    store.save({key:'xyz', name:'tim'}, function() {
        store.get('xyz', function(r) {
            equals(r.name, 'tim', 'should return proper object when calling get with a key');
            store.get('doesntexist', function(s) {
                ok(true, 'should call callback even for non-existent key');
                equals(s, null, 'should return null for non-existent key');
                QUnit.start();                
            });
        });
    });
    stop()
    var t = [{key:'test-get'},{key:'test-get-1'}]
    store.batch(t, function() {
        this.get(['test-get','test-get-1'], function(r) {
            start()
            equals(r.length, t.length, "should batch get")
        })
    }) 
});
test( 'full callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.get('somekey', function(r){
        ok(true, 'callback got called');
        same(this, store, '"this" should be teh Lawnchair instance');
        QUnit.start();
    });
});
test('short callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.get('somekey', 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
});

module('remove()', {
    setup:function() {
        // I like to make all my variables globals. Starting a new trend.
        me = {name:'brian', age:30};
        store.nuke();
    },
    teardown:function() {
        me = null;
    }
});
test( 'chainable', function() {
    expect(1);
    same(store.remove('me'), store, 'should be chainable');
});
test( 'full callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.remove('somekey', function(r){
        ok(true, 'callback got called');
        same(this, store, '"this" should be teh Lawnchair instance');
        QUnit.start();
    });
});
test('short callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.remove('somekey', 'ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();');
});
// FIXME need to add tests for batch deletion 
test( 'remove functionality', function() {
    QUnit.stop();
    expect(2);
    store.save({name:'joni'}, function(r) {
        //store.find("r.name == 'joni'", function(r){
            store.remove(r, function(r) {
                store.all(function(all) {
                    equals(all.length, 0, "should have length 0 after saving, finding, and removing a record using entire object");
                    store.save({key:'die', name:'dudeman'}, function(r) {
                        store.remove('die', function(r){
                            store.all(function(rec) {
                                equals(rec.length, 0, "should have length 0 after saving and removing by string key");
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        //});
    });
});

