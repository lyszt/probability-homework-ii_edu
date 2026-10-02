.PHONY: compile

SRCS := main.c $(wildcard src/*/*.c)

compile:
	clang --target=wasm32 -O2 -nostdlib -Wl,--no-entry -Wl,--export-all -o main.wasm $(SRCS)
