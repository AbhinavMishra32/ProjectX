package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
)

func healthz(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _, _ = w.Write([]byte(`{"status":"ok"}`))
}

func root(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    _, _ = w.Write([]byte(`{"service":"auth","message":"Hello from Go auth service"}`))
}

func echo(w http.ResponseWriter, r *http.Request) {
    q := r.URL.Query().Get("text")
    w.Header().Set("Content-Type", "application/json")
    _, _ = w.Write([]byte(fmt.Sprintf(`{"service":"auth","echo":"%s"}`, q)))
}

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    http.HandleFunc("/auth/healthz", healthz)
    http.HandleFunc("/auth/", root)
    http.HandleFunc("/auth/echo", echo)

    log.Printf("Starting auth service on :%s", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}


