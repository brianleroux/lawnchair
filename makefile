VERSION = "0.6.0"

default: clean build build-plugins dist test

clean: 
	rm -rf ./lib

build:
	mkdir -p ./lib && touch ./lib/lawnchair.js
	cat ./src/lawnchair.js > ./lib/lawnchair.js 
	cat ./src/adapters/dom.js >> ./lib/lawnchair.js 

# plugins being build here w/ dom adapter only for testing purposes
build-plugins:
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-aggregation.js
	cat ./src/plugins/aggregation.js >> ./lib/lawnchair-dom-aggregation.js
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-callbacks.js
	cat ./src/plugins/callbacks.js >> ./lib/lawnchair-dom-callbacks.js
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-pagination.js
	cat ./src/plugins/pagination.js >> ./lib/lawnchair-dom-pagination.js
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-query.js
	cat ./src/plugins/query.js >> ./lib/lawnchair-dom-query.js

dist: 
	java -jar ./util/compiler.jar --js ./lib/lawnchair.js > ./lib/lawnchair.min.js
	cp ./lib/lawnchair.js ./lib/lawnchair-$(VERSION).js
	cp ./lib/lawnchair.min.js ./lib/lawnchair-$(VERSION).min.js

test: 
	open ./tests/adapters/dom.html
	open ./tests/plugins/aggregation.html
	open ./tests/plugins/callbacks.html
	open ./tests/plugins/pagination.html
	open ./tests/plugins/query.html
	
.PHONY: all 
