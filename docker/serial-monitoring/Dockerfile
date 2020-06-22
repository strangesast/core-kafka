FROM golang:alpine as build

WORKDIR /app
COPY serial-monitoring/go.mod serial-monitoring/go.sum ./
RUN go mod download

COPY serial-monitoring/ .
RUN mkdir /build && go build -o /build .

FROM scratch
COPY --from=build /build /app
CMD ["/app/serial-monitoring"]
