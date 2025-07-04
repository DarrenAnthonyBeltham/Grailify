package handler

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
	"github.com/gorilla/mux"
	"grailify/internal/model"
)

type ItemsHandler struct {
	DB *sql.DB
}

type UpdateListingPayload struct {
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

type TrendingResponse struct {
	TrendingSneakers         []model.Item `json:"trendingSneakers"`
	TrendingApparelAccessories []model.Item `json:"trendingApparelAccessories"`
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
	Seller      string  `json:"seller"` 
}

type AllSizeInfo struct {
	ID   int    `json:"id"`
	Size string `json:"size"`
}

type ItemDetailResponse struct {
	Item         model.Item           `json:"item"`
	DisplayPrice float64              `json:"displayPrice"`
	PriceHistory []model.PriceHistory `json:"priceHistory"`
	Inventory    []InventoryInfo      `json:"inventory"`
	AllSizes     []AllSizeInfo        `json:"allSizes"` 
}

type SearchResult struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Brand    string `json:"brand"`
	ImageURL string `json:"imageUrl"`
}

type SellPageCategory struct {
	ID    int          `json:"id"`
	Name  string       `json:"name"`
	Slug  string       `json:"slug"`
	Items []model.Item `json:"items"`
}

type ListingPayload struct {
    ItemID      int     `json:"itemId"`
    Size        string  `json:"size"`
    Price       float64 `json:"price"`
    Stock       int     `json:"stock"`
}

