#!/bin/bash
#./protoc/bin/protoc --go_out=plugins=grpc:$GOPATH/src/github.com/strangesast/core/monitoring ./monitoring.proto
./protoc/bin/protoc --go_out=plugins=grpc:. ./monitoring.proto
