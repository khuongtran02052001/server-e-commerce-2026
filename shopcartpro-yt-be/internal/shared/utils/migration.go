package utils

import (
	"fmt"
	"log"
	postgresql "module-shop/internal/adapters/db"
	"module-shop/internal/adapters/models"
)

func Migrate() {
	dbInstance, err := postgresql.ConnectDB()
	if err != nil || dbInstance == nil {
		log.Panicf("Failed to connect to the database: %v", err)
	}

	if dbInstance.PG == nil {
		log.Panic("DB connection is nil")
	}

	if err := dbInstance.PG.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		log.Panicf("Failed to create extension: %v", err)
	}

	if err := dbInstance.PG.AutoMigrate(
		&models.Blog{},
		&models.BlogCategory{},
		&models.BlogBlogCategory{}); err != nil {
		log.Panicf("AutoMigrate failed: %v", err)
	}

	fmt.Println("👍 Migration complete! ")
}
