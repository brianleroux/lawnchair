// adds created modified 
// requires callbacks
Lawnchair.plugin({
    init: function () {
        if (this.before === undefined) throw 'timestamp requires callbacks plugin';

        var isNew = function (obj) {
           return typeof obj.key != 'undefined' 
        }

        this.before('save', function (obj) {
            if (isNew(obj)) obj.created = new Date()
        })

        this.after('save', function(obj) {
            obj.modified = new Date()
        })
    }
});
