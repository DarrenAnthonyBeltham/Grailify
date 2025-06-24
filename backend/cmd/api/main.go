package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"

	"grailify/internal/database"
	"grailify/internal/handler"

	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

var jwtKey = []byte("my_super_secret_key_that_is_long_and_secure")

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func jwtMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Authorization header format must be Bearer {token}", http.StatusUnauthorized)
			return
		}

		claims := &handler.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func main() {
	db := database.InitDB()
	defer database.CloseDB(db)

	authHandler := &handler.AuthHandler{DB: db}
	itemsHandler := &handler.ItemsHandler{DB: db}
	profileHandler := &handler.ProfileHandler{DB: db}

	r := mux.NewRouter()
	r.Use(corsMiddleware)

	r.HandleFunc("/api/signup", authHandler.SignUp).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/items", itemsHandler.GetAllItems).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/item", itemsHandler.GetItemByID).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/categories", itemsHandler.GetAllCategories).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/search", itemsHandler.SearchItems).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/trending", itemsHandler.GetTrendingItems).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/sell-page-items", itemsHandler.GetSellPageData).Methods("GET", "OPTIONS")


	api := r.PathPrefix("/api").Subrouter()
	api.Use(jwtMiddleware)
	api.HandleFunc("/profile", profileHandler.GetProfile).Methods("GET", "OPTIONS")
	api.HandleFunc("/profile/password", profileHandler.UpdatePassword).Methods("PATCH", "OPTIONS")
	api.HandleFunc("/record_sale", itemsHandler.RecordSale).Methods("POST", "OPTIONS")
	api.HandleFunc("/addresses", profileHandler.AddAddress).Methods("POST", "OPTIONS")
	api.HandleFunc("/addresses/{id:[0-9]+}", profileHandler.UpdateAddress).Methods("PUT", "OPTIONS")
	api.HandleFunc("/addresses/{id:[0-9]+}", profileHandler.DeleteAddress).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/payment-methods", profileHandler.AddPaymentMethod).Methods("POST", "OPTIONS")
	api.HandleFunc("/payment-methods/{id:[0-9]+}", profileHandler.DeletePaymentMethod).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/orders", profileHandler.CreateOrder).Methods("POST", "OPTIONS")

	log.Println("Starting Grailify server on http://localhost:8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Could not start server: %v", err)
	}
}