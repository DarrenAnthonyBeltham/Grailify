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

type PaginatedResponse struct {
	Items      []model.Item `json:"items"`
	TotalPages int          `json:"totalPages"`
	Page       int          `json:"page"`
}

func (h *ItemsHandler) GetAllItems(w http.ResponseWriter, r *http.Request) {
	params := r.URL.Query()
	categorySlug := params.Get("category")
	minPriceStr := params.Get("minPrice")
	maxPriceStr := params.Get("maxPrice")
	brandsStr := params.Get("brands")

	page, err := strconv.Atoi(params.Get("page"))
	if err != nil || page < 1 {
		page = 1
	}
	limit := 50

	countQuery := "SELECT COUNT(DISTINCT i.id) FROM items i LEFT JOIN categories c ON i.category_id = c.id"
	dataQuery := "SELECT DISTINCT i.id, i.name, i.description, i.brand, i.price, i.image_url, i.created_at FROM items i LEFT JOIN categories c ON i.category_id = c.id"
	
	whereClauses := []string{"1=1"}
	args := []interface{}{}

	if categorySlug != "" && categorySlug != "all" && categorySlug != "allgrails" && categorySlug != "morecategories" {
		whereClauses = append(whereClauses, "LOWER(c.slug) = ?")
		args = append(args, strings.ToLower(categorySlug))
	}

	if brandsStr != "" {
		brands := strings.Split(brandsStr, ",")
		if len(brands) > 0 {
			placeholders := "?" + strings.Repeat(",?", len(brands)-1)
			whereClauses = append(whereClauses, "LOWER(i.brand) IN ("+placeholders+")")
			for _, brand := range brands {
				args = append(args, strings.ToLower(brand))
			}
		}
	}

	if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
		whereClauses = append(whereClauses, "i.price >= ?")
		args = append(args, minPrice)
	}

	if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
		if maxPrice > 0 && maxPrice < 5000 {
			whereClauses = append(whereClauses, "i.price <= ?")
			args = append(args, maxPrice)
		}
	}

	whereStr := " WHERE " + strings.Join(whereClauses, " AND ")
	countQuery += whereStr
	dataQuery += whereStr

	var totalItems int
	err = h.DB.QueryRow(countQuery, args...).Scan(&totalItems)
	if err != nil {
		http.Error(w, "Failed to count items", http.StatusInternalServerError)
		log.Printf("Database count query error: %v. Query: %s", err, countQuery)
		return
	}
	totalPages := (totalItems + limit - 1) / limit

	offset := (page - 1) * limit
	dataQuery += " ORDER BY RAND() LIMIT ? OFFSET ?"
	finalArgs := append(args, limit, offset)

	log.Println("--- Executing Data Query ---")
	log.Println(dataQuery)
	log.Println(finalArgs)
	log.Println("-----------------------")

	rows, err := h.DB.Query(dataQuery, finalArgs...)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		log.Printf("Database data query error: %v. Query: %s", err, dataQuery)
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

	response := PaginatedResponse{
		Items:      items,
		TotalPages: totalPages,
		Page:       page,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ItemsHandler) GetAllCategories(w http.ResponseWriter, r *http.Request) {
	query := "SELECT id, name, slug FROM categories ORDER BY name ASC"
	
	rows, err := h.DB.Query(query)
	if err != nil {
		http.Error(w, "Failed to query database for categories", http.StatusInternalServerError)
		log.Printf("Database query execution error for categories: %v", err)
		return
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var category model.Category
		if err := rows.Scan(&category.ID, &category.Name, &category.Slug); err != nil {
			http.Error(w, "Failed to scan category row data", http.StatusInternalServerError)
			log.Printf("Database scan error for category: %v", err)
			return
		}
		categories = append(categories, category)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, "Error iterating through category rows", http.StatusInternalServerError)
		log.Printf("Row iteration error for categories: %v", err)
		return
	}
	
	log.Printf("Found %d categories.\n", len(categories))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
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