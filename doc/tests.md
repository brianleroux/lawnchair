Tests
=====

Run the tests in your browser.

- <a href="tests/test">lawnchair default build</a>
- <a href="tests/test/plugin/aggregation.html">aggregation plugin tests</a>
- <a href="tests/test/plugin/callbacks.html">callbacks plugin tests</a>
- <a href="tests/test/plugin/pagination.html">pagination plugin tests</a>
- <a href="tests/test/plugin/query.html">query plugin tests</a>

The TouchDB / CouchDB adapter requires ajax access to a database
server (either locally on the phone in the case of TouchDB, or as the
same origin server as the test cases). To run the test for this
adapter, first launch the proxy server by running `node util/serve.js`
from your Lawnchair checkout. Requires node.js and assumes there is a
CouchDB in admin-party mode, available at `http://localhost:5984`.
Once you launch the proxy you'll be prompted to run the tests at
`http://localhost:3000/index.html?adapter=touchdb-couchdb`.