func (h *ItemsHandler) CreateListing(w http.ResponseWriter, r *http.Request) {
    userID, ok := r.Context().Value("userID").(int)
    if !ok {
        http.Error(w, "Unauthorized: Could not get user ID from token", http.StatusUnauthorized)
        return
    }

    var payload ListingPayload
    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    var sizeID int
    var sizeIDNull sql.NullInt64
    if payload.Size != "" && payload.Size != "One Size" { 
        err := h.DB.QueryRow("SELECT id FROM sizes WHERE size_value = ?", payload.Size).Scan(&sizeID)
        if err != nil {
            if err == sql.ErrNoRows {
                http.Error(w, "Invalid size provided", http.StatusBadRequest)
                return
            }
            http.Error(w, "Database error finding size", http.StatusInternalServerError)
            return
        }
        sizeIDNull = sql.NullInt64{Int64: int64(sizeID), Valid: true}
    }

    query := "INSERT INTO item_inventory (item_id, user_id, size_id, price, stock) VALUES (?, ?, ?, ?, ?)"
    
    _, err := h.DB.Exec(query, payload.ItemID, userID, sizeIDNull, payload.Price, payload.Stock)
    if err != nil {
        log.Printf("Error creating listing for user %d: %v", userID, err)
        http.Error(w, "Failed to create listing", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(map[string]string{"message": "Listing created successfully!"})
}

func (h *ItemsHandler) GetSellPageData(w http.ResponseWriter, r *http.Request) {
	query := `
        SELECT 
            c.id as category_id, 
            c.name as category_name, 
            c.slug as category_slug, 
            i.id as item_id, 
            i.name as item_name, 
            i.brand as item_brand, 
            i.image_url as item_image_url, 
            i.price as item_price
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id
        ORDER BY c.id, i.items_sold DESC
    `
	rows, err := h.DB.Query(query)
	if err != nil {
		http.Error(w, "Failed to fetch sell page data", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	categoryMap := make(map[int]*SellPageCategory)
	var categories []*SellPageCategory 

	for rows.Next() {
		var catID int
		var catName, catSlug string
		var item model.Item
		var itemID sql.NullInt64
		var itemName, itemBrand, itemImageURL sql.NullString
		var itemPrice sql.NullFloat64

		if err := rows.Scan(&catID, &catName, &catSlug, &itemID, &itemName, &itemBrand, &itemImageURL, &itemPrice); err != nil {
			log.Printf("Error scanning sell page data: %v", err)
			continue
		}

		if _, ok := categoryMap[catID]; !ok {
			categoryMap[catID] = &SellPageCategory{
				ID:    catID,
				Name:  catName,
				Slug:  catSlug,
				Items: []model.Item{},
			}
			categories = append(categories, categoryMap[catID])
		}
		
		if itemID.Valid {
			item.ID = int(itemID.Int64)
			item.Name = itemName.String
			item.Brand = itemBrand.String
			item.ImageURL = itemImageURL.String
			item.Price = itemPrice.Float64
			categoryMap[catID].Items = append(categoryMap[catID].Items, item)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

func (h *ItemsHandler) GetTrendingItems(w http.ResponseWriter, r *http.Request) {
	
	fetchItems := func(query string) ([]model.Item, error) {
		rows, err := h.DB.Query(query)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		var items []model.Item
		for rows.Next() {
			var item model.Item
			var displayPrice float64
			if err := rows.Scan(&item.ID, &item.Name, &item.Brand, &item.ImageURL, &displayPrice); err != nil {
				log.Printf("Error scanning trending item: %v", err)
				continue
			}
			item.Price = math.Ceil(displayPrice/10.0) * 10.0
			items = append(items, item)
		}
		return items, rows.Err()
	}

	sneakersQuery := `
        SELECT id, name, brand, image_url,
        COALESCE(
            (SELECT price FROM price_history WHERE item_id = items.id AND type = 'sale' ORDER BY recorded_at DESC LIMIT 1),
            price
        ) as display_price
        FROM items
        WHERE category_id = 1
        ORDER BY items_sold DESC
        LIMIT 4`
	
	sneakers, err := fetchItems(sneakersQuery)
	if err != nil {
		http.Error(w, "Failed to fetch trending sneakers", http.StatusInternalServerError)
		return
	}

	apparelQuery := `
        SELECT id, name, brand, image_url,
        COALESCE(
            (SELECT price FROM price_history WHERE item_id = items.id AND type = 'sale' ORDER BY recorded_at DESC LIMIT 1),
            price
        ) as display_price
        FROM items
        WHERE category_id IN (2, 5)
        ORDER BY items_sold DESC
        LIMIT 4`

	apparelAccessories, err := fetchItems(apparelQuery)
	if err != nil {
		http.Error(w, "Failed to fetch trending apparel & accessories", http.StatusInternalServerError)
		return
	}

	response := TrendingResponse{
		TrendingSneakers:         sneakers,
		TrendingApparelAccessories: apparelAccessories,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
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
	page, err := strconv.Atoi(params.Get("page"))
	if err != nil || page < 1 {
		page = 1
	}
	limit := 50

	countQuery := "SELECT COUNT(DISTINCT i.id) FROM items i LEFT JOIN categories c ON i.category_id = c.id WHERE LOWER(c.slug) = ? OR ? = 'allgrails'"
	var totalItems int
	err = h.DB.QueryRow(countQuery, strings.ToLower(categorySlug), strings.ToLower(categorySlug)).Scan(&totalItems)
	if err != nil {
		http.Error(w, "Failed to count items", http.StatusInternalServerError)
		return
	}
	totalPages := (totalItems + limit - 1) / limit
	offset := (page - 1) * limit

	dataQuery := `
        SELECT i.id, i.name, i.description, i.brand, i.image_url, i.created_at,
        COALESCE(
            (SELECT ph.price FROM price_history ph WHERE ph.item_id = i.id AND ph.type = 'sale' ORDER BY ph.recorded_at DESC LIMIT 1),
            i.price
        ) as display_price
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE LOWER(c.slug) = ? OR ? = 'allgrails'
        ORDER BY i.id
        LIMIT ? OFFSET ?
    `
	rows, err := h.DB.Query(dataQuery, strings.ToLower(categorySlug), strings.ToLower(categorySlug), limit, offset)
	if err != nil {
		http.Error(w, "Failed to query items", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var items []model.Item
	for rows.Next() {
		var item model.Item
		var description, imageUrl sql.NullString
		var createdAt sql.NullTime

		if err := rows.Scan(&item.ID, &item.Name, &description, &item.Brand, &imageUrl, &createdAt, &item.Price); err != nil {
			http.Error(w, "Failed to scan item", http.StatusInternalServerError)
			return
		}

		item.Description = description.String
		item.ImageURL = imageUrl.String
		if createdAt.Valid {
			item.CreatedAt = createdAt.Time
		}
		
		item.Price = math.Ceil(item.Price/10.0) * 10.0
		items = append(items, item)
	}
    if err = rows.Err(); err != nil {
        http.Error(w, "Row iteration error", http.StatusInternalServerError)
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
	itemID, _ := strconv.Atoi(itemIDStr)

	var item model.Item
	var releaseDate sql.NullTime

	itemQuery := "SELECT id, name, description, brand, price, items_sold, category_id, release_date, image_url, created_at FROM items WHERE id = ?"
	err := h.DB.QueryRow(itemQuery, itemID).Scan(
		&item.ID, &item.Name, &item.Description, &item.Brand, &item.Price, &item.ItemsSold, &item.CategoryID, &releaseDate, &item.ImageURL, &item.CreatedAt,
	)

	if err != nil {
		http.Error(w, "Item not found", http.StatusNotFound)
		return
	}
	if releaseDate.Valid {
		item.ReleaseDate = releaseDate.Time
	}

	var lastSalePrice float64
	priceQuery := "SELECT price FROM price_history WHERE item_id = ? AND type = 'sale' ORDER BY recorded_at DESC LIMIT 1"
	err = h.DB.QueryRow(priceQuery, itemID).Scan(&lastSalePrice)
	if err != nil {
		lastSalePrice = item.Price
	}

	displayPrice := math.Ceil(lastSalePrice/10.0) * 10.0

	var inventory []InventoryInfo
	inventoryQuery := `
        SELECT 
            ii.id, 
            s.size_value, 
            ii.price, 
            ii.stock,
            COALESCE(u.username, 'Grailify Store') AS seller_name
        FROM item_inventory ii
        LEFT JOIN sizes s ON ii.size_id = s.id
        LEFT JOIN users u ON ii.user_id = u.id
        WHERE ii.item_id = ?
        ORDER BY ii.price ASC, seller_name ASC
    `
	invRows, err := h.DB.Query(inventoryQuery, itemID)
	if err != nil {
		http.Error(w, "Failed to query inventory", http.StatusInternalServerError)
		return
	}
	defer invRows.Close()

	for invRows.Next() {
		var invItem InventoryInfo
		var sizeValue sql.NullString;
		if err := invRows.Scan(&invItem.InventoryID, &sizeValue, &invItem.Price, &invItem.Stock, &invItem.Seller); err != nil {
			http.Error(w, "Failed to scan inventory row", http.StatusInternalServerError)
			return
		}
		if sizeValue.Valid {
			invItem.Size = sizeValue.String
		} else {
			invItem.Size = "One Size" 
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

	var allSizes []AllSizeInfo
	allSizesQuery := "SELECT id, size_value FROM sizes WHERE category_id = ? ORDER BY id"
	allSizesRows, err := h.DB.Query(allSizesQuery, item.CategoryID)
	if err != nil {
		log.Printf("Could not fetch all sizes for category %d: %v", item.CategoryID, err)
	} else {
		defer allSizesRows.Close()
		for allSizesRows.Next() {
			var size AllSizeInfo
			if err := allSizesRows.Scan(&size.ID, &size.Size); err != nil {
				log.Printf("Failed to scan a size row: %v", err)
				continue
			}
			allSizes = append(allSizes, size)
		}
	}

	response := ItemDetailResponse{
		Item:         item,
		DisplayPrice: displayPrice,
		Inventory:    inventory,
		PriceHistory: priceHistory,
		AllSizes:     allSizes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ItemsHandler) UpdateListing(w http.ResponseWriter, r *http.Request) {
    userID, ok := r.Context().Value("userID").(int)
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    vars := mux.Vars(r)
    listingID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "Invalid listing ID", http.StatusBadRequest)
        return
    }

    var payload UpdateListingPayload
    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    query := "UPDATE item_inventory SET price = ?, stock = ? WHERE id = ? AND user_id = ?"
    result, err := h.DB.Exec(query, payload.Price, payload.Stock, listingID, userID)
    if err != nil {
        log.Printf("Error updating listing %d for user %d: %v", listingID, userID, err)
        http.Error(w, "Failed to update listing", http.StatusInternalServerError)
        return
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        http.Error(w, "Failed to check rows affected", http.StatusInternalServerError)
        return
    }

    if rowsAffected == 0 {
        http.Error(w, "Listing not found or you do not have permission to edit it", http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "Listing updated successfully"})
}

func (h *ItemsHandler) DeleteListing(w http.ResponseWriter, r *http.Request) {
    userID, ok := r.Context().Value("userID").(int)
    if !ok {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }

    vars := mux.Vars(r)
    listingID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "Invalid listing ID", http.StatusBadRequest)
        return
    }

    query := "DELETE FROM item_inventory WHERE id = ? AND user_id = ?"
    result, err := h.DB.Exec(query, listingID, userID)
    if err != nil {
        log.Printf("Error deleting listing %d for user %d: %v", listingID, userID, err)
        http.Error(w, "Failed to delete listing", http.StatusInternalServerError)
        return
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        http.Error(w, "Failed to check rows affected", http.StatusInternalServerError)
        return
    }

    if rowsAffected == 0 {
        http.Error(w, "Listing not found or you do not have permission to delete it", http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{"message": "Listing deleted successfully"})
}