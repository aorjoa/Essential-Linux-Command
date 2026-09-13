.PHONY: all build test serve clean format hello
all: test build

build: dist/index.html

dist/index.html: src/index.html scripts/build.js
	bun scripts/build.js

test:
	bun scripts/check.js

serve: build
	bun scripts/serve.js

clean:
	bun scripts/clean.js

format:
	bun scripts/format.js

hello:
	sh scripts/hello.sh
