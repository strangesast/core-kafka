FROM golang:alpine AS builder

WORKDIR /app
COPY ./monitoring/go.mod ./monitoring/go.sum ./
RUN go mod download
COPY monitoring/ .
RUN go build -o ./out/main .

FROM alpine
COPY --from=builder /app/out/main /app/main
EXPOSE 8080
CMD ["/app/main"]
