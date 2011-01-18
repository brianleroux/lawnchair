// add created modified 
// requires callbacks
//
Lawnchair.plugin({
    init: function () {
        if (this.before === undefined) throw 'timestamp requires callbacks plugin';
        this.before('save', function (obj){
            if (obj.isNew()) obj['created'] = new Date();
            obj['modified'] = new Date();
        })
    }
});
