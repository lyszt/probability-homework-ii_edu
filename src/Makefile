.PHONY: all wasm build

all: build

wasm:
	$(MAKE) -C wasm compile

build: wasm
	npm run build
