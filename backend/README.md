# Todogo Backend

A production-ready RESTful API built with Go, Chi router, PostgreSQL, and JWT authentication.

## 🚀 Tech Stack

- **Language**: Go 1.22
- **Web Framework**: Chi v5 (go-chi/chi/v5)
- **Database**: PostgreSQL 16 with lib/pq driver
- **Authentication**: JWT (golang-jwt/jwt/v5)
- **Password Hashing**: bcrypt (golang.org/x/crypto)
- **Validation**: go-playground/validator
- **CORS**: go-chi/cors
- **Logging**: zerolog
- **Configuration**: godotenv
- **Container**: Alpine Linux

## 📁 Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration management
│   ├── database/
│   │   └── db.go             # Database connection
│   ├── handler/
│   │   ├── auth_handler.go   # Authentication handlers
│   │   └── todo_handler.go   # Todo handlers
│   ├── middleware/
│   │   ├── auth.go           # JWT authentication middleware
│   │   ├── logger.go         # Request logging middleware
│   │   └── recover.go        # Panic recovery middleware
│   ├── models/
│   │   ├── user.go           # User models & DTOs
│   │   └── todo.go           # Todo models & DTOs
│   ├── repository/
│   │   ├── user_repository.go # User database operations
│   │   └── todo_repository.go # Todo database operations
│   └── service/
│       ├── auth_service.go    # Authentication business logic
│       └── todo_service.go    # Todo business logic
├── migrations/
│   ├── 000001_create_users_table.up.sql
│   ├── 000001_create_users_table.down.sql
│   ├── 000002_create_todos_table.up.sql
│   └── 000002_create_todos_table.down.sql
├── pkg/
│   └── response/
│       └── response.go        # HTTP response helpers
├── .env.example
├── .gitignore
├── Dockerfile
├── go.mod
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Go 1.22+
- PostgreSQL 16+
- migrate CLI (for migrations)

### Installation

```bash
# Clone the repository
cd backend

# Install dependencies
go mod download

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todogo
DB_SSLMODE=disable

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=24h

PORT=8080
ENV=development

CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Database Setup

```bash
# Install golang-migrate
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" up

# Rollback migrations (if needed)
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" down
```

### Running the Application

```bash
# Development
go run cmd/api/main.go

# Build
go build -o bin/server cmd/api/main.go

# Run binary
./bin/server
```

## 🐳 Docker

### Build Image

```bash
docker build -t todogo-backend .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=todogo \
  -e JWT_SECRET=your-secret-key \
  todogo-backend
```

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Todos (Protected Routes)

All todo endpoints require JWT authentication:
```http
Authorization: Bearer <your-jwt-token>
```

#### Create Todo
```http
POST /api/v1/todos
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the todo app",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["work", "urgent"]
}
```

#### Get All Todos
```http
GET /api/v1/todos?status=pending&priority=high&search=project
```

#### Get Todo by ID
```http
GET /api/v1/todos/{id}
```

#### Update Todo
```http
PUT /api/v1/todos/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["work"]
}
```

#### Mark as Completed
```http
PATCH /api/v1/todos/{id}/complete
```

#### Mark as Incomplete
```http
PATCH /api/v1/todos/{id}/incomplete
```

#### Delete Todo
```http
DELETE /api/v1/todos/{id}
```

### Health Check
```http
GET /health
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Todos Table
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'medium',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    due_date TIMESTAMP,
    tags TEXT[]
);
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention with parameterized queries
- Request validation
- Panic recovery middleware
- Secure headers

## 🧪 Testing

```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "error message",
  "errors": ["validation error 1", "validation error 2"]
}
```

## 🚀 Deployment

### Docker Compose

The backend is configured to work with Docker Compose. See the root `docker-compose.yml` for the complete setup.

### Environment Variables for Production

- Use strong JWT secrets
- Enable SSL for database connections
- Configure proper CORS origins
- Use production logging levels

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
