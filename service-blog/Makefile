.PHONY: build local-db 

build:
	go build -ldflags "-s -w" -o ./tmp/server ./cmd/server/main.go


local-db:
	@docker-compose down
	@docker-compose up -d

generate:
	go run scripts/generate.go  
