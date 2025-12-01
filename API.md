# API Documentation

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

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

## Endpoints

### Authentication

#### Register User

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Validation Rules:**
- `name`: required, min 2 characters
- `email`: required, valid email format
- `password`: required, min 8 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "user registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation failed
- `409 Conflict`: User with email already exists
- `500 Internal Server Error`: Server error

---

#### Login

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Validation Rules:**
- `email`: required, valid email format
- `password`: required

**Success Response (200):**
```json
{
  "success": true,
  "message": "login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

---

### Todos

All todo endpoints require authentication.

#### Create Todo

```http
POST /api/v1/todos
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation for the todo application",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["work", "documentation", "urgent"]
}
```

**Validation Rules:**
- `title`: required, max 200 characters
- `description`: optional
- `priority`: optional, one of: `low`, `medium`, `high` (default: `medium`)
- `due_date`: optional, valid ISO 8601 datetime
- `tags`: optional, array of strings

**Success Response (201):**
```json
{
  "success": true,
  "message": "todo created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation for the todo application",
    "completed": false,
    "status": "pending",
    "priority": "high",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "completed_at": null,
    "due_date": "2024-12-31T23:59:59Z",
    "tags": ["work", "documentation", "urgent"]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body or validation failed
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### Get All Todos

```http
GET /api/v1/todos?status=pending&priority=high&search=project&tags=work
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status - `pending`, `in_progress`, `completed`
- `priority` (optional): Filter by priority - `low`, `medium`, `high`
- `search` (optional): Search in title and description
- `tags` (optional): Filter by tags (comma-separated)

**Success Response (200):**
```json
{
  "success": true,
  "message": "todos fetched successfully",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project documentation",
      "description": "Write comprehensive API documentation",
      "completed": false,
      "status": "pending",
      "priority": "high",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "completed_at": null,
      "due_date": "2024-12-31T23:59:59Z",
      "tags": ["work", "documentation"]
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### Get Todo by ID

```http
GET /api/v1/todos/{id}
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: UUID of the todo

**Success Response (200):**
```json
{
  "success": true,
  "message": "todo fetched successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "completed": false,
    "status": "pending",
    "priority": "high",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "completed_at": null,
    "due_date": "2024-12-31T23:59:59Z",
    "tags": ["work", "documentation"]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid todo ID format
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Todo not found
- `500 Internal Server Error`: Server error

---

#### Update Todo

```http
PUT /api/v1/todos/{id}
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: UUID of the todo

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "medium",
  "due_date": "2024-12-31T23:59:59Z",
  "tags": ["work", "updated"]
}
```

**Validation Rules:**
- `title`: optional, max 200 characters
- `description`: optional
- `priority`: optional, one of: `low`, `medium`, `high`
- `due_date`: optional, valid ISO 8601 datetime
- `tags`: optional, array of strings

**Success Response (200):**
```json
{
  "success": true,
  "message": "todo updated successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Updated title",
    "description": "Updated description",
    "completed": false,
    "status": "pending",
    "priority": "medium",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z",
    "completed_at": null,
    "due_date": "2024-12-31T23:59:59Z",
    "tags": ["work", "updated"]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request body, todo ID, or validation failed
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Todo not found
- `500 Internal Server Error`: Server error

---

#### Mark Todo as Completed

```http
PATCH /api/v1/todos/{id}/complete
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: UUID of the todo

**Success Response (200):**
```json
{
  "success": true,
  "message": "todo marked as completed",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Complete project documentation",
    "completed": true,
    "status": "completed",
    "completed_at": "2024-01-15T15:00:00Z",
    ...
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid todo ID format
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### Mark Todo as Incomplete

```http
PATCH /api/v1/todos/{id}/incomplete
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: UUID of the todo

**Success Response (200):**
```json
{
  "success": true,
  "message": "todo marked as incomplete",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Complete project documentation",
    "completed": false,
    "status": "pending",
    "completed_at": null,
    ...
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid todo ID format
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

#### Delete Todo

```http
DELETE /api/v1/todos/{id}
Authorization: Bearer <token>
```

**Path Parameters:**
- `id`: UUID of the todo

**Success Response (204):**
```
No Content
```

**Error Responses:**
- `400 Bad Request`: Invalid todo ID format
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### Health Check

#### Check API Health

```http
GET /health
```

No authentication required.

**Success Response (200):**
```
OK
```

---

## Data Models

### User

```typescript
{
  id: string;          // UUID
  name: string;
  email: string;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}
```

### Todo

```typescript
{
  id: string;              // UUID
  title: string;           // Max 200 characters
  description?: string;
  completed: boolean;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  user_id: string;         // UUID
  created_at: string;      // ISO 8601
  updated_at: string;      // ISO 8601
  completed_at?: string;   // ISO 8601
  due_date?: string;       // ISO 8601
  tags?: string[];
}
```

## Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded with no response body
- `400 Bad Request`: Invalid request or validation failed
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production.

## CORS

The API supports CORS for the following origins (configurable):
- `http://localhost:3000` (development)
- Add production domains as needed

Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

## Examples

### cURL Examples

#### Register
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123!"}'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'
```

#### Create Todo
```bash
curl -X POST http://localhost:8080/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My Todo","description":"Description","priority":"high"}'
```

#### Get All Todos
```bash
curl -X GET "http://localhost:8080/api/v1/todos?status=pending&priority=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Todo
```bash
curl -X PUT http://localhost:8080/api/v1/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated Title","priority":"medium"}'
```

#### Mark as Completed
```bash
curl -X PATCH http://localhost:8080/api/v1/todos/TODO_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Delete Todo
```bash
curl -X DELETE http://localhost:8080/api/v1/todos/TODO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/TypeScript Examples

```typescript
// Register
const register = async () => {
  const response = await fetch('http://localhost:8080/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!'
    })
  });
  const data = await response.json();
  return data;
};

// Login
const login = async () => {
  const response = await fetch('http://localhost:8080/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'Password123!'
    })
  });
  const data = await response.json();
  return data.data.token;
};

// Create Todo
const createTodo = async (token: string) => {
  const response = await fetch('http://localhost:8080/api/v1/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'My Todo',
      description: 'Description',
      priority: 'high',
      tags: ['work']
    })
  });
  const data = await response.json();
  return data.data;
};

// Get All Todos
const getTodos = async (token: string) => {
  const response = await fetch('http://localhost:8080/api/v1/todos', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};
```

## Postman Collection

A Postman collection is available for easy API testing. Import the following JSON:

[Link to Postman collection would go here]

## Websocket Support

WebSocket support is not currently implemented but can be added for real-time updates.

## Versioning

The API is versioned through the URL path (`/api/v1/`). Future versions will use `/api/v2/`, etc.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@todogo.com
