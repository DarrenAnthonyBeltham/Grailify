package model

import "time"

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Item struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Brand       string    `json:"brand"`
	Price       float64   `json:"price"`
	ItemsSold   int       `json:"itemsSold"` 
	CategoryID  int       `json:"category_id"`
	ReleaseDate time.Time `json:"release_date"`
	ImageURL    string    `json:"imageUrl"`
	CreatedAt   time.Time `json:"created_at"`
}

type PriceHistory struct {
	ID         int       `json:"id"`
	ItemID     int       `json:"item_id"`
	Price      float64   `json:"price"`
	Type       string    `json:"type"`
	RecordedAt time.Time `json:"recorded_at"`
}

type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserAddress struct {
    ID                  int       `json:"id"`
    UserID              int       `json:"userId"`
    Type                string    `json:"type"` // 'shipping' or 'billing'
    FullName            string    `json:"fullName"`
    AddressLine1        string    `json:"addressLine1"`
    AddressLine2        string    `json:"addressLine2,omitempty"`
    City                string    `json:"city"`
    StateProvinceRegion string    `json:"stateProvinceRegion"`
    PostalCode          string    `json:"postalCode"`
    Country             string    `json:"country"`
    PhoneNumber         string    `json:"phoneNumber,omitempty"`
    IsDefault           bool      `json:"isDefault"`
}

type UserPaymentMethod struct {
    ID               int       `json:"id"`
    UserID           int       `json:"userId"`
    Provider         string    `json:"provider"`
    CardType         string    `json:"cardType"`
    LastFourDigits   string    `json:"lastFourDigits"`
    ExpiryMonth      string    `json:"expiryMonth"`
    ExpiryYear       string    `json:"expiryYear"`
    IsDefault        bool      `json:"isDefault"`
}

type CartItem struct {
	ID          int     `json:"id"`
	InventoryID int     `json:"inventoryId"`
	Name        string  `json:"name"`
	Brand       string  `json:"brand"`
	Size        string  `json:"size"`
	Price       float64 `json:"price"`
	ImageURL    string  `json:"imageUrl"`
}

type Order struct {
    ID          int         `json:"id"`
    UserID      int         `json:"userId"`
    TotalAmount float64     `json:"totalAmount"`
    Status      string      `json:"status"`
    CreatedAt   time.Time   `json:"createdAt"`
    Items       []OrderItem `json:"items"`
}

type OrderItem struct {
    ID              int     `json:"id"`
    OrderID         int     `json:"orderId"`
    ItemID          int     `json:"itemId"`
    Quantity        int     `json:"quantity"`
    PriceAtPurchase float64 `json:"priceAtPurchase"`
    ItemName        string  `json:"itemName,omitempty"` 
    ItemImageURL    string  `json:"itemImageUrl,omitempty"` 
}
