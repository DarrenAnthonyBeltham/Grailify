package main

import (
	"log"
	"net/http"

	"grailify/backend/internal/database"
	"grailify/backend/internal/handler"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db := database.InitDB()
	defer database.CloseDB(db)

	authHandler := &handler.AuthHandler{DB: db}
	itemsHandler := &handler.ItemsHandler{DB: db}

	mux := http.NewServeMux()

	mux.HandleFunc("/api/signup", authHandler.SignUp)
	mux.HandleFunc("/api/login", authHandler.Login)
	mux.HandleFunc("/api/items", itemsHandler.GetAllItems)

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Could not start server: %v", err)
	}
}
