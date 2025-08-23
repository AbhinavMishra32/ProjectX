FROM golang:1.22 AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/auth-service

FROM gcr.io/distroless/base-debian12
ENV PORT=8080
WORKDIR /app
COPY --from=builder /out/auth-service /app/auth-service
EXPOSE 8080
USER 65532:65532
ENTRYPOINT ["/app/auth-service"]

