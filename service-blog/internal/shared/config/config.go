package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	// Trên production (Koyeb) env được set từ dashboard, không cần .env
	if os.Getenv("SERVICE_BLOG_ENV") == "production" {
		return
	}

	// Local/dev: thử load .env, thiếu thì chỉ warn (không die)
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found (ignored): %v", err)
	}
}

func GetEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
