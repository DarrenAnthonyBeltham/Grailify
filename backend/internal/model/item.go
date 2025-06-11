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
	CategoryID  int       `json:"category_id"`
	ReleaseDate time.Time `json:"release_date"`
	ImageURL    string    `json:"image_url"`
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
