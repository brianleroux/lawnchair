#VERSION = "0.9.0"
#BASE = "./lib/lawnchair-dom-" + $VERSION + ".js"

default: clean build build-plugins min test

clean: 
	rm -rf ./lib

# FIXME need to add versioning here
build:
	mkdir -p ./lib && touch ./lib/lawnchair.js
	cat ./src/lawnchair.js > ./lib/lawnchair.js 
	cat ./src/adaptors/dom.js >> ./lib/lawnchair.js 
	cat ./src/plugins/iteration.js >> ./lib/lawnchair.js

# plugins being build here w/ dom adaptor only for testing purposes
build-plugins:
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-aggregation.js
	cat ./src/plugins/aggregation.js >> ./lib/lawnchair-dom-aggregation.js
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-callbacks.js
	cat ./src/plugins/callbacks.js >> ./lib/lawnchair-dom-callbacks.js
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-pagination.js
	cat ./src/plugins/pagination.js >> ./lib/lawnchair-dom-pagination.js
	cp ./lib/lawnchair.js ./lib/lawnchair-dom-query.js
	cat ./src/plugins/query.js >> ./lib/lawnchair-dom-query.js

min: 
	java -jar ./util/compiler.jar --js ./lib/lawnchair.js > ./lib/lawnchair.min.js

test: 
	open ./tests/adaptors/dom.html
	open ./tests/plugins/aggregation-spec.html
	open ./tests/plugins/callbacks-spec.html
	open ./tests/plugins/pagination.html
	open ./tests/plugins/query.html
	
.PHONY: all 
