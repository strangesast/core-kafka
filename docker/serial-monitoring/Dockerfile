FROM golang:alpine as build

WORKDIR /app
COPY serial-monitoring/go.mod serial-monitoring/go.sum ./
RUN go mod download

COPY serial-monitoring/ .
RUN mkdir /build && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /build .

FROM scratch
#FROM alpine
COPY --from=build /build /app
CMD ["/app/serial-monitoring"]
