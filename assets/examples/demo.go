// Go demo — a tiny HTTP server with graceful shutdown
package main

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type Server struct {
	addr string
	port int
}

func (s *Server) handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"path": %q}`, r.URL.Path)
}

func main() {
	srv := &Server{addr: "0.0.0.0", port: 8080}
	mux := http.NewServeMux()
	mux.HandleFunc("/", srv.handler)

	httpServer := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", srv.addr, srv.port),
		Handler: mux,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = ctx
	httpServer.ListenAndServe()
}