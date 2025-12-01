# Todogo - Full-Stack Todo Application

A modern, production-ready full-stack todo application built with Clean Architecture principles.

## 🏗️ Architecture

This is a microservices-based application with:

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Go with Chi router
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
Todogo/
├── frontend/           # Next.js 15 application
│   ├── src/
│   │   ├── app/        # Next.js App Router
│   │   ├── core/       # Domain & Application layer
│   │   ├── infrastructure/  # External adapters
│   │   ├── presentation/    # UI components
│   │   └── shared/     # Utilities & types
│   ├── Dockerfile
│   └── package.json
│
├── backend/            # Go application
│   ├── cmd/            # Application entry points
│   ├── internal/       # Private application code
│   ├── pkg/            # Public libraries
│   ├── migrations/     # Database migrations
│   ├── Dockerfile
│   └── go.mod
│
└── docker-compose.yml  # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Go 1.22+ (for local development)
- PostgreSQL 16+ (for local development)

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd Todogo

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

## 🛠️ Development

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Development

```bash
cd backend

# Install dependencies
go mod download

# Run migrations
migrate -path migrations -database "postgresql://user:password@localhost:5432/todogo?sslmode=disable" up

# Start server
go run cmd/api/main.go
```

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## 🎯 Features

### Frontend
- ✅ Clean Architecture with clear separation of concerns
- ✅ TypeScript for type safety
- ✅ React Query for state management
- ✅ React Hook Form with Zod validation
- ✅ Radix UI components with TailwindCSS
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Filtering and search
- ✅ Server-side rendering (SSR)

### Backend
- ✅ RESTful API with Chi router
- ✅ JWT authentication
- ✅ PostgreSQL with connection pooling
- ✅ bcrypt password hashing
- ✅ CORS middleware
- ✅ Structured logging with zerolog
- ✅ Request validation
- ✅ Error handling middleware
- ✅ Database migrations

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
API_BASE_URL=http://localhost:8080/api/v1
```

#### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todogo
JWT_SECRET=your-secret-key
PORT=8080
```

## 🐳 Docker Configuration

### Services

1. **Frontend** (Node.js 20 Alpine)
   - Port: 3000
   - Built with multi-stage Dockerfile
   - Optimized for production

2. **Backend** (Go 1.22 Alpine)
   - Port: 8080
   - Compiled binary
   - Minimal image size

3. **Database** (PostgreSQL 16 Alpine)
   - Port: 5432
   - Persistent volume
   - Auto-migrations

### Docker Compose Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Execute commands in container
docker-compose exec frontend sh
docker-compose exec backend sh

# Stop services
docker-compose stop

# Remove containers and volumes
docker-compose down -v
```

## 📊 Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
go test ./...
```

## 🚀 Deployment

### Production Build

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup

1. Set production environment variables
2. Configure SSL/TLS certificates
3. Setup reverse proxy (nginx/traefik)
4. Configure database backups
5. Setup monitoring and logging

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment-based secrets
- SQL injection prevention
- Input validation
- Rate limiting (recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Go community for excellent libraries
- shadcn/ui for beautiful components
- Radix UI for accessible primitives
