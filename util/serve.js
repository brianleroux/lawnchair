var http = require('http');
var send = require('send');
var url = require('url');

http.createServer(function(req, res){
  var path = url.parse(req.url).pathname;
  console.log(req.method, path)
  if (!/^\/(lib|plugin|index|lawnchair)/.test(path)) {
    var proxy = http.createClient(5984, 'localhost')
    var proxyRequest = proxy.request(req.method, req.url, req.headers);
    proxyRequest.on('response', function (proxyResponse) {
      // res.setHeader("Access-Control-Allow-Origin","*");
      res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      proxyResponse.pipe(res);
    });
    req.pipe(proxyRequest);
  } else {
    res.setHeader("Access-Control-Allow-Origin","*");
    // res.setHeader("Access-Control-Allow-Methods","*");
    function error(err) {
      res.statusCode = err.status || 500;
      res.end(err.message);
    }
    send(req, url.parse(req.url).pathname)
      .root(__dirname+'/../test')
      .on('error', error)
      .pipe(res);
  }
}).listen(3000);

console.log("please visit http://localhost:3000/index.html?adapter=touchdb-couchdb to run the tests");
