Lawnchair.plugin({
    // number of records with property     
    size: function (property) {
    },
    // total number of rows in the lawnchair collection
    length: function (callback) { 
        this.all(function (ary) {
            callback(ary.length);
        })
    },
    // adds up property and returns sum
    sum: function(){},
    // lowest number
    min: function(){},
    // highest number
    max: function(){},
    // averages a property 
    avg: function(){}
});
