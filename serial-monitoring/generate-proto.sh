#!/bin/bash
./protoc/bin/protoc --go_out=plugins=grpc:proto ./serial-monitoring.proto
