package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"grailify/internal/model"
)

type ProfileHandler struct {
	DB *sql.DB
}

type ProfileResponse struct {
	User           model.User                `json:"user"`
	Addresses      []model.UserAddress       `json:"addresses"`
	PaymentMethods []model.UserPaymentMethod `json:"paymentMethods"`
	OrderHistory   []model.Order             `json:"orderHistory"`
	UserListings   []model.UserListing       `json:"userListings"`
}

type CheckoutPayload struct {
	CartItems         []model.CartItem `json:"cartItems"`
	TotalAmount       float64          `json:"totalAmount"`
	ShippingAddressID int              `json:"shippingAddressId"`
	PaymentMethodID   int              `json:"paymentMethodId"`
}

func (h *ProfileHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var payload CheckoutPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	tx, err := h.DB.Begin()
	if err != nil {
		http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
		return
	}

	orderResult, err := tx.Exec("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)", userID, payload.TotalAmount, "Completed")
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to create order", http.StatusInternalServerError)
		return
	}

	orderID, err := orderResult.LastInsertId()
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to get order ID", http.StatusInternalServerError)
		return
	}

	stmt, err := tx.Prepare("INSERT INTO order_items (order_id, item_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		http.Error(w, "Failed to prepare order items statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	for _, item := range payload.CartItems {
		_, err := stmt.Exec(orderID, item.ID, 1, item.Price)
		if err != nil {
			tx.Rollback()
			log.Printf("Failed to insert order item %d for order %d: %v", item.ID, orderID, err)
			http.Error(w, "Failed to record order item", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to finalize order", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Order placed successfully!",
		"orderId": orderID,
	})
}

func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("userID").(int)
	
	var user model.User
	h.DB.QueryRow("SELECT id, username, email FROM users WHERE id = ?", userID).Scan(&user.ID, &user.Username, &user.Email)

	var addresses []model.UserAddress
	addressRows, _ := h.DB.Query("SELECT id, type, full_name, address_line_1, address_line_2, city, state_province_region, postal_code, country, phone_number, is_default FROM user_addresses WHERE user_id = ? ORDER BY id", userID)
	if addressRows != nil {
		defer addressRows.Close()
		for addressRows.Next() {
			var addr model.UserAddress
			var addressLine2, phoneNumber sql.NullString
			addressRows.Scan(&addr.ID, &addr.Type, &addr.FullName, &addr.AddressLine1, &addressLine2, &addr.City, &addr.StateProvinceRegion, &addr.PostalCode, &addr.Country, &phoneNumber, &addr.IsDefault)
			addr.AddressLine2 = addressLine2.String
			addr.PhoneNumber = phoneNumber.String
			addresses = append(addresses, addr)
		}
	}

	var paymentMethods []model.UserPaymentMethod
	paymentRows, _ := h.DB.Query("SELECT id, provider, card_type, last_four_digits, expiry_month, expiry_year, is_default FROM user_payment_methods WHERE user_id = ?", userID)
	if paymentRows != nil {
		defer paymentRows.Close()
		for paymentRows.Next() {
			var pm model.UserPaymentMethod
			paymentRows.Scan(&pm.ID, &pm.Provider, &pm.CardType, &pm.LastFourDigits, &pm.ExpiryMonth, &pm.ExpiryYear, &pm.IsDefault)
			paymentMethods = append(paymentMethods, pm)
		}
	}
	
	var orderHistory []model.Order
    orderRows, _ := h.DB.Query("SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC", userID)
    if orderRows != nil {
        defer orderRows.Close()
        for orderRows.Next() {
            var order model.Order
            orderRows.Scan(&order.ID, &order.TotalAmount, &order.Status, &order.CreatedAt)
            orderHistory = append(orderHistory, order)
        }
    }

	var userListings []model.UserListing
	listingRows, _ := h.DB.Query(`
		SELECT ii.id, i.id, i.name, i.image_url, s.size_value, ii.price, ii.stock 
		FROM item_inventory ii
		JOIN items i ON ii.item_id = i.id
		LEFT JOIN sizes s ON ii.size_id = s.id
		WHERE ii.user_id = ?
		ORDER BY ii.id DESC
	`, userID)
	if listingRows != nil {
		defer listingRows.Close()
		for listingRows.Next() {
			var listing model.UserListing
			var sizeValue sql.NullString
			listingRows.Scan(&listing.ListingID, &listing.ItemID, &listing.ItemName, &listing.ItemImageURL, &sizeValue, &listing.Price, &listing.Stock)
			if sizeValue.Valid {
				listing.Size = sizeValue.String
			} else {
				listing.Size = "One Size"
			}
			userListings = append(userListings, listing)
		}
	}

	response := ProfileResponse{
		User:           user,
		Addresses:      addresses,
		PaymentMethods: paymentMethods,
		OrderHistory:   orderHistory,
		UserListings:   userListings,
	}
    w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ProfileHandler) AddAddress(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("userID").(int)
	var addr model.UserAddress
	json.NewDecoder(r.Body).Decode(&addr)
	query := "INSERT INTO user_addresses (user_id, type, full_name, address_line_1, address_line_2, city, state_province_region, postal_code, country, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	h.DB.Exec(query, userID, addr.Type, addr.FullName, addr.AddressLine1, addr.AddressLine2, addr.City, addr.StateProvinceRegion, addr.PostalCode, addr.Country, addr.PhoneNumber)
	w.WriteHeader(http.StatusCreated)
}

