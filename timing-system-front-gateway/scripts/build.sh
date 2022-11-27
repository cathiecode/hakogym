#!/bin/bash

mkdir -p src/proto

# generate js codes via grpc-tools
grpc_tools_node_protoc \
  --js_out=import_style=commonjs,binary:./src/proto \
  --grpc_out=grpc_js:./src/proto \
  --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` \
  -I ../proto \
  ../proto/timing-system.proto

# generate d.ts codes
protoc \
  --plugin=protoc-gen-ts=../node_modules/.bin/protoc-gen-ts \
  --ts_out=grpc_js:./src/proto \
  -I ../proto \
  ../proto/timing-system.proto

# grpc_tools_node_protoc --js_out=import_style=commonjs,binary:../node/static_codegen/ --grpc_out=grpc_js:../node/static_codegen helloworld.proto
# grpc_tools_node_protoc --js_out=import_style=commonjs,binary:../node/static_codegen/route_guide/ --grpc_out=grpc_js:../node/static_codegen/route_guide/ route_guide.proto
