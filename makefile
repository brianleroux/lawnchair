#VERSION = "0.9.0"
#BASE = "./lib/lawnchair-dom-" + $VERSION + ".js"

default: clean build min test

clean: 
	rm -rf ./lib

build:
	mkdir -p ./lib && touch ./lib/lawnchair.js
	cat ./src/lawnchair.js > ./lib/lawnchair.js 
	cat ./src/adaptors/dom.js >> ./lib/lawnchair.js 
	cat ./src/plugins/iteration.js >> ./lib/lawnchair.js

min: 
	java -jar ./util/compiler.jar --js ./lib/lawnchair.js > ./lib/lawnchair.min.js

test: 
	open ./spec/public/adaptors/dom.html 
	
.PHONY: all 
