.PHONY: help build run test clean migrate-up migrate-down docker-build docker-run

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the application
	@echo "Building..."
	@go build -o bin/server cmd/api/main.go

run: ## Run the application
	@echo "Running..."
	@go run cmd/api/main.go

test: ## Run tests
	@echo "Testing..."
	@go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "Testing with coverage..."
	@go test -cover ./...
	@go test -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out

deps: ## Download dependencies
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy

migrate-up: ## Run database migrations up
	@echo "Running migrations up..."
	@migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" up

migrate-down: ## Run database migrations down
	@echo "Running migrations down..."
	@migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" down

migrate-create: ## Create a new migration (usage: make migrate-create name=create_table_name)
	@migrate create -ext sql -dir migrations -seq $(name)

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	@docker build -t todogo-backend .

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	@docker run -p 8080:8080 --env-file .env todogo-backend

lint: ## Run linter
	@echo "Running linter..."
	@golangci-lint run

format: ## Format code
	@echo "Formatting code..."
	@go fmt ./...
	@goimports -w .

dev: ## Run with hot reload (requires air)
	@air
