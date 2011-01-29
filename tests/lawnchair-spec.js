module('Lawnchair construction/destruction', {
    setup:function() {
    },
    teardown:function() {
    }
});

test('ctor requires callbacks in each form', function() {
    QUnit.stop();
    expect(8);
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
    // should init and call callback
    var lc = new Lawnchair({adaptor:store.adapter}, function() {
        ok(true, 'should call passed in callback when using obj+function ctor form');
        var elsee = this;
        setTimeout(function() {
            // need to timeout here because ctor doesnt return until after callback is called.
            same(elsee, lc, '"this"" is bound to the instance when using obj+function ctor form');
            var elc = new Lawnchair(function() {
                ok(true, 'should call passed in callback when using just function ctor form');
                var lawn = this;
                setTimeout(function() {
                    same(lawn, elc, '"this" is bound to the instance when using just function ctor form');
                    var elon = new Lawnchair('tableName', function() {
                        ok(true, 'should call passed in callback when using string+function ctor form');
                        var elan = this;
                        setTimeout(function() {
                            same(elon, elan, '"this" is bound to the instance when using string+function ctor form');
                            QUnit.start();
                        }, 250);
                    });
                }, 250);
            })
        }, 250);
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
    expect(2);
    store.all('ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();') ;
});

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
        
        QUnit.start();
    });
});
test( 'shorthand callback syntax', function() {
    QUnit.stop();
    expect(2);
    store.nuke('ok(true, "shorthand syntax callback gets evaled"); same(this, store, "`this` should be scoped to the Lawnchair instance"); QUnit.start();') ;
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

test( 'save()', function() {
    QUnit.stop();
    expect(5);
    var testid = 'donotdie';
    store.save(me, chain([function(one) {
        ok(true, 'should call passed in callback');
        equals(one, me, 'should pass in original saved object in callback');
        store.save({something:'else'}, this.next());
    }, "store.all(window.thisChain.next());"
    , function(two) {
        equals(two.length, 2, 'should have length 2 after saving two objects');
        store.save({key:testid, foo:'bar'}, this.next());
    }, function(three) {
        equals(three.key, testid, 'should preserve key in save callback on object');
        store.save({key:testid, foo:'bar'}, 'window.thisChain.next()(r)');
    }, function(r) {
        ok(true, 'should call terse shorthand syntax');
        QUnit.start();
    }]));
});

test('batch()', function(){
    ok(store.batch, 'batch implemented')
    stop()
    store.batch([{i:1},{i:2}], function() {
        store.all(function(r){
            start()
            equals(2, r.length, 'should be two records from batch insert')
        })
    })
})

// FIXME add tests for batch insertion   
test( 'get()', function() {
    QUnit.stop();
    expect(4);
    store.save({key:'xyz123', name:'tim'}, chain([function(){
        store.get('xyz123', this.next());
    }, function(r) {
        equals(r.name, 'tim', 'should return proper object when calling get with a key');
        store.get('doesntexist', this.next());
    }, function(r) {
        ok(true, 'should call callback even for non-existent key');
        equals(r, null, 'should return null for non-existent key');
        store.get('xyz123', 'window.thisChain.next()(r)');
    }, function(r) {
        ok(true, 'should call terse shorthand syntax');
        QUnit.start();
    }]));
});

// FIXME should move tests for plugins into their own thing
test( 'find()', function() {
    QUnit.stop();
    expect(4);
    store.save({dummy:'data'}, chain([function() {
        store.save(me, this.next());
    }, function() {
        store.save({test:'something'}, this.next());
    }, function() {
        store.find('r.name == "brian"', this.next());
    }, function(r, i) {
        equals(r.name, me.name, 'should return same record that was saved, matching the condition, using shorthand filter syntax');
        store.find(function(rec) {
            return rec.name == 'brian';
        }, this.next());
    }, function(re, ind) {
        equals(re.name, me.name, 'should return same record that was saved, matching the condition, using full filter syntax');
        // change my age
        re.age = 31;
        store.save(re, this.next());
    }, function(record) {
        store.find('r.name == "brian"', this.next());
    }, function(record) {
        equals(record.age, 31, "should return updated record data after finding, changing something, saving, and finding the same record");
        store.find('r.name == "brian"', 'window.thisChain.next()(r)');
    }, function(r) {
        ok(true, 'should call terse shorthand syntax');
        QUnit.start();
    }]));
});

// FIXME need to add tests for batch deletion 
test( 'remove()', function() {
    QUnit.stop();
    expect(4);
    store.save({name:'joni'}, chain([function() {
        ok(true, 'remove callback should be called');
        store.find("r.name == 'joni'", this.next());
    }, function(r){
        store.remove(r, this.next());
    }, function(r) {
        store.all(this.next());
    }, function(all) {
        equals(all.length, 0, "should have length 0 after saving, finding, and removing a record using entire object");
        store.save({key:'die', name:'dudeman'}, this.next());
    }, function(r) {
        store.remove('die', this.next());
    }, function(r){
        store.all(this.next());
    }, function(rec) {
        equals(rec.length, 0, "should have length 0 after saving and removing by string key");
        store.remove('die', 'window.thisChain.next()(r)');
    }, function(r) {
        ok(true, 'should call terse shorthand syntax');
        QUnit.start();
    }]));
});
