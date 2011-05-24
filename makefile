VERSION = "0.6.0"
ADAPTER = "dom"

default: clean build test
release: clean build min

clean: 
	rm -rf ./lib
	rm -rf ./test/lib/lawnchair*

build:
	# generates ./lib/lawnchair.js with dom adapter by default
	mkdir -p ./lib && touch ./lib/lawnchair-$(VERSION).js
	cat ./src/lawnchair.js > ./lib/lawnchair-$(VERSION).js
	cat ./src/adapters/$(ADAPTER).js >> ./lib/lawnchair-$(VERSION).js
	
	cp ./src/plugins/aggregation.js ./lib/lawnchair-aggregation-$(VERSION).js
	cp ./src/plugins/callbacks.js   ./lib/lawnchair-callbacks-$(VERSION).js
	cp ./src/plugins/pagination.js  ./lib/lawnchair-pagination-$(VERSION).js
	cp ./src/plugins/query.js       ./lib/lawnchair-query-$(VERSION).js
	# TODO lawnchair-adapter-name-X.X.X.js

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
	
	open ./test/index.html
	#open ./test/plugin/aggregation.html
	#open ./test/plugin/callbacks.html
	#open ./test/plugin/pagination.html
	#open ./test/plugin/query.html

doc:
	./util/build-docs

.PHONY: clean build min test doc