func (h *ProfileHandler) UpdateAddress(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value("userID").(int)
    vars := mux.Vars(r)
    addressID, _ := strconv.Atoi(vars["id"])
    var addr model.UserAddress
    json.NewDecoder(r.Body).Decode(&addr)
    query := "UPDATE user_addresses SET type=?, full_name=?, address_line_1=?, address_line_2=?, city=?, state_province_region=?, postal_code=?, country=?, phone_number=? WHERE id=? AND user_id=?"
    h.DB.Exec(query, addr.Type, addr.FullName, addr.AddressLine1, addr.AddressLine2, addr.City, addr.StateProvinceRegion, addr.PostalCode, addr.Country, addr.PhoneNumber, addressID, userID)
    w.WriteHeader(http.StatusOK)
}

func (h *ProfileHandler) DeleteAddress(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value("userID").(int)
    vars := mux.Vars(r)
    addressID, _ := strconv.Atoi(vars["id"])
    h.DB.Exec("DELETE FROM user_addresses WHERE id=? AND user_id=?", addressID, userID)
    w.WriteHeader(http.StatusOK)
}

func (h *ProfileHandler) AddPaymentMethod(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value("userID").(int)
    var pm model.UserPaymentMethod
    json.NewDecoder(r.Body).Decode(&pm)
    query := "INSERT INTO user_payment_methods (user_id, provider, card_type, last_four_digits, expiry_month, expiry_year) VALUES (?, ?, ?, ?, ?, ?)"
    h.DB.Exec(query, userID, "Stripe", pm.CardType, pm.LastFourDigits, pm.ExpiryMonth, pm.ExpiryYear)
    w.WriteHeader(http.StatusCreated)
}

func (h *ProfileHandler) DeletePaymentMethod(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value("userID").(int)
    vars := mux.Vars(r)
    paymentID, _ := strconv.Atoi(vars["id"])
    h.DB.Exec("DELETE FROM user_payment_methods WHERE id = ? AND user_id = ?", paymentID, userID)
    w.WriteHeader(http.StatusOK)
}

func (h *ProfileHandler) UpdatePassword(w http.ResponseWriter, r *http.Request) {
    userID, _ := r.Context().Value("userID").(int)
	var payload struct {
		NewPassword string `json:"newPassword"`
	}
	json.NewDecoder(r.Body).Decode(&payload)
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(payload.NewPassword), bcrypt.DefaultCost)
	h.DB.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hashedPassword), userID)
	w.WriteHeader(http.StatusOK)
}