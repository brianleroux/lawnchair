// window.name code courtesy Remy Sharp: http://24ways.org/2009/breaking-out-the-edges-of-the-browser
// this should work in all desktop browsers and most mobile browsers 
// TODO test older blackberry and nokia for window.name hack
Lawnchair.adaptor('window-name', (function() {

    var data = window.top.name ? JSON.parse(window.top.name) : {};
    
    return {
        valid: function () {
            return (window.Storage || typeof(window.top.name) != 'undefined') 
        },

        keys: function() {},

        save: function (key, value) {
            data[key] = value + ''; // force to string
            window.top.name = JSON.stringify(data);
        },

        remove: function (key) {
            delete data[key];
            window.top.name = JSON.stringify(data);
        },

        get: function (key) {
            return data[key] || null;
        },

        nuke: function () {
            data = {};
            window.top.name = '';
        }
    }
/////
})())
