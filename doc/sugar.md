Sugar
=====

mmmm, so good to be bad! if this is wrong I don't wanna be right. etc.

terse callbacks
---

my favorite feature of lawnchair shamelessly stolen from dojo. `lawnchair` dynamically generates a function saving you keystrokes. this is standard javascript and won't break anything except possibly _<a href="http://javascript.crockford.com/code.html">douglas crockford's heart</a>_.


    :::JavaScript
    aquarium.save([{key:'shark'}, {key:'whale'}], 'console.log(record)');


You are correct in noticing the magical `record` parameter in the example above. by default, `lawnchair` will create either `record` or `records` for passed in parameters. you can change these by giving your lawnchair a `name` and `record` config in the constructor. you can read more about constructors below.

scoped everything everywhere
---

like the great magnificent birds of the world the javascript programming language frees us to rebind the current execution scope of an anonymous function to any object. it is a language feature that has found general acceptance (unlike, perhaps, the `prototype` and various techniques of `eval`).


    :::JavaScript
    var store = new Lawnchair(function() {
        console.log(this === store)
        // true
    })


this functionality extends throughout the library for any method.


    :::JavaScript
    var store = new Lawnchair(function() {

        this.save({key:'nitobi'}, function(obj) {

            console.log(obj)
            // {key:'nitobi'}

            this.nuke('console.log(records.length)')
            // 0
        })
    })


chaining supported
---

ah chaining, how mid 2000's


    :::JavaScript
    this.nuke().save({msg:'first post'}) // something annoying about this...


crazy constructors
---

the `new` keyword/operator gets some flack. maybe it deserves it but in any case its here.


    :::JavaScript
    var people = new Lawnchair()


or not... you decide. neither is right or wrong and there is no sense in being a
dick about it.


    :::JavaScript
    var people = Lawnchair()


probably not surprisingly the `Lawnchair` constructor optionally accepts a callback!


    :::JavaScript
    // fuck, async makes me HOT
    var people = Lawnchair(function() { /* awesome persistence here */})


The constructor also optionally accepts a configuration object for _terse callback named parameter injection_. Why yes, I did just make that nonsense up!


    :::JavaScript
    var people = Lawnchair({name:'people', record:'person'}, function () {

        this.save({key:'joni'}, 'console.log(person)')
        // {key:'joni'}

        this.all('console.log(people)')
        // [{key:'joni'}]
    })


additionally the ctor callback gets passed the current `lawnchair` instance which can save bytes and comes in handy for closures


    :::JavaScript
    var people = Lawnchair(function (ppl) {
        console.log(ppl === this && this === people)
        // true
    })

