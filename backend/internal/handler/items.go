package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"grailify/internal/model"
)

type ItemsHandler struct {
	DB *sql.DB
}

func (h *ItemsHandler) GetAllItems(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	categorySlug := params.Get("category")
	minPriceStr := params.Get("minPrice")
	maxPriceStr := params.Get("maxPrice")
	brandsStr := params.Get("brands")

	query := `
        SELECT i.id, i.name, i.description, i.brand, i.price, i.image_url, i.created_at
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE 1=1
    `
	args := []interface{}{}

	if categorySlug != "" && categorySlug != "all" {
		query += " AND LOWER(c.slug) = ?"
		args = append(args, strings.ToLower(categorySlug))
	}

	if brandsStr != "" {
		brands := strings.Split(brandsStr, ",")
		if len(brands) > 0 {
			query += " AND LOWER(i.brand) IN (?" + strings.Repeat(",?", len(brands)-1) + ")"
			for _, brand := range brands {
				args = append(args, strings.ToLower(brand))
			}
		}
	}

	if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
		query += " AND i.price >= ?"
		args = append(args, minPrice)
	}

	if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
		if maxPrice > 0 && maxPrice < 5000 {
			query += " AND i.price <= ?"
			args = append(args, maxPrice)
		}
	}

	query += " ORDER BY i.created_at DESC LIMIT 40"
	
	log.Println("--- Executing Query ---")
	log.Println(query)
	log.Println(args)
	log.Println("-----------------------")

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Printf("Database query execution error: %v", err)
		return
	}
	defer rows.Close()

	var items []model.Item
	for rows.Next() {
		var item model.Item
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.Brand, &item.Price, &item.ImageURL, &item.CreatedAt); err != nil {
			http.Error(w, "Failed to scan row data", http.StatusInternalServerError)
			log.Printf("Database scan error: %v", err)
			return
		}
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, "Error iterating through database rows", http.StatusInternalServerError)
		log.Printf("Row iteration error: %v", err)
		return
	}
	
	log.Printf("Found %d products matching criteria.\n", len(items))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

func (h *ItemsHandler) GetItemByID(w http.ResponseWriter, r *http.Request) {
    itemIDStr := r.URL.Query().Get("id")
    itemID, err := strconv.Atoi(itemIDStr)
    if err != nil {
        http.Error(w, "Invalid item ID", http.StatusBadRequest)
        return
    }

    log.Printf("Fetching item with ID: %d", itemID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Item details endpoint"})
}