package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings" 
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"grailify/internal/model"
)

var jwtKey = []byte("my_super_secret_key_that_is_long_and_secure")

type AuthHandler struct {
	DB *sql.DB
}

type Credentials struct {
	Username string `json:"username,omitempty"` 
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID int `json:"userId"`
	jwt.RegisteredClaims
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}

func (h *AuthHandler) SignUp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	_, err = h.DB.Exec("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", creds.Username, creds.Email, string(hashedPassword))
	if err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") {
			respondWithError(w, http.StatusConflict, "An account with this email already exists.")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to create user")
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created successfully"})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var creds Credentials
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	var user model.User
	err := h.DB.QueryRow("SELECT id, password_hash FROM users WHERE email = ?", creds.Email).Scan(&user.ID, &user.PasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Database error")
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(creds.Password)); err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour) 
	claims := &Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Could not generate authentication token")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged in successfully",
		"token":   tokenString,
	})
}
