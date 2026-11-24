#!/usr/bin/env bash
# Requires Emscripten on PATH (emcc). Output: public/wasm/cubiomes.{js,wasm}
set -e
[ -d wasm/cubiomes ] || git clone --depth 1 https://github.com/Cubitect/cubiomes wasm/cubiomes   # git pull here to support new MC versions
SRC=(wasm/wrapper.c)
for f in generator finders layers noise biomes biomenoise util quadbase; do [ -f wasm/cubiomes/$f.c ] && SRC+=(wasm/cubiomes/$f.c); done
# ENVIRONMENT includes "worker": the engine runs inside a Web Worker.
emcc "${SRC[@]}" -Iwasm/cubiomes -O3 -s MODULARIZE=1 -s EXPORT_NAME=createCubiomes \
  -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web,worker \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","UTF8ToString","HEAPU8","HEAP32"]' \
  -s EXPORTED_FUNCTIONS='["_malloc","_free"]' -o public/wasm/cubiomes.js
echo "Built public/wasm/cubiomes.js + cubiomes.wasm"
