package main

import (
	"log"
	"net/http"

	"grailify/internal/database"
	"grailify/internal/handler"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux" 
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: Method=%s, Path=%s, Origin=%s\n", r.Method, r.URL.Path, r.Header.Get("Origin"))

		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		
		if r.Method == "OPTIONS" {
			log.Println("Handling OPTIONS preflight request")
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	log.Println("Initializing database connection...")
	db := database.InitDB()
	defer database.CloseDB(db)
	log.Println("Database connection successful.")

	authHandler := &handler.AuthHandler{DB: db}
	itemsHandler := &handler.ItemsHandler{DB: db}

	r := mux.NewRouter()
	
	log.Println("Registering API handlers...")
	r.HandleFunc("/api/categories", itemsHandler.GetAllCategories).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/signup", authHandler.SignUp).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/items", itemsHandler.GetAllItems).Methods("GET", "OPTIONS")
	log.Println("API handlers registered successfully.")

	handler := corsMiddleware(r)

	log.Println("Starting Grailify server on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatalf("Could not start server: %v", err)
	}
}
