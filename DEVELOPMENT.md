# Todogo Development Guide

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Windows
.\scripts\setup.bat

# Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually
docker-compose up -d
```

### Option 2: Local Development

#### Prerequisites
- Node.js 18+
- Go 1.22+
- PostgreSQL 16+

#### Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Update .env with your settings

# Install dependencies
go mod download

# Install migrate CLI
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
make migrate-up

# Start server
go run cmd/api/main.go
# or
make run
```

#### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1" > .env.local

# Start development server
npm run dev
```

## Project Commands

### Docker Commands

```bash
# Build images
docker-compose build

# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove volumes (reset database)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

### Backend Commands

```bash
cd backend

# Build
make build

# Run
make run

# Test
make test

# Test with coverage
make test-coverage

# Run migrations
make migrate-up

# Rollback migrations
make migrate-down

# Create new migration
make migrate-create name=create_new_table

# Lint
make lint

# Format code
make format

# Build Docker image
make docker-build

# Run Docker container
make docker-run
```

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run type-check

# Clean build artifacts
rm -rf .next
```

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todogo
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h

# Server
PORT=8080
ENV=development

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Docker Compose Environment

Edit `docker-compose.yml` for production settings:
- Update `JWT_SECRET` with a strong random key
- Update `CORS_ALLOWED_ORIGINS` with your domain
- Update `POSTGRES_PASSWORD` with a strong password

## Database Management

### Migrations

```bash
cd backend

# Create new migration
migrate create -ext sql -dir migrations -seq create_new_table

# Run migrations
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" up

# Rollback last migration
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" down 1

# Force version (if stuck)
migrate -path migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" force VERSION
```

### Direct Database Access

```bash
# Using psql
psql -h localhost -U postgres -d todogo

# Using Docker
docker exec -it todogo-db psql -U postgres -d todogo

# Backup database
docker exec todogo-db pg_dump -U postgres todogo > backup.sql

# Restore database
docker exec -i todogo-db psql -U postgres todogo < backup.sql
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
go test ./...

# Run tests with verbose output
go test -v ./...

# Run tests with coverage
go test -cover ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run specific test
go test -v ./internal/service -run TestAuthService
```

### Frontend Tests (Setup Required)

```bash
cd frontend

# Run tests (when configured)
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Debugging

### Backend Debugging

Add this to your VSCode `launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}/backend/cmd/api",
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_USER": "postgres",
        "DB_PASSWORD": "postgres",
        "DB_NAME": "todogo",
        "JWT_SECRET": "test-secret",
        "PORT": "8080"
      }
    }
  ]
}
```

### Frontend Debugging

Frontend debugging works automatically in VSCode with Next.js.

### View Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f db

# All logs
docker-compose logs -f
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if database is running
docker ps | grep todogo-db

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Frontend Can't Connect to Backend

1. Check if backend is running: http://localhost:8080/health
2. Verify CORS settings in `backend/cmd/api/main.go`
3. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Migrations Failed

```bash
# Check current migration version
docker exec todogo-db psql -U postgres -d todogo -c "SELECT * FROM schema_migrations;"

# Force to specific version
migrate -path backend/migrations -database "postgresql://postgres:postgres@localhost:5432/todogo?sslmode=disable" force VERSION

# Drop database and recreate
docker-compose down -v
docker-compose up -d
```

## Development Workflow

### Adding a New Feature

1. **Backend**:
   - Add model in `internal/models/`
   - Add repository methods in `internal/repository/`
   - Add service methods in `internal/service/`
   - Add handlers in `internal/handler/`
   - Update routes in `cmd/api/main.go`
   - Write tests

2. **Frontend**:
   - Add domain entity in `src/core/domain/`
   - Add use cases in `src/core/application/`
   - Add UI components in `src/presentation/components/`
   - Add hooks in `src/presentation/hooks/`
   - Update pages in `src/app/`

### Making Database Changes

1. Create migration:
```bash
cd backend
make migrate-create name=your_change_name
```

2. Edit the generated `.up.sql` and `.down.sql` files

3. Run migration:
```bash
make migrate-up
```

4. Update models and repositories

### Code Style

#### Backend (Go)
- Run `make format` before committing
- Follow Go best practices
- Add comments for exported functions
- Write table-driven tests

#### Frontend (TypeScript)
- Run `npm run lint` before committing
- Use TypeScript strictly
- Follow Clean Architecture layers
- Write meaningful component names

## Production Deployment

### Build Production Images

```bash
# Build all images
docker-compose -f docker-compose.yml build

# Tag for registry
docker tag todogo-backend:latest your-registry/todogo-backend:v1.0.0
docker tag todogo-frontend:latest your-registry/todogo-frontend:v1.0.0

# Push to registry
docker push your-registry/todogo-backend:v1.0.0
docker push your-registry/todogo-frontend:v1.0.0
```

### Environment Setup

1. Update environment variables in production
2. Use strong JWT secret
3. Configure proper CORS origins
4. Enable SSL for database
5. Set up proper logging
6. Configure backup strategy

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Go Documentation](https://go.dev/doc/)
- [Chi Router](https://go-chi.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
