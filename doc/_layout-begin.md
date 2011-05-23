<html>
    <head><title>lawnchair!</title><head>
    <link href="css/app.css" type="text/css" rel="stylesheet" /> 
    <link href="css/grid.css" type="text/css" rel="stylesheet" /> 
    <link href="css/prettify.min.css" type="text/css" rel="stylesheet" /> 
<body>
    <div class="container_12">
        <div class="grid_3">
            <h1><a href="/">Lawnchair</a></h1>
            <p>clientside JSON store</p>
        </div>
        <% 
        function a(url, text, current) {
            var klass = current == text ? 'current' : ''
            return '<li><a href="' + url + '" class="' + klass + '">' + text + '</a></li>';
        }
        %>
        <div class="grid_3">
            <h2>Code</h2>
            <ul class="nav">
                <%- a( '/',          'home',      current) %>
                <%- a( '/downloads', 'downloads', current) %>
                <%- a( '/adaptors',  'adaptors',  current) %>
                <%- a( '/tests',     'tests',     current) %>
                <%- a( '/license',   'license',   current) %>
            </ul>
            
            <h2>documentation</h2>
            <ul class="nav">
                <%- a( '/documentation/quickstart',     'quickstart',     current) %>
                <%- a( '/documentation/initialization', 'initialization', current) %>
                <%- a( '/documentation/saving',         'saving',         current) %>
                <%- a( '/documentation/finding',        'finding',        current) %>
                <%- a( '/documentation/removing',       'removing',       current) %>
                <%- a( '/documentation/iteration',      'iteration',      current) %>
                <%- a( '/documentation/api',            'api',            current) %>
            </ul> 
            
            <h2>community</h2>
            <ul class="nav">
                <li><a href="http://github.com/brianleroux/lawnchair">source on github</a></li>
            </ul> 
        </div>
        <div class="grid_6">