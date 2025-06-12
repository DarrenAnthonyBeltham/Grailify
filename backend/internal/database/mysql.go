package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func InitDB() *sql.DB {
	dsn := fmt.Sprintf("root:@tcp(127.0.0.1:3306)/grailify?parseTime=true")

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to open database connection: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Successfully connected to the database.")
	return db
}

func CloseDB(db *sql.DB) {
    if db != nil {
        err := db.Close()
        if err != nil {
            log.Printf("Failed to close database connection: %v", err)
        }
    }
}
