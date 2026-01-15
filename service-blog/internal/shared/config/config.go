package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	// Load the .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Printf("No .env file found: %v", err)
	}
}

// Function to get the value from an environment variable
func GetEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
