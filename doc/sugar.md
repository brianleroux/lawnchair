Sugar
=====

mmmm, so good to be bad! if this is wrong I don't wanna be right. etc.

terse callbacks
---

my favorite feature of lawnchair shamelessly stolen from dojo. `lawnchair` dynamically generates a function saving you keystrokes. this is standard javascript and won't break anything except possibly douglas crockford's heart.

    aquarium.save([{key:'shark'}, {key:'whale'}], 'console.log(record)');

You are correct in noticing the magical `record` parameter in the example above. by default, `lawnchair` will create either `record` or `records` for passed in parameters. you can change these by giving your lawnchair a `name` and `record` config in the constructor. you can read more about constructors below.

scoped everything everywhere
---

like the great magnificent birds of the world js frees us to rebind the current execution scope of an anonamous function to any object. it is a language feature that has found general acceptance (unlike, perhaps, the `prototype` and various techniques of `eval`).

    var store = new Lawnchair(function() {
        console.log(this === store) 
        // true
    })

this functionality exends throughout the library for any method.

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

    this.nuke().save({msg:'first post'}) // something annoying about this...

crazy constructors
---

the `new` keyworld/operator gets some flack. maybe it deservies it but in any case its here.

    var people = new Lawnchair();

or not... you decide.

    var people = Lawnchair();

probably not surprisingly the `Lawnchair` constructor optionally accepts a callback!

    var people = Lawnchair(function() { /* awesome persistence here */});

it also optionally accepts a config obj for terse callback param injection.

    var people = Lawnchair({name:'people', record:'person'}, function () {
        
        this.save({key:'joni'}, 'console.log(person)')
        // {key:'joni'}

        this.all('console.log(people)')
        // [{key:'joni'}]
    })

additionally the ctor callback gets passed the current `lawnchair` instance which can save bytes and comes in handy for closures

    var people = Lawnchair(function (ppl) {
        console.log(ppl === this && this === people)
        // true
    })
