#!/bin/sh
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=timing-system-server ./protos/helloworld.proto
