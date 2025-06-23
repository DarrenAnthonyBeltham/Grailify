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

type InventoryInfo struct {
	InventoryID int     `json:"inventoryId"`
	Size        string  `json:"size"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
}

type ItemDetailResponse struct {
	model.Item
	RetailPrice  float64              `json:"retailPrice"`
	PriceHistory []model.PriceHistory `json:"priceHistory"`
	Inventory    []InventoryInfo      `json:"inventory"`
}

type SearchResult struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Brand    string `json:"brand"`
	ImageURL string `json:"imageUrl"`
}

func (h *ItemsHandler) RecordSale(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		ItemID int `json:"itemId"`
	}

	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if requestBody.ItemID <= 0 {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}

	query := "UPDATE items SET items_sold = items_sold + 1 WHERE id = ?"

	result, err := h.DB.Exec(query, requestBody.ItemID)
	if err != nil {
		http.Error(w, "Database update failed", http.StatusInternalServerError)
		log.Printf("Failed to execute RecordSale update: %v", err)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, "Failed to get rows affected", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Item not found, no sale recorded", http.StatusNotFound)
		return
	}

	log.Printf("Recorded sale for item ID: %d", requestBody.ItemID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Sale recorded successfully"})
}

func (h *ItemsHandler) SearchItems(w http.ResponseWriter, r *http.Request) {
	queryValues := r.URL.Query()
	searchTerm := queryValues.Get("q")

	if searchTerm == "" {
		json.NewEncoder(w).Encode([]SearchResult{})
		return
	}

	query := `
        SELECT id, name, brand, image_url FROM items
        WHERE name LIKE ? OR brand LIKE ?
        LIMIT 10
    `

	args := []interface{}{"%" + searchTerm + "%", "%" + searchTerm + "%"}

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		http.Error(w, "Database query failed", http.StatusInternalServerError)
		log.Printf("Search query error: %v", err)
		return
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var item SearchResult
		if err := rows.Scan(&item.ID, &item.Name, &item.Brand, &item.ImageURL); err != nil {
			http.Error(w, "Failed to scan search result", http.StatusInternalServerError)
			return
		}
		results = append(results, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
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
	dataQuery := `
        SELECT DISTINCT i.id, i.name, i.description, i.brand,
        (SELECT p.price FROM price_history p WHERE p.item_id = i.id AND p.type = 'sale' ORDER BY p.recorded_at DESC LIMIT 1) as last_sale_price,
        i.price, i.image_url, i.created_at
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
    `

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
		var lastSalePrice sql.NullFloat64
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.Brand, &lastSalePrice, &item.Price, &item.ImageURL, &item.CreatedAt); err != nil {
			http.Error(w, "Failed to scan row data", http.StatusInternalServerError)
			log.Printf("Database scan error: %v", err)
			return
		}
		if lastSalePrice.Valid {
			item.Price = lastSalePrice.Float64
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
	if itemIDStr == "" {
		http.Error(w, "Item ID is required", http.StatusBadRequest)
		return
	}
	itemID, err := strconv.Atoi(itemIDStr)
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}

	var item model.Item
	var releaseDate sql.NullTime
	var lastSalePrice sql.NullFloat64
	var retailPrice float64 

	itemQuery := `
        SELECT i.id, i.name, i.description, i.brand,
        (SELECT p.price FROM price_history p WHERE p.item_id = i.id AND p.type = 'sale' ORDER BY p.recorded_at DESC LIMIT 1) as last_sale_price,
        i.price as retail_price, i.items_sold, i.category_id, i.release_date, i.image_url, i.created_at
        FROM items i
        WHERE i.id = ?
    `
	err = h.DB.QueryRow(itemQuery, itemID).Scan(
		&item.ID, &item.Name, &item.Description, &item.Brand, &lastSalePrice, &retailPrice, &item.ItemsSold, &item.CategoryID, &releaseDate, &item.ImageURL, &item.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to query item details", http.StatusInternalServerError)
		}
		log.Printf("Database query error for item details: %v", err)
		return
	}

	if releaseDate.Valid {
		item.ReleaseDate = releaseDate.Time
	}

	if lastSalePrice.Valid {
		item.Price = lastSalePrice.Float64
	} else {
		item.Price = retailPrice
	}

	var inventory []InventoryInfo
	inventoryQuery := `
        SELECT ii.id, s.size_value, ii.price, ii.stock
        FROM item_inventory ii
        JOIN sizes s ON ii.size_id = s.id
        WHERE ii.item_id = ?
        ORDER BY s.id
    `
	invRows, err := h.DB.Query(inventoryQuery, itemID)
	if err != nil {
		http.Error(w, "Failed to query inventory", http.StatusInternalServerError)
		return
	}
	defer invRows.Close()

	for invRows.Next() {
		var invItem InventoryInfo
		if err := invRows.Scan(&invItem.InventoryID, &invItem.Size, &invItem.Price, &invItem.Stock); err != nil {
			http.Error(w, "Failed to scan inventory row", http.StatusInternalServerError)
			return
		}
		inventory = append(inventory, invItem)
	}

	var priceHistory []model.PriceHistory
	historyQuery := "SELECT id, item_id, price, type, recorded_at FROM price_history WHERE item_id = ? ORDER BY recorded_at ASC"
	histRows, err := h.DB.Query(historyQuery, itemID)
	if err != nil {
		http.Error(w, "Failed to query price history", http.StatusInternalServerError)
		return
	}
	defer histRows.Close()

	for histRows.Next() {
		var historyPoint model.PriceHistory
		if err := histRows.Scan(&historyPoint.ID, &historyPoint.ItemID, &historyPoint.Price, &historyPoint.Type, &historyPoint.RecordedAt); err != nil {
			http.Error(w, "Failed to scan price history row", http.StatusInternalServerError)
			return
		}
		priceHistory = append(priceHistory, historyPoint)
	}

	response := ItemDetailResponse{
		Item:         item,
		RetailPrice:  retailPrice, 
		Inventory:    inventory,
		PriceHistory: priceHistory,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}