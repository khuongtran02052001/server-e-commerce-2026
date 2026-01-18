package main

import (
	"log"
	postgresql "module-shop/internal/adapters/db"
	router "module-shop/internal/router"
	"module-shop/internal/shared/config"
	"module-shop/internal/shared/utils"
	"os"
)

func main() {
	config.LoadEnv()
	db, errDB := postgresql.ConnectDB()
	if errDB != nil {
		log.Fatalf("Something wrong: %v", errDB)
	}
	if os.Getenv("DB_MIGRATE") == "true" {
		utils.Migrate()
	}
	// fake.GenerateAllVietnameseData(db)
	router := router.InitRouter(db)

	err := router.SetTrustedProxies(nil)
	if err != nil {
		log.Fatalf("Failed to set trusted proxies: %v", err)
	}
	port := os.Getenv("BLOG_PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
	router.Run()
}
