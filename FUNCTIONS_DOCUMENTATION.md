# Todogo Application - Complete Functions Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Backend Functions](#backend-functions)
4. [Frontend Functions](#frontend-functions)
5. [How Frontend and Backend Work Together](#how-frontend-and-backend-work-together)
6. [Data Flow Examples](#data-flow-examples)

---

## Project Overview

**Todogo** is a full-stack todo management application built with:
- **Backend**: Go (Chi router, PostgreSQL)
- **Frontend**: Next.js 15 (React, TypeScript, TailwindCSS)
- **Architecture**: Clean Architecture with Layered Backend
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL

---

## Architecture Overview

### Backend Architecture (Layered)
```
┌─────────────────────────────────────────┐
│         HTTP Request                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Middleware Layer                        │
│  - CORS                                  │
│  - Authentication (JWT)                  │
│  - Logging                               │
│  - Panic Recovery                        │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Handler Layer                           │
│  - Parse HTTP requests                   │
│  - Validate input                        │
│  - Return HTTP responses                 │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Service Layer                           │
│  - Business logic                        │
│  - Orchestration                         │
│  - Transaction management                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Repository Layer                        │
│  - Database queries                      │
│  - Data mapping                          │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         PostgreSQL Database              │
└─────────────────────────────────────────┘
```

### Frontend Architecture (Clean Architecture)
```
┌─────────────────────────────────────────┐
│  Presentation Layer                      │
│  - React Components                      │
│  - Custom Hooks                          │
│  - UI State Management                   │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Application Layer (Use Cases)           │
│  - CreateTodo                            │
│  - UpdateTodo                            │
│  - DeleteTodo                            │
│  - GetTodos                              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Domain Layer                            │
│  - Todo Entity (business rules)          │
│  - Validation logic                      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│  Infrastructure Layer                    │
│  - API Repository (HTTP calls)           │
│  - LocalStorage Repository               │
│  - Auth Service                          │
│  - Mappers (DTO ↔ Domain)               │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│         Backend API                      │
└─────────────────────────────────────────┘
```

---

## Backend Functions

### 1. Entry Point
**File**: `backend/cmd/api/main.go`

#### `main()`
- **Purpose**: Application entry point
- **What it does**:
  - Loads environment configuration
  - Initializes database connection
  - Sets up dependency injection
  - Configures HTTP router with middleware
  - Starts the HTTP server on port 8080
- **Dependencies**: Config, Database, Handlers, Middleware

---

### 2. Configuration Management
**File**: `backend/internal/config/config.go`

#### `Load()`
- **Purpose**: Load and validate environment variables
- **What it does**:
  - Loads `.env` file
  - Reads DATABASE_URL, JWT_SECRET, PORT
  - Returns Config struct with all settings
- **Returns**: `*Config`

---

### 3. Database Layer
**File**: `backend/internal/database/db.go`

#### `InitDB(databaseURL string)`
- **Purpose**: Initialize PostgreSQL connection
- **What it does**:
  - Opens database connection using lib/pq driver
  - Pings database to verify connection
  - Sets connection pool settings
- **Returns**: `*sql.DB`, `error`

---

### 4. Authentication Service
**File**: `backend/internal/service/auth_service.go`

#### `NewAuthService(userRepo *repository.UserRepository, jwtSecret string)`
- **Purpose**: Create authentication service instance
- **Parameters**:
  - `userRepo`: User repository for data access
  - `jwtSecret`: Secret key for JWT signing
- **Returns**: `*AuthService`

#### `Register(ctx context.Context, req models.RegisterRequest)`
- **Purpose**: Register a new user
- **What it does**:
  1. Validates input (name, email, password)
  2. Checks if email already exists
  3. Hashes password with bcrypt (cost 10)
  4. Generates UUID for user
  5. Saves user to database
  6. Generates JWT token
  7. Returns user data and token
- **Parameters**: RegisterRequest (name, email, password)
- **Returns**: `*models.AuthResponse`, `error`

#### `Login(ctx context.Context, req models.LoginRequest)`
- **Purpose**: Authenticate existing user
- **What it does**:
  1. Validates input (email, password)
  2. Finds user by email
  3. Compares password hash with bcrypt
  4. Generates JWT token if valid
  5. Returns user data and token
- **Parameters**: LoginRequest (email, password)
- **Returns**: `*models.AuthResponse`, `error`

#### `generateToken(user *models.User)`
- **Purpose**: Generate JWT access token
- **What it does**:
  1. Creates JWT claims with user ID and email
  2. Sets expiration (24 hours)
  3. Signs token with HS256 algorithm
  4. Returns signed token string
- **Returns**: `string`, `error`

#### `ValidateToken(tokenString string)`
- **Purpose**: Validate JWT token
- **What it does**:
  1. Parses token string
  2. Verifies signature with secret
  3. Checks expiration
  4. Extracts claims (user ID, email)
- **Returns**: `*Claims`, `error`

---

### 5. Todo Service
**File**: `backend/internal/service/todo_service.go`

#### `NewTodoService(todoRepo *repository.TodoRepository)`
- **Purpose**: Create todo service instance
- **Returns**: `*TodoService`

#### `Create(ctx context.Context, req models.CreateTodoRequest, userID string)`
- **Purpose**: Create a new todo item
- **What it does**:
  1. Validates input (title required)
  2. Generates UUID for todo
  3. Sets default values (status=pending, priority=medium)
  4. Assigns to authenticated user
  5. Saves to database
  6. Returns created todo
- **Parameters**:
  - `req`: CreateTodoRequest (title, description, priority, dueDate, tags)
  - `userID`: Authenticated user's ID
- **Returns**: `*models.TodoResponse`, `error`

#### `GetByID(ctx context.Context, id, userID string)`
- **Purpose**: Retrieve a single todo by ID
- **What it does**:
  1. Validates UUID format
  2. Queries database for todo
  3. Ensures todo belongs to authenticated user
  4. Returns todo data
- **Returns**: `*models.TodoResponse`, `error`

#### `GetAll(ctx context.Context, userID string, filters models.TodoFilters)`
- **Purpose**: Retrieve all todos for a user with optional filters
- **What it does**:
  1. Builds SQL query with WHERE clauses
  2. Filters by status (pending/completed)
  3. Filters by priority (low/medium/high)
  4. Searches in title and description
  5. Filters by tags (array contains)
  6. Orders by creation date (newest first)
  7. Returns list of todos
- **Parameters**:
  - `userID`: User's ID
  - `filters`: Status, Priority, Search, Tags
- **Returns**: `[]models.TodoResponse`, `error`

#### `Update(ctx context.Context, id string, req models.UpdateTodoRequest, userID string)`
- **Purpose**: Update an existing todo
- **What it does**:
  1. Fetches existing todo
  2. Verifies ownership
  3. Updates only provided fields (partial update)
  4. Updates updated_at timestamp
  5. Saves to database
  6. Returns updated todo
- **Parameters**:
  - `id`: Todo ID
  - `req`: UpdateTodoRequest (title, description, priority, dueDate, tags)
  - `userID`: Authenticated user's ID
- **Returns**: `*models.TodoResponse`, `error`

#### `MarkAsCompleted(ctx context.Context, id, userID string)`
- **Purpose**: Mark a todo as completed
- **What it does**:
  1. Updates completed field to true
  2. Sets completed_at timestamp to now
  3. Updates status to "completed"
  4. Returns updated todo
- **Returns**: `*models.TodoResponse`, `error`

#### `MarkAsIncomplete(ctx context.Context, id, userID string)`
- **Purpose**: Mark a todo as incomplete
- **What it does**:
  1. Updates completed field to false
  2. Clears completed_at timestamp
  3. Updates status to "pending"
  4. Returns updated todo
- **Returns**: `*models.TodoResponse`, `error`

#### `Delete(ctx context.Context, id, userID string)`
- **Purpose**: Delete a todo
- **What it does**:
  1. Verifies todo exists and belongs to user
  2. Deletes from database
  3. Returns success
- **Returns**: `error`

---

### 6. User Repository
**File**: `backend/internal/repository/user_repository.go`

#### `NewUserRepository(db *sql.DB)`
- **Purpose**: Create user repository instance
- **Returns**: `*UserRepository`

#### `Create(ctx context.Context, user *models.User)`
- **Purpose**: Insert new user into database
- **What it does**:
  1. Executes INSERT SQL query
  2. Stores id, name, email, hashed password
  3. Sets created_at and updated_at timestamps
- **Returns**: `error`

#### `GetByEmail(ctx context.Context, email string)`
- **Purpose**: Find user by email address
- **What it does**:
  1. Executes SELECT query with email filter
  2. Scans result into User struct
  3. Returns nil if not found
- **Returns**: `*models.User`, `error`

#### `GetByID(ctx context.Context, id string)`
- **Purpose**: Find user by UUID
- **Returns**: `*models.User`, `error`

---

### 7. Todo Repository
**File**: `backend/internal/repository/todo_repository.go`

#### `NewTodoRepository(db *sql.DB)`
- **Purpose**: Create todo repository instance
- **Returns**: `*TodoRepository`

#### `Create(ctx context.Context, todo *models.Todo)`
- **Purpose**: Insert new todo into database
- **SQL Query**:
```sql
INSERT INTO todos (id, title, description, completed, status, priority, user_id, created_at, updated_at, due_date, tags)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
```
- **Returns**: `error`

#### `GetByID(ctx context.Context, id, userID string)`
- **Purpose**: Query single todo by ID and user
- **SQL Query**:
```sql
SELECT * FROM todos WHERE id = $1 AND user_id = $2
```
- **Returns**: `*models.Todo`, `error`

#### `GetAll(ctx context.Context, userID string, filters models.TodoFilters)`
- **Purpose**: Query all todos with dynamic filters
- **SQL Query** (example with all filters):
```sql
SELECT * FROM todos
WHERE user_id = $1
  AND ($2 = '' OR status = $2)
  AND ($3 = '' OR priority = $3)
  AND ($4 = '' OR title ILIKE $4 OR description ILIKE $4)
  AND ($5::text[] IS NULL OR tags && $5::text[])
ORDER BY created_at DESC
```
- **What it does**:
  - Builds dynamic WHERE clauses based on provided filters
  - Uses ILIKE for case-insensitive search
  - Uses array overlap operator (&&) for tag filtering
  - Orders by creation date descending
- **Returns**: `[]models.Todo`, `error`

#### `Update(ctx context.Context, todo *models.Todo)`
- **Purpose**: Update all fields of a todo
- **SQL Query**:
```sql
UPDATE todos
SET title=$1, description=$2, completed=$3, status=$4, priority=$5, updated_at=$6, completed_at=$7, due_date=$8, tags=$9
WHERE id=$10 AND user_id=$11
```
- **Returns**: `error`

#### `UpdateStatus(ctx context.Context, id, userID string, completed bool)`
- **Purpose**: Update only completion status
- **What it does**:
  - Sets completed field
  - Sets completed_at to now if completed=true, null if false
  - Updates status to "completed" or "pending"
- **Returns**: `error`

#### `Delete(ctx context.Context, id, userID string)`
- **Purpose**: Delete todo from database
- **SQL Query**:
```sql
DELETE FROM todos WHERE id = $1 AND user_id = $2
```
- **Returns**: `error`

---

### 8. HTTP Handlers

#### Auth Handler
**File**: `backend/internal/handler/auth_handler.go`

##### `Register(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: POST /api/v1/auth/register
- **What it does**:
  1. Parses JSON request body
  2. Calls AuthService.Register
  3. Returns 201 with user data and token
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```
- **Response**:
```json
{
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "eyJhbGc..."
  }
}
```

##### `Login(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: POST /api/v1/auth/login
- **What it does**:
  1. Parses JSON request body
  2. Calls AuthService.Login
  3. Returns 200 with user data and token
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Todo Handler
**File**: `backend/internal/handler/todo_handler.go`

##### `Create(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: POST /api/v1/todos
- **Authentication**: Required (JWT)
- **What it does**:
  1. Extracts user ID from JWT context
  2. Parses JSON request body
  3. Calls TodoService.Create
  4. Returns 201 with created todo
- **Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "dueDate": "2025-11-26T10:00:00Z",
  "tags": ["shopping", "urgent"]
}
```

##### `GetAll(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: GET /api/v1/todos?status=pending&priority=high&search=buy&tags=shopping
- **Authentication**: Required (JWT)
- **What it does**:
  1. Extracts user ID from context
  2. Parses query parameters (filters)
  3. Calls TodoService.GetAll
  4. Returns 200 with list of todos
- **Query Parameters**:
  - `status`: "pending" or "completed"
  - `priority`: "low", "medium", or "high"
  - `search`: Search in title and description
  - `tags`: Comma-separated tags

##### `GetByID(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: GET /api/v1/todos/:id
- **Authentication**: Required (JWT)
- **What it does**:
  1. Extracts todo ID from URL parameter
  2. Calls TodoService.GetByID
  3. Returns 200 with todo data

##### `Update(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: PUT /api/v1/todos/:id
- **Authentication**: Required (JWT)
- **What it does**:
  1. Extracts todo ID and user ID
  2. Parses JSON request body
  3. Calls TodoService.Update
  4. Returns 200 with updated todo

##### `MarkAsCompleted(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: PATCH /api/v1/todos/:id/complete
- **Authentication**: Required (JWT)
- **What it does**:
  1. Calls TodoService.MarkAsCompleted
  2. Returns 200 with updated todo

##### `MarkAsIncomplete(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: PATCH /api/v1/todos/:id/incomplete
- **Authentication**: Required (JWT)
- **What it does**:
  1. Calls TodoService.MarkAsIncomplete
  2. Returns 200 with updated todo

##### `Delete(w http.ResponseWriter, r *http.Request)`
- **Endpoint**: DELETE /api/v1/todos/:id
- **Authentication**: Required (JWT)
- **What it does**:
  1. Calls TodoService.Delete
  2. Returns 204 No Content

---

### 9. Middleware

#### Authentication Middleware
**File**: `backend/internal/middleware/auth.go`

##### `AuthMiddleware(authService *service.AuthService)`
- **Purpose**: Validate JWT token and extract user info
- **What it does**:
  1. Extracts Authorization header
  2. Validates "Bearer <token>" format
  3. Calls AuthService.ValidateToken
  4. Adds user ID to request context
  5. Allows request to proceed if valid
  6. Returns 401 if invalid or missing
- **Applied to**: All /api/v1/todos/* routes

#### Logger Middleware
**File**: `backend/internal/middleware/logger.go`

##### `LoggerMiddleware()`
- **Purpose**: Log all HTTP requests
- **What it does**:
  - Logs method, path, status code, duration
  - Uses structured logging (zerolog)

#### Recovery Middleware
**File**: `backend/internal/middleware/recover.go`

##### `RecoverMiddleware()`
- **Purpose**: Catch panics and prevent server crashes
- **What it does**:
  - Recovers from panics
  - Logs stack trace
  - Returns 500 Internal Server Error

---

## Frontend Functions

### 1. Domain Layer

#### Todo Entity
**File**: `frontend/src/core/domain/Todo.ts`

```typescript
class Todo {
  constructor(
    public id: string,
    public title: string,
    public description: string | null,
    public completed: boolean,
    public status: TodoStatus,
    public priority: TodoPriority,
    public userId: string,
    public createdAt: Date,
    public updatedAt: Date,
    public completedAt: Date | null,
    public dueDate: Date | null,
    public tags: string[]
  ) {}
}
```

##### `toggleComplete(): void`
- **Purpose**: Toggle completion status
- **What it does**:
  - Flips completed boolean
  - Updates status to "completed" or "pending"
  - Sets/clears completedAt timestamp

##### `updateTitle(title: string): void`
- **Purpose**: Update todo title with validation
- **What it does**:
  - Validates title is not empty
  - Validates length <= 200 characters
  - Updates title field
- **Throws**: Error if validation fails

##### `updateDescription(description: string | null): void`
- **Purpose**: Update todo description
- **What it does**:
  - Allows null for no description
  - Updates description field

##### `updatePriority(priority: TodoPriority): void`
- **Purpose**: Change priority level
- **What it does**:
  - Validates priority is "low", "medium", or "high"
  - Updates priority field

##### `setDueDate(dueDate: Date | null): void`
- **Purpose**: Set or clear due date
- **What it does**:
  - Validates date is in future if provided
  - Updates dueDate field

##### `addTag(tag: string): void`
- **Purpose**: Add a tag to the todo
- **What it does**:
  - Validates tag is not empty
  - Checks tag doesn't already exist
  - Adds to tags array

##### `removeTag(tag: string): void`
- **Purpose**: Remove a tag from the todo
- **What it does**:
  - Filters out the specified tag
  - Updates tags array

##### `isOverdue(): boolean`
- **Purpose**: Check if todo is past due date
- **What it does**:
  - Compares dueDate to current date
  - Returns true if overdue and not completed

##### `validate(): { isValid: boolean; errors: string[] }`
- **Purpose**: Validate all todo fields
- **What it does**:
  - Checks title is not empty and <= 200 chars
  - Validates priority is valid enum value
  - Validates status is valid enum value
  - Validates dueDate is in future if set
  - Returns validation result with error messages

---

### 2. Application Layer (Use Cases)

#### CreateTodo Use Case
**File**: `frontend/src/core/application/CreateTodo.ts`

##### `execute(dto: CreateTodoDTO): Promise<Todo>`
- **Purpose**: Create a new todo with business logic
- **What it does**:
  1. Creates new Todo domain entity
  2. Validates entity using Todo.validate()
  3. Calls repository.save()
  4. Returns created todo
- **Parameters**: CreateTodoDTO (title, description, priority, dueDate, tags)
- **Returns**: Promise<Todo>

#### GetTodos Use Case
**File**: `frontend/src/core/application/GetTodos.ts`

##### `execute(userId: string, filters?: TodoFilters): Promise<Todo[]>`
- **Purpose**: Retrieve todos with optional filtering
- **What it does**:
  1. Validates userId is not empty
  2. Calls repository.findAll(userId, filters)
  3. Returns list of todos
- **Parameters**:
  - `userId`: User's ID
  - `filters`: Optional filters (status, priority, search, tags)
- **Returns**: Promise<Todo[]>

#### GetTodoById Use Case
**File**: `frontend/src/core/application/GetTodoById.ts`

##### `execute(id: string): Promise<Todo | null>`
- **Purpose**: Retrieve a single todo by ID
- **What it does**:
  1. Validates ID format
  2. Calls repository.findById(id)
  3. Returns todo or null if not found
- **Returns**: Promise<Todo | null>

#### UpdateTodo Use Case
**File**: `frontend/src/core/application/UpdateTodo.ts`

##### `execute(id: string, dto: UpdateTodoDTO): Promise<Todo>`
- **Purpose**: Update existing todo with validation
- **What it does**:
  1. Fetches existing todo
  2. Applies updates to domain entity
  3. Validates updated entity
  4. Calls repository.update()
  5. Returns updated todo
- **Parameters**:
  - `id`: Todo ID
  - `dto`: UpdateTodoDTO (partial updates)
- **Returns**: Promise<Todo>

#### UpdateTodoStatus Use Case
**File**: `frontend/src/core/application/UpdateTodoStatus.ts`

##### `execute(id: string, completed: boolean): Promise<Todo>`
- **Purpose**: Toggle todo completion status
- **What it does**:
  1. Fetches existing todo
  2. Calls todo.toggleComplete()
  3. Saves via repository.update()
  4. Returns updated todo
- **Parameters**:
  - `id`: Todo ID
  - `completed`: New completion status
- **Returns**: Promise<Todo>

#### DeleteTodo Use Case
**File**: `frontend/src/core/application/DeleteTodo.ts`

##### `execute(id: string): Promise<void>`
- **Purpose**: Delete a todo
- **What it does**:
  1. Validates ID
  2. Calls repository.delete(id)
  3. Returns void on success
- **Returns**: Promise<void>

---

### 3. Infrastructure Layer

#### API Todo Repository
**File**: `frontend/src/infrastructure/persistence/APITodoRepository.ts`

Implements `ITodoRepository` interface using HTTP calls to backend API.

##### `findAll(userId: string, filters?: TodoFilters): Promise<Todo[]>`
- **Purpose**: Fetch todos from backend API
- **What it does**:
  1. Builds query string from filters
  2. Adds JWT token to Authorization header
  3. Makes GET request to /api/v1/todos
  4. Maps response DTOs to domain entities using TodoMapper
  5. Returns array of Todo entities
- **HTTP**: GET http://localhost:8080/api/v1/todos?status=...&priority=...

##### `findById(id: string): Promise<Todo | null>`
- **Purpose**: Fetch single todo from backend
- **What it does**:
  1. Makes GET request to /api/v1/todos/:id
  2. Returns null if 404
  3. Maps response to domain entity
- **HTTP**: GET http://localhost:8080/api/v1/todos/:id

##### `save(todo: Todo): Promise<Todo>`
- **Purpose**: Create new todo via backend API
- **What it does**:
  1. Maps domain entity to DTO using TodoMapper
  2. Makes POST request with JSON body
  3. Maps response back to domain entity
  4. Returns created todo
- **HTTP**: POST http://localhost:8080/api/v1/todos

##### `update(todo: Todo): Promise<Todo>`
- **Purpose**: Update existing todo via backend API
- **What it does**:
  1. Maps domain entity to DTO
  2. Makes PUT request with JSON body
  3. Maps response back to domain entity
  4. Returns updated todo
- **HTTP**: PUT http://localhost:8080/api/v1/todos/:id

##### `delete(id: string): Promise<void>`
- **Purpose**: Delete todo via backend API
- **What it does**:
  1. Makes DELETE request
  2. Returns void on success
- **HTTP**: DELETE http://localhost:8080/api/v1/todos/:id

##### `markAsCompleted(id: string): Promise<Todo>`
- **Purpose**: Mark todo as completed via backend
- **HTTP**: PATCH http://localhost:8080/api/v1/todos/:id/complete

##### `markAsPending(id: string): Promise<Todo>`
- **Purpose**: Mark todo as pending via backend
- **HTTP**: PATCH http://localhost:8080/api/v1/todos/:id/incomplete

#### LocalStorage Todo Repository
**File**: `frontend/src/infrastructure/persistence/LocalStorageTodoRepository.ts`

Alternative implementation that stores todos in browser's localStorage (for offline mode).

##### Functions:
- Same interface as APITodoRepository
- Stores todos in localStorage as JSON
- Generates UUIDs client-side
- No network requests

#### Auth Service
**File**: `frontend/src/infrastructure/services/AuthService.ts`

##### `register(data: { name: string; email: string; password: string }): Promise<AuthResponse>`
- **Purpose**: Register new user
- **What it does**:
  1. Makes POST request to /api/v1/auth/register
  2. Stores token in localStorage
  3. Stores user data in localStorage
  4. Returns auth response
- **HTTP**: POST http://localhost:8080/api/v1/auth/register

##### `login(data: { email: string; password: string }): Promise<AuthResponse>`
- **Purpose**: Login existing user
- **What it does**:
  1. Makes POST request to /api/v1/auth/login
  2. Stores token in localStorage
  3. Stores user data in localStorage
  4. Returns auth response
- **HTTP**: POST http://localhost:8080/api/v1/auth/login

##### `logout(): void`
- **Purpose**: Clear authentication state
- **What it does**:
  - Removes token from localStorage
  - Removes user data from localStorage

##### `getToken(): string | null`
- **Purpose**: Retrieve stored JWT token
- **Returns**: Token string or null

##### `getUser(): User | null`
- **Purpose**: Retrieve stored user data
- **Returns**: User object or null

##### `isAuthenticated(): boolean`
- **Purpose**: Check if user is logged in
- **What it does**:
  - Checks if token exists in localStorage
- **Returns**: boolean

##### `setToken(token: string): void`
- **Purpose**: Store JWT token
- **What it does**:
  - Saves token to localStorage with key "authToken"

##### `setUser(user: User): void`
- **Purpose**: Store user data
- **What it does**:
  - Saves user object to localStorage as JSON

#### Todo Mapper
**File**: `frontend/src/infrastructure/mappers/TodoMapper.ts`

##### `toDomain(dto: TodoDTO): Todo`
- **Purpose**: Convert API response to domain entity
- **What it does**:
  - Maps DTO fields to domain entity
  - Converts date strings to Date objects
  - Creates Todo instance
- **Parameters**: TodoDTO (API response format)
- **Returns**: Todo (domain entity)

##### `toDTO(todo: Todo): TodoDTO`
- **Purpose**: Convert domain entity to API request format
- **What it does**:
  - Maps domain entity fields to DTO
  - Converts Date objects to ISO strings
  - Prepares data for API request
- **Parameters**: Todo (domain entity)
- **Returns**: TodoDTO (API request format)

---

### 4. Presentation Layer

#### Custom Hooks

##### useTodos
**File**: `frontend/src/presentation/hooks/useTodos.ts`

```typescript
function useTodos(userId: string, filters?: TodoFilters)
```
- **Purpose**: Fetch and cache todos with React Query
- **What it does**:
  - Uses React Query's useQuery hook
  - Calls GetTodos use case
  - Automatically refetches on window focus
  - Caches results for 5 minutes
- **Returns**: `{ data: Todo[], isLoading, error, refetch }`

##### useCreateTodo
**File**: `frontend/src/presentation/hooks/useCreateTodo.ts`

```typescript
function useCreateTodo()
```
- **Purpose**: Create todo mutation with optimistic updates
- **What it does**:
  - Uses React Query's useMutation hook
  - Calls CreateTodo use case
  - Invalidates todos cache on success
  - Shows success/error toast notifications
- **Returns**: `{ mutate, mutateAsync, isLoading, error }`

##### useUpdateTodo
**File**: `frontend/src/presentation/hooks/useUpdateTodo.ts`

```typescript
function useUpdateTodo()
```
- **Purpose**: Update todo mutation
- **What it does**:
  - Uses useMutation hook
  - Calls UpdateTodo use case
  - Invalidates cache on success
  - Shows notifications
- **Returns**: `{ mutate, mutateAsync, isLoading, error }`

##### useToggleTodo
**File**: `frontend/src/presentation/hooks/useToggleTodo.ts`

```typescript
function useToggleTodo()
```
- **Purpose**: Toggle todo completion with optimistic UI update
- **What it does**:
  - Optimistically updates UI before API call
  - Calls UpdateTodoStatus use case
  - Rolls back on error
  - Invalidates cache on success
- **Returns**: `{ mutate, isLoading }`

##### useDeleteTodo
**File**: `frontend/src/presentation/hooks/useDeleteTodo.ts`

```typescript
function useDeleteTodo()
```
- **Purpose**: Delete todo mutation
- **What it does**:
  - Calls DeleteTodo use case
  - Invalidates cache on success
  - Shows confirmation before delete
  - Shows success/error notifications
- **Returns**: `{ mutate, isLoading }`

##### useLogin
**File**: `frontend/src/presentation/hooks/useLogin.ts`

```typescript
function useLogin()
```
- **Purpose**: Login mutation
- **What it does**:
  - Calls AuthService.login
  - Updates AuthContext on success
  - Shows error notifications
  - Redirects to home page
- **Returns**: `{ mutate, isLoading, error }`

##### useRegister
**File**: `frontend/src/presentation/hooks/useRegister.ts`

```typescript
function useRegister()
```
- **Purpose**: Register mutation
- **What it does**:
  - Calls AuthService.register
  - Updates AuthContext on success
  - Shows error notifications
  - Redirects to home page
- **Returns**: `{ mutate, isLoading, error }`

#### React Components

##### TodoList
**File**: `frontend/src/presentation/components/features/TodoList.tsx`

```typescript
function TodoList({ todos, isLoading, filters, onFilterChange })
```
- **Purpose**: Display list of todos with filtering
- **What it does**:
  - Renders TodoFilters component
  - Maps over todos array
  - Renders TodoItem for each todo
  - Shows loading skeleton
  - Shows empty state if no todos
- **Props**:
  - `todos`: Array of Todo entities
  - `isLoading`: Loading state
  - `filters`: Current filter values
  - `onFilterChange`: Callback for filter updates

##### TodoItem
**File**: `frontend/src/presentation/components/features/TodoItem.tsx`

```typescript
function TodoItem({ todo, onToggle, onEdit, onDelete })
```
- **Purpose**: Display and interact with single todo
- **What it does**:
  - Shows checkbox for completion
  - Displays title, description, priority
  - Shows tags as badges
  - Shows due date with overdue indicator
  - Provides edit and delete buttons
  - Applies strikethrough style if completed
- **Props**:
  - `todo`: Todo entity
  - `onToggle`: Callback for completion toggle
  - `onEdit`: Callback for edit action
  - `onDelete`: Callback for delete action

##### TodoFilters
**File**: `frontend/src/presentation/components/features/TodoFilters.tsx`

```typescript
function TodoFilters({ filters, onChange })
```
- **Purpose**: Filter controls for todo list
- **What it does**:
  - Provides status filter (All/Pending/Completed)
  - Provides priority filter (All/Low/Medium/High)
  - Provides search input
  - Provides tag multi-select
  - Calls onChange when filters change
- **Props**:
  - `filters`: Current filter values
  - `onChange`: Callback with updated filters

##### AddTodoForm
**File**: `frontend/src/presentation/components/forms/AddTodoForm.tsx`

```typescript
function AddTodoForm({ onClose })
```
- **Purpose**: Form to create new todo
- **What it does**:
  - Uses react-hook-form for form state
  - Validates with Zod schema
  - Title field (required, max 200 chars)
  - Description textarea (optional)
  - Priority select (default: medium)
  - Due date picker (optional)
  - Tags input (comma-separated)
  - Calls useCreateTodo on submit
  - Closes dialog on success
- **Form Fields**:
  - Title (required)
  - Description (optional)
  - Priority (low/medium/high)
  - Due Date (optional)
  - Tags (optional)

##### EditTodoForm
**File**: `frontend/src/presentation/components/forms/EditTodoForm.tsx`

```typescript
function EditTodoForm({ todo, onClose })
```
- **Purpose**: Form to edit existing todo
- **What it does**:
  - Pre-fills form with existing values
  - Same fields as AddTodoForm
  - Calls useUpdateTodo on submit
  - Shows loading state during update
- **Props**:
  - `todo`: Existing todo to edit
  - `onClose`: Callback to close dialog

##### LoginForm
**File**: `frontend/src/presentation/components/forms/LoginForm.tsx`

```typescript
function LoginForm({ onSuccess })
```
- **Purpose**: User login form
- **What it does**:
  - Email input with validation
  - Password input (masked)
  - Remember me checkbox (optional)
  - Calls useLogin on submit
  - Shows validation errors
  - Disables submit during loading
- **Form Fields**:
  - Email (required, email format)
  - Password (required, min 6 chars)

##### RegisterForm
**File**: `frontend/src/presentation/components/forms/RegisterForm.tsx`

```typescript
function RegisterForm({ onSuccess })
```
- **Purpose**: User registration form
- **What it does**:
  - Name input (required)
  - Email input with validation
  - Password input (min 6 chars)
  - Confirm password (must match)
  - Calls useRegister on submit
  - Shows validation errors
- **Form Fields**:
  - Name (required)
  - Email (required, email format)
  - Password (required, min 6 chars)
  - Confirm Password (must match)

##### AuthDialog
**File**: `frontend/src/presentation/components/features/AuthDialog.tsx`

```typescript
function AuthDialog({ open, onClose })
```
- **Purpose**: Modal dialog for login/register
- **What it does**:
  - Shows tabs for Login and Register
  - Renders LoginForm or RegisterForm
  - Closes on successful auth
  - Provides switch between login/register
- **Props**:
  - `open`: Dialog open state
  - `onClose`: Callback to close dialog

#### Context Providers

##### AuthProvider
**File**: `frontend/src/presentation/providers/AuthProvider.tsx`

```typescript
function AuthProvider({ children })
```
- **Purpose**: Provide authentication state to entire app
- **What it does**:
  - Loads user and token from localStorage on mount
  - Provides user, token, isAuthenticated state
  - Provides login, logout, register functions
  - Updates context when auth state changes
- **Context Values**:
  - `user`: Current user object or null
  - `token`: JWT token or null
  - `isAuthenticated`: boolean
  - `login`: Function to login
  - `register`: Function to register
  - `logout`: Function to logout

##### QueryProvider
**File**: `frontend/src/presentation/providers/QueryProvider.tsx`

```typescript
function QueryProvider({ children })
```
- **Purpose**: Provide React Query client to app
- **What it does**:
  - Creates QueryClient instance
  - Configures default query options
  - Enables React Query DevTools in development
- **Configuration**:
  - staleTime: 5 minutes
  - cacheTime: 10 minutes
  - refetchOnWindowFocus: true

##### ToasterProvider
**File**: `frontend/src/presentation/providers/ToasterProvider.tsx`

```typescript
function ToasterProvider({ children })
```
- **Purpose**: Provide toast notifications system
- **What it does**:
  - Renders Toaster component from shadcn/ui
  - Allows toast.success(), toast.error(), toast.info()
  - Auto-dismiss after 5 seconds
  - Stacks multiple toasts

---

## How Frontend and Backend Work Together

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Registration Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. User fills RegisterForm
   ├─ Name: "John Doe"
   ├─ Email: "john@example.com"
   └─ Password: "securepass"

2. User clicks "Register" button
   ↓
3. RegisterForm validates input with Zod schema
   ├─ Name: Required
   ├─ Email: Valid email format
   └─ Password: Min 6 characters

4. useRegister hook triggers mutation
   ↓
5. AuthService.register() makes HTTP request
   ├─ URL: POST http://localhost:8080/api/v1/auth/register
   ├─ Headers: { Content-Type: "application/json" }
   └─ Body: { name, email, password }

6. Backend receives request at AuthHandler.Register
   ↓
7. AuthService.Register processes request
   ├─ Validates input
   ├─ Checks email doesn't exist
   ├─ Hashes password with bcrypt (cost 10)
   ├─ Generates UUID for user
   └─ Saves to database

8. UserRepository.Create executes SQL
   ├─ INSERT INTO users (id, name, email, password, ...)
   └─ VALUES (uuid, "John Doe", "john@example.com", hash, ...)

9. AuthService.generateToken creates JWT
   ├─ Claims: { user_id, email, exp }
   ├─ Algorithm: HS256
   ├─ Expiration: 24 hours
   └─ Signs with JWT_SECRET

10. Backend returns response
    ├─ Status: 201 Created
    └─ Body: { data: { user: {...}, token: "eyJhbGc..." } }

11. Frontend AuthService receives response
    ├─ Stores token in localStorage (key: "authToken")
    └─ Stores user in localStorage (key: "authUser")

12. AuthProvider context updates
    ├─ Sets user state
    ├─ Sets token state
    └─ Sets isAuthenticated = true

13. App re-renders with authenticated state
    └─ User is redirected to home page
```

### Todo Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Create Todo Flow                              │
└─────────────────────────────────────────────────────────────────┘

1. User opens AddTodoForm dialog
   └─ Clicks "Add Todo" button

2. User fills form
   ├─ Title: "Buy groceries"
   ├─ Description: "Milk, eggs, bread"
   ├─ Priority: "high"
   ├─ Due Date: "2025-11-26"
   └─ Tags: "shopping, urgent"

3. User clicks "Create" button
   ↓
4. AddTodoForm validates input with react-hook-form + Zod
   ├─ Title: Required, max 200 chars
   ├─ Priority: Must be low/medium/high
   └─ Due Date: Must be future date

5. useCreateTodo hook triggers mutation
   ↓
6. CreateTodo use case executes
   ├─ Creates Todo domain entity
   ├─ Validates entity with Todo.validate()
   └─ Calls repository.save(todo)

7. APITodoRepository.save() prepares HTTP request
   ├─ Maps Todo entity to DTO with TodoMapper.toDTO()
   ├─ Gets JWT token from AuthService.getToken()
   └─ Prepares request

8. HTTP request sent to backend
   ├─ Method: POST
   ├─ URL: http://localhost:8080/api/v1/todos
   ├─ Headers:
   │   ├─ Content-Type: application/json
   │   └─ Authorization: Bearer eyJhbGc...
   └─ Body:
       {
         "title": "Buy groceries",
         "description": "Milk, eggs, bread",
         "priority": "high",
         "dueDate": "2025-11-26T00:00:00Z",
         "tags": ["shopping", "urgent"]
       }

9. Backend receives request
   ↓
10. Request passes through middleware chain
    ├─ RecoverMiddleware (panic recovery)
    ├─ LoggerMiddleware (logs request)
    ├─ CORSMiddleware (adds CORS headers)
    └─ AuthMiddleware
        ├─ Extracts Authorization header
        ├─ Validates token with AuthService.ValidateToken
        ├─ Extracts user_id from JWT claims
        └─ Adds user_id to request context

11. Chi router matches POST /api/v1/todos
    └─ Routes to TodoHandler.Create

12. TodoHandler.Create processes request
    ├─ Extracts user_id from context
    ├─ Parses JSON body to CreateTodoRequest
    ├─ Validates struct with go-playground/validator
    └─ Calls TodoService.Create

13. TodoService.Create executes business logic
    ├─ Generates UUID for todo
    ├─ Sets default values (completed=false, status=pending)
    ├─ Sets timestamps (created_at, updated_at)
    ├─ Assigns user_id from context
    └─ Calls TodoRepository.Create

14. TodoRepository.Create executes SQL
    ├─ SQL: INSERT INTO todos (id, title, description, completed, status, priority, user_id, created_at, updated_at, due_date, tags)
    │      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    └─ Parameters: [uuid, "Buy groceries", "Milk, eggs...", false, "pending", "high", user_id, now, now, due_date, ["shopping", "urgent"]]

15. PostgreSQL executes INSERT
    └─ Returns success

16. Backend returns response
    ├─ Status: 201 Created
    └─ Body:
        {
          "data": {
            "id": "123e4567-...",
            "title": "Buy groceries",
            "description": "Milk, eggs, bread",
            "completed": false,
            "status": "pending",
            "priority": "high",
            "userId": "user-uuid",
            "createdAt": "2025-11-25T10:00:00Z",
            "updatedAt": "2025-11-25T10:00:00Z",
            "completedAt": null,
            "dueDate": "2025-11-26T00:00:00Z",
            "tags": ["shopping", "urgent"]
          }
        }

17. Frontend APITodoRepository receives response
    ├─ Maps DTO to Todo entity with TodoMapper.toDomain()
    └─ Returns Todo entity

18. React Query mutation succeeds
    ├─ Invalidates "todos" query cache
    ├─ Triggers automatic refetch of todos
    └─ Shows success toast notification

19. useTodos hook refetches data
    └─ New todo appears in TodoList

20. UI updates automatically
    ├─ AddTodoForm dialog closes
    ├─ TodoList re-renders with new todo
    └─ Success message displayed
```

### Todo Toggle Completion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 Toggle Todo Completion Flow                      │
└─────────────────────────────────────────────────────────────────┘

1. User clicks checkbox on TodoItem
   └─ Todo: "Buy groceries" (currently pending)

2. TodoItem calls onToggle callback
   ↓
3. useToggleTodo hook triggers mutation
   ├─ Optimistic Update: Immediately checks checkbox in UI
   └─ Saves previous state for rollback

4. UpdateTodoStatus use case executes
   ├─ Calls repository.markAsCompleted(id)
   └─ (or repository.markAsPending(id) if unchecking)

5. APITodoRepository.markAsCompleted() makes HTTP request
   ├─ Method: PATCH
   ├─ URL: http://localhost:8080/api/v1/todos/123e4567.../complete
   ├─ Headers: Authorization: Bearer <token>
   └─ Body: (empty for PATCH)

6. Backend AuthMiddleware validates token
   ├─ Extracts user_id
   └─ Adds to context

7. TodoHandler.MarkAsCompleted processes request
   ├─ Extracts todo ID from URL parameter
   ├─ Extracts user_id from context
   └─ Calls TodoService.MarkAsCompleted

8. TodoService.MarkAsCompleted executes
   ├─ Verifies todo exists and belongs to user
   ├─ Calls TodoRepository.UpdateStatus
   └─ Parameters: (id, user_id, completed=true)

9. TodoRepository.UpdateStatus executes SQL
   ├─ UPDATE todos
   │  SET completed = true,
   │      status = 'completed',
   │      completed_at = NOW(),
   │      updated_at = NOW()
   │  WHERE id = $1 AND user_id = $2
   └─ PostgreSQL executes UPDATE

10. Backend returns response
    ├─ Status: 200 OK
    └─ Body: { data: { ...updated todo... } }

11. Frontend receives response
    ├─ Mutation succeeds
    ├─ Invalidates todos cache
    └─ Refetches todos

12. UI updates
    ├─ Checkbox remains checked (confirming optimistic update)
    ├─ Strikethrough applied to title
    ├─ Completed badge appears
    └─ CompletedAt timestamp shown

If error occurs:
├─ Rollback optimistic update
├─ Uncheck checkbox
└─ Show error toast
```

### Todo Filtering Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Filter Todos Flow                             │
└─────────────────────────────────────────────────────────────────┘

1. User interacts with TodoFilters component
   ├─ Selects status: "pending"
   ├─ Selects priority: "high"
   ├─ Types search: "grocery"
   └─ Selects tags: ["shopping"]

2. TodoFilters calls onChange callback
   └─ Passes filters: { status: "pending", priority: "high", search: "grocery", tags: ["shopping"] }

3. Parent component updates filters state
   └─ React state updates trigger re-render

4. useTodos hook detects filter change
   ├─ React Query dependency on filters
   └─ Triggers new query with updated filters

5. GetTodos use case executes
   └─ Calls repository.findAll(userId, filters)

6. APITodoRepository.findAll() builds query string
   ├─ Base URL: http://localhost:8080/api/v1/todos
   └─ Query params: ?status=pending&priority=high&search=grocery&tags=shopping

7. HTTP GET request sent with query parameters
   └─ Authorization: Bearer <token>

8. Backend AuthMiddleware validates
   └─ Extracts user_id

9. TodoHandler.GetAll parses query parameters
   ├─ status: "pending"
   ├─ priority: "high"
   ├─ search: "grocery"
   └─ tags: ["shopping"]

10. TodoService.GetAll calls repository
    └─ Passes filters to TodoRepository.GetAll

11. TodoRepository.GetAll builds dynamic SQL query
    ├─ Base query: SELECT * FROM todos WHERE user_id = $1
    ├─ Adds: AND status = $2 (if status provided)
    ├─ Adds: AND priority = $3 (if priority provided)
    ├─ Adds: AND (title ILIKE $4 OR description ILIKE $4) (if search provided)
    │   └─ Pattern: %grocery%
    ├─ Adds: AND tags && $5::text[] (if tags provided)
    │   └─ Array overlap operator checks if any tag matches
    └─ Orders: ORDER BY created_at DESC

12. PostgreSQL executes filtered query
    └─ Returns matching rows

13. Backend returns filtered results
    ├─ Status: 200 OK
    └─ Body: { data: [ ...filtered todos... ] }

14. Frontend maps DTOs to domain entities
    └─ TodoMapper.toDomain() for each result

15. React Query caches results with filter key
    └─ Cache key includes filters for proper cache management

16. TodoList re-renders with filtered results
    └─ Shows only todos matching all filters
```

---

## Data Flow Examples

### Complete Request-Response Cycle

#### Example 1: User Login

```
User Browser                Frontend (Next.js)              Backend (Go)                 Database (PostgreSQL)
     │                            │                              │                              │
     │──(1) Fill login form────→│                              │                              │
     │   email: john@example.com │                              │                              │
     │   password: mypassword     │                              │                              │
     │                            │                              │                              │
     │──(2) Click "Login"──────→│                              │                              │
     │                            │                              │                              │
     │                            │──(3) Validate form──────→│                              │
     │                            │    (Zod schema)            │                              │
     │                            │                              │                              │
     │                            │──(4) POST /api/v1/auth/login──→│                              │
     │                            │    Headers:                 │                              │
     │                            │      Content-Type: json     │                              │
     │                            │    Body:                    │                              │
     │                            │      { email, password }    │                              │
     │                            │                              │                              │
     │                            │                              │──(5) AuthMiddleware──────→│
     │                            │                              │    (CORS, Logging)         │
     │                            │                              │                              │
     │                            │                              │──(6) AuthHandler.Login───→│
     │                            │                              │                              │
     │                            │                              │──(7) AuthService.Login───→│
     │                            │                              │    - Validate input        │
     │                            │                              │                              │
     │                            │                              │──(8) UserRepository.GetByEmail─→│
     │                            │                              │    SELECT * FROM users      │
     │                            │                              │    WHERE email = $1         │
     │                            │                              │                              │
     │                            │                              │←─(9) Return user row──────│
     │                            │                              │                              │
     │                            │                              │──(10) bcrypt.Compare─────→│
     │                            │                              │     (password vs hash)     │
     │                            │                              │                              │
     │                            │                              │──(11) generateToken───────→│
     │                            │                              │     JWT with user_id       │
     │                            │                              │     Expires in 24h         │
     │                            │                              │                              │
     │                            │←─(12) 200 OK─────────────────│                              │
     │                            │    { data: {                │                              │
     │                            │      user: {                │                              │
     │                            │        id, name, email      │                              │
     │                            │      },                     │                              │
     │                            │      token: "eyJhbGc..."    │                              │
     │                            │    }}                       │                              │
     │                            │                              │                              │
     │                            │──(13) Store in localStorage─→│                              │
     │                            │      authToken              │                              │
     │                            │      authUser               │                              │
     │                            │                              │                              │
     │                            │──(14) Update AuthContext──→│                              │
     │                            │      user, token, isAuth   │                              │
     │                            │                              │                              │
     │←─(15) Redirect to home───│                              │                              │
     │    App re-renders         │                              │                              │
     │    Show dashboard         │                              │                              │
```

#### Example 2: Fetch Todos on Page Load

```
User Browser          Frontend (Next.js)              Backend (Go)              Database (PostgreSQL)
     │                      │                              │                           │
     │──(1) Navigate to /──→│                              │                           │
     │                      │                              │                           │
     │                      │──(2) Page component renders─→│                           │
     │                      │    useTodos hook executes    │                           │
     │                      │                              │                           │
     │                      │──(3) Check user auth────────→│                           │
     │                      │    AuthContext.isAuth = true │                           │
     │                      │    userId from localStorage  │                           │
     │                      │                              │                           │
     │                      │──(4) React Query checks cache─→│                           │
     │                      │    Cache miss or stale       │                           │
     │                      │                              │                           │
     │                      │──(5) GetTodos.execute()─────→│                           │
     │                      │                              │                           │
     │                      │──(6) GET /api/v1/todos──────→│                           │
     │                      │    Authorization: Bearer token│                           │
     │                      │                              │                           │
     │                      │                              │──(7) AuthMiddleware───────→│
     │                      │                              │    Validate JWT           │
     │                      │                              │    Extract user_id        │
     │                      │                              │    Add to context         │
     │                      │                              │                           │
     │                      │                              │──(8) TodoHandler.GetAll──→│
     │                      │                              │    Extract user_id        │
     │                      │                              │    Parse filters (none)   │
     │                      │                              │                           │
     │                      │                              │──(9) TodoService.GetAll──→│
     │                      │                              │                           │
     │                      │                              │──(10) TodoRepository.GetAll→│
     │                      │                              │     SELECT * FROM todos   │
     │                      │                              │     WHERE user_id = $1    │
     │                      │                              │     ORDER BY created_at   │
     │                      │                              │                           │
     │                      │                              │←─(11) Return todo rows────│
     │                      │                              │     [{...}, {...}, ...]   │
     │                      │                              │                           │
     │                      │←─(12) 200 OK─────────────────│                           │
     │                      │    { data: [                │                           │
     │                      │      { id, title, ... },    │                           │
     │                      │      { id, title, ... },    │                           │
     │                      │      ...                    │                           │
     │                      │    ]}                       │                           │
     │                      │                              │                           │
     │                      │──(13) Map DTOs to entities──→│                           │
     │                      │     TodoMapper.toDomain()    │                           │
     │                      │     for each item            │                           │
     │                      │                              │                           │
     │                      │──(14) Cache results─────────→│                           │
     │                      │     React Query cache        │                           │
     │                      │     Key: ["todos", userId]   │                           │
     │                      │                              │                           │
     │←─(15) Render TodoList│                              │                           │
     │    Show loading state│                              │                           │
     │    Then show todos   │                              │                           │
```

### Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Handling Example                        │
└─────────────────────────────────────────────────────────────────┘

Scenario: User tries to create todo with invalid token

1. User submits AddTodoForm
   ↓
2. Frontend sends POST /api/v1/todos
   └─ Authorization: Bearer <expired_token>

3. Backend AuthMiddleware validates token
   ├─ jwt.Parse() detects expired token
   └─ Returns error

4. AuthMiddleware sends 401 response
   ├─ Status: 401 Unauthorized
   └─ Body: { error: "Invalid or expired token" }

5. Frontend receives 401 response
   ├─ APITodoRepository.save() throws error
   └─ Error propagates to mutation

6. React Query mutation fails
   ├─ onError callback executes
   └─ Error state updated

7. UI responds to error
   ├─ toast.error("Authentication failed. Please login again.")
   ├─ Clears auth state (logout)
   ├─ Redirects to login page
   └─ AddTodoForm closes

Alternative: Validation Error

1. User submits form with empty title
   ↓
2. Frontend Zod validation catches error
   └─ Error: "Title is required"

3. Form shows validation error
   ├─ Red border on input field
   ├─ Error message below field
   └─ Submit button remains disabled

4. No API call made
   └─ Prevents unnecessary network request
```

### Optimistic Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  Optimistic Update Example                       │
└─────────────────────────────────────────────────────────────────┘

Scenario: User toggles todo completion

1. User clicks checkbox
   └─ Todo: "Buy milk" (currently pending)

2. useToggleTodo mutation starts
   ├─ onMutate callback executes BEFORE API call
   └─ Immediately updates UI optimistically

3. Optimistic update applied
   ├─ Get current cache data
   ├─ Create new cache data with updated todo
   │   ├─ completed: true
   │   ├─ status: "completed"
   │   └─ completedAt: now
   ├─ Set new cache data
   └─ Save previous data for rollback

4. UI updates immediately
   ├─ Checkbox appears checked
   ├─ Strikethrough applied to title
   └─ No loading spinner

5. API call sent in background
   └─ PATCH /api/v1/todos/:id/complete

6a. Success case:
    ├─ Backend returns updated todo
    ├─ onSuccess callback executes
    ├─ Invalidate cache (triggers refetch)
    ├─ UI already shows correct state
    └─ User perceives instant response

6b. Error case:
    ├─ Backend returns error
    ├─ onError callback executes
    ├─ Restore previous cache data (rollback)
    ├─ Checkbox unchecked
    ├─ Show error toast
    └─ User sees revert to previous state
```

---

## Summary

### Backend Summary

**Layers:**
1. **Handler Layer** - HTTP request/response handling (7 endpoints)
2. **Service Layer** - Business logic (2 services: Auth, Todo)
3. **Repository Layer** - Data access (2 repositories: User, Todo)
4. **Middleware** - Cross-cutting concerns (Auth, Logging, Recovery, CORS)

**Key Features:**
- JWT authentication with 24-hour expiration
- bcrypt password hashing (cost 10)
- User-scoped data access (all todos filtered by user_id)
- SQL injection prevention (parameterized queries)
- Structured logging with zerolog
- Panic recovery middleware
- CORS support for frontend

### Frontend Summary

**Layers (Clean Architecture):**
1. **Domain Layer** - Business entities and rules (Todo class with validation)
2. **Application Layer** - Use cases (6 use cases for CRUD operations)
3. **Infrastructure Layer** - External adapters (API repository, Auth service)
4. **Presentation Layer** - UI components and hooks (React components, custom hooks)

**Key Features:**
- React Query for server state management with caching
- Optimistic updates for instant UI feedback
- Clean Architecture ensures testability and maintainability
- Zod schemas for form validation
- react-hook-form for form state management
- shadcn/ui for accessible UI components
- TailwindCSS for styling
- JWT token stored in localStorage
- Automatic token injection in all API requests

### Communication

- Frontend makes HTTP requests to backend API
- Backend validates JWT on all protected routes
- Frontend uses React Query for caching and auto-refetching
- Backend returns JSON responses with consistent format
- Errors handled gracefully on both sides
- Optimistic updates provide instant UI feedback
- PostgreSQL stores all data persistently

---

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Todos (All require JWT)
- `GET /api/v1/todos` - List all todos (with optional filters)
- `POST /api/v1/todos` - Create new todo
- `GET /api/v1/todos/:id` - Get single todo
- `PUT /api/v1/todos/:id` - Update todo
- `DELETE /api/v1/todos/:id` - Delete todo
- `PATCH /api/v1/todos/:id/complete` - Mark as completed
- `PATCH /api/v1/todos/:id/incomplete` - Mark as incomplete

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgres://user:password@localhost:5432/todogo?sslmode=disable
JWT_SECRET=your-secret-key-here
PORT=8080
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

This documentation provides a complete overview of all functions in both frontend and backend, explaining how they work individually and together as a cohesive application.
