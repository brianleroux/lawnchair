
    // this should work in all desktop browsers and most mobile browsers 
    // TODO test older blackberry and nokia for window.name hack
    valid: function () {
        return (window.Storage || typeof(window.top.name) != 'undefined') 
    },
            var data = window.top.name ? JSON.parse(window.top.name) : {};
            return {
                setItem: function (key, value) {
                    data[key] = value + ''; // force to string
                    window.top.name = JSON.stringify(data);
                },
                removeItem: function (key) {
                    delete data[key];
                    window.top.name = JSON.stringify(data);
                },
                getItem: function (key) {
                    return data[key] || null;
                },
                clear: function () {
                    data = {};
                    window.top.name = '';
                }
            };
