var chain = function(tests, delay) {
    if (tests instanceof Array) {
        if (tests.length > 0) {
            if (typeof delay != 'undefined') {
                setTimeout(function() {
                    tests.shift()();
                    chain(tests, delay);
                }, delay);
            } else {
                var nextTest = tests.shift();
                var next = window.thisChain = { next: function () {
                    return chain(tests);
                } };

                if (typeof nextTest == "string") {
                    return nextTest;
                } else {
                    return function () {
                        nextTest.apply(next, arguments);
                    }
                }
            }
        } else QUnit.start();
    }
};

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
    // raise exception if no ctor callback is supplied
    try {
        var lc2 = new Lawnchair();    
    } catch(e) {
        ok(true, 'exception raised if no callback supplied to init');
        // should init and call callback
        var lc = new Lawnchair({adaptor:store.adapter}, function() {
            ok(true, 'should call passed in callback');
            var elsee = this;
            setTimeout(function() {
                // need to timeout here because ctor doesnt return until after callback is called.
                equals(elsee, lc, '"this"" is bound to the instance');
                QUnit.start(); 
            }, 250);
        });
    }
});

test( 'all()', function() {
    QUnit.stop();
    expect(4);
    store.all(chain([function(r) {
        ok(true, 'calls callback');
        ok(r instanceof Array, 'should provide array as parameter');
        store.save(me, this.next());
    }, function(r) {
        store.all(this.next());
    }, function(r) {
        equals(r.length, 1, 'array parameter after save has length 1');
        store.all('window.thisChain.next()(r)');
    }, function(r) {
        ok(true, 'should call terse shorthand syntax');
        QUnit.start();
    }]));
});

test( 'nuke()', function() {
    QUnit.stop();
    expect(5);
    store.nuke(chain([function(r) {
        ok(true, "should call callback in nuke");
        same(store.nuke(this.next()), store, "should be chainable on nuke");
    }, function(r) {
        store.all(this.next());
    }, function(r) {
        equals(r.length, 0, "all should return 0 length following a nuke.");
        store.save(me, this.next());
    }, function(r) {
        store.nuke(this.next());
    }, function(r) {
        store.all(this.next());
    },function(r) {
        equals(r.length, 0, "should have 0 length after saving, then nuking");
        store.nuke('window.thisChain.next()(r)');
    }, function(r) {
        ok(true, 'should call terse shorthand syntax');
        QUnit.start();
    }]));
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
