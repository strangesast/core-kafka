#!/bin/bash
./protoc/bin/protoc --go_out=plugins=grpc:proto ./monitoring.proto
