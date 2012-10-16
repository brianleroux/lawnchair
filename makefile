VERSION = "0.6.1"
PRIMARY_ADAPTER = "dom"
SECONDARY_ADAPTER = "window-name"

default: clean build test
release: clean build min

clean: 
	rm -rf ./lib
	rm -rf ./test/lib/lawnchair*

build:
	# generates ./lib/lawnchair.js with dom and window-name adapters by default
	mkdir -p ./lib && touch ./lib/lawnchair-$(VERSION).js
	cat ./src/Lawnchair.js > ./lib/lawnchair-$(VERSION).js
	cat ./src/adapters/$(SECONDARY_ADAPTER).js >> ./lib/lawnchair-$(VERSION).js
	cat ./src/adapters/$(PRIMARY_ADAPTER).js >> ./lib/lawnchair-$(VERSION).js
	cp ./lib/lawnchair-$(VERSION).js ./lib/lawnchair.js # copied for tests in site
	# plugins business	
	cp ./src/plugins/aggregation.js ./lib/lawnchair-aggregation-$(VERSION).js
	cp ./src/plugins/callbacks.js   ./lib/lawnchair-callbacks-$(VERSION).js
	cp ./src/plugins/pagination.js  ./lib/lawnchair-pagination-$(VERSION).js
	cp ./src/plugins/query.js       ./lib/lawnchair-query-$(VERSION).js
	# copy plugins in clean for tests,,, 
	cp ./lib/lawnchair-aggregation-$(VERSION).js ./lib/lawnchair-aggregation.js
	cp ./lib/lawnchair-callbacks-$(VERSION).js ./lib/lawnchair-callbacks.js
	cp ./lib/lawnchair-pagination-$(VERSION).js ./lib/lawnchair-pagination.js
	cp ./lib/lawnchair-query-$(VERSION).js ./lib/lawnchair-query.js
	# build adapters 
	cp ./src/adapters/memory.js                        ./lib/lawnchair-adapter-memory-$(VERSION).js
	cp ./src/adapters/blackberry-persistent-storage.js ./lib/lawnchair-adapter-blackberry-persistent-storage-$(VERSION).js
	cp ./src/adapters/gears-sqlite.js 				   ./lib/lawnchair-adapter-gears-sqlite-$(VERSION).js
	cp ./src/adapters/ie-userdata.js                   ./lib/lawnchair-adapter-ie-userdata-$(VERSION).js
	cp ./src/adapters/indexed-db.js                    ./lib/lawnchair-adapter-indexed-db-$(VERSION).js
	cp ./src/adapters/webkit-sqlite.js                 ./lib/lawnchair-adapter-webkit-sqlite-$(VERSION).js
	cp ./src/adapters/html5-filesystem.js              ./lib/lawnchair-adapter-html5-filesystem-$(VERSION).js

min:
	java -jar ./util/compiler.jar --js ./lib/lawnchair-$(VERSION).js > ./lib/lawnchair-$(VERSION).min.js

test:
	cp ./lib/lawnchair-$(VERSION).js ./test/lib/lawnchair.js
	cp ./lib/lawnchair-$(VERSION).js ./test/lib/lawnchair-aggregation.js
	cp ./lib/lawnchair-$(VERSION).js ./test/lib/lawnchair-callbacks.js
	cp ./lib/lawnchair-$(VERSION).js ./test/lib/lawnchair-pagination.js
	cp ./lib/lawnchair-$(VERSION).js ./test/lib/lawnchair-query.js
	
	cat ./src/plugins/aggregation.js >> ./test/lib/lawnchair-aggregation.js
	cat ./src/plugins/callbacks.js 	 >> ./test/lib/lawnchair-callbacks.js
	cat ./src/plugins/pagination.js  >> ./test/lib/lawnchair-pagination.js
	cat ./src/plugins/query.js 		 >> ./test/lib/lawnchair-query.js
	
	# copy in adaptors for testing...
	cp ./src/adapters/memory.js                        ./test/lib/lawnchair-adapter-memory.js
	cp ./src/adapters/blackberry-persistent-storage.js ./test/lib/lawnchair-adapter-blackberry-persistent-storage.js
	cp ./src/adapters/gears-sqlite.js 				   ./test/lib/lawnchair-adapter-gears-sqlite.js
	cp ./src/adapters/ie-userdata.js                   ./test/lib/lawnchair-adapter-ie-userdata.js
	cp ./src/adapters/indexed-db.js                    ./test/lib/lawnchair-adapter-indexed-db.js
	cp ./src/adapters/webkit-sqlite.js                 ./test/lib/lawnchair-adapter-webkit-sqlite.js
	cp ./src/adapters/html5-filesystem.js              ./test/lib/lawnchair-adapter-html5-filesystem.js

	open ./test/index.html
	#open ./test/plugin/aggregation.html
	#open ./test/plugin/callbacks.html
	#open ./test/plugin/pagination.html
	#open ./test/plugin/query.html

doc:
	./util/build-docs

.PHONY: clean build min test doc
