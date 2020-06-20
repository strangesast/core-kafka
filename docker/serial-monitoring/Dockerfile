FROM golang as build

WORKDIR /app

RUN apt-get update && apt-get install -y wget unzip

# install protoc stuff
RUN wget -O /tmp/protoc.zip https://github.com/protocolbuffers/protobuf/releases/download/v3.11.4/protoc-3.11.4-linux-x86_64.zip && \
  unzip -d /usr/local /tmp/protoc.zip && \
  go get github.com/golang/protobuf/protoc-gen-go

# install go deps
COPY serial-monitoring/go.mod serial-monitoring/go.sum ./
RUN go mod download

# generate protoc stuff
COPY ./serial-monitoring/serial-monitoring.proto .
RUN mkdir proto && \
  protoc --go_out=plugins=grpc:proto ./serial-monitoring.proto

COPY serial-monitoring/ .
RUN mkdir /build && go build -o /build .

FROM golang
COPY --from=build /build /app
CMD ["/app/serial-monitoring"]
