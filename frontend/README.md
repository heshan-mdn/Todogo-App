# Todogo Frontend

A modern, production-ready Next.js 15 application built with Clean Architecture principles, TypeScript, and TailwindCSS.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router (Entry Points & Routing)
├── core/                   # 💎 Domain & Application Layer (Framework Agnostic)
│   ├── domain/             # Business Entities & Rules
│   ├── application/        # Use Cases / Interactors
│   └── ports/              # Interfaces (Abstractions)
├── infrastructure/         # ⚙️ External Implementations (Adapters)
│   ├── persistence/        # Repository implementations
│   ├── services/           # Service implementations
│   └── mappers/            # DTO <-> Entity mappers
├── presentation/           # 💻 UI Components, Hooks, Providers
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   └── providers/          # Context providers
└── shared/                 # 🧩 Utilities, Types, Validators
```

## 🚀 Tech Stack

### Core
- **Framework**: Next.js 15.1.4
- **Language**: TypeScript 5.7.2
- **Runtime**: Node.js 20

### UI & Styling
- **UI Library**: React 18.3.1
- **Styling**: TailwindCSS 3.4.17
- **UI Components**: Radix UI (Avatar, Dialog, Dropdown, Select, Toast, etc.)
- **Icons**: Lucide React
- **Utilities**: 
  - class-variance-authority (CVA)
  - tailwind-merge
  - tailwindcss-animate
  - clsx

### State & Forms
- **State Management**: TanStack React Query 5.62.12
- **Form Management**: React Hook Form 7.54.2
- **Validation**: Zod 3.24.1
- **Resolvers**: @hookform/resolvers

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
API_BASE_URL=http://localhost:8080/api/v1
```

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint
```

The application will be available at `http://localhost:3000`

## 🐳 Docker

### Build Docker Image

```bash
docker build -t todogo-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1 \
  -e API_BASE_URL=http://localhost:8080/api/v1 \
  todogo-frontend
```

## 📁 Project Structure

### Core Layer (`src/core/`)

**Domain** - Business entities and rules
- `Todo.ts` - Todo entity with business logic
- `enums/TodoStatus.ts` - TodoStatus and TodoPriority enums

**Application** - Use cases
- `CreateTodo.ts` - Create a new todo
- `UpdateTodo.ts` - Update todo details
- `UpdateTodoStatus.ts` - Toggle todo completion
- `GetTodos.ts` - Fetch todos with filters
- `DeleteTodo.ts` - Delete a todo

**Ports** - Interfaces
- `ITodoRepository.ts` - Repository interface
- `INotificationService.ts` - Notification service interface

### Infrastructure Layer (`src/infrastructure/`)

**Persistence**
- `APITodoRepository.ts` - Backend API adapter
- `LocalStorageTodoRepository.ts` - Browser storage adapter

**Services**
- `NotificationService.ts` - Toast notification implementation

**Mappers**
- `TodoMapper.ts` - DTO ↔ Entity conversion

### Presentation Layer (`src/presentation/`)

**Components**
- `ui/` - Base UI components (Button, Input, Dialog, etc.)
- `forms/` - Form components (AddTodoForm, EditTodoForm)
- `features/` - Feature components (TodoItem, TodoList, TodoFilters)

**Hooks**
- `useTodos.ts` - Fetch todos
- `useCreateTodo.ts` - Create todo mutation
- `useUpdateTodo.ts` - Update todo mutation
- `useToggleTodo.ts` - Toggle todo status
- `useDeleteTodo.ts` - Delete todo mutation

**Providers**
- `QueryProvider.tsx` - React Query configuration
- `ToasterProvider.tsx` - Toast notifications

### Shared Layer (`src/shared/`)

**Types**
- `common.types.ts` - Common TypeScript types

**Lib**
- `utils.ts` - Utility functions (cn, formatDate, debounce, etc.)
- `validators.ts` - Zod validation schemas

## 🎨 Design System

The application uses a custom design system based on shadcn/ui with TailwindCSS:

- **Primary Color**: Blue (#3B82F6)
- **Accent Colors**: Green (success), Red (destructive), Yellow (warning)
- **Typography**: Inter font family
- **Spacing**: Consistent 4px baseline grid
- **Border Radius**: Configurable via CSS variables

### Theme Customization

Modify CSS variables in `src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
  /* ... more variables */
}
```

## 🔌 API Integration

The frontend communicates with the Go backend through:

1. **Direct API calls** - From the browser using `APITodoRepository`
2. **API Routes (BFF)** - Next.js API routes in `src/app/api/todos/`

### API Endpoints

- `GET /api/todos` - Fetch all todos
- `POST /api/todos` - Create a todo
- `GET /api/todos/[id]` - Get todo by ID
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Delete todo
- `PATCH /api/todos/[id]/complete` - Mark as complete
- `PATCH /api/todos/[id]/incomplete` - Mark as incomplete

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage
npm run test:coverage
```

## 🌟 Features

- ✅ Clean Architecture implementation
- ✅ Full CRUD operations for todos
- ✅ Real-time filtering and search
- ✅ Priority levels (Low, Medium, High)
- ✅ Due date tracking
- ✅ Overdue detection
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Dark mode ready
- ✅ Type-safe with TypeScript
- ✅ Form validation with Zod
- ✅ Optimistic updates
- ✅ Server-side rendering (SSR)
- ✅ API caching with React Query

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (client-side) | `http://localhost:8080/api/v1` |
| `API_BASE_URL` | Backend API URL (server-side) | `http://localhost:8080/api/v1` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Projects

- [Todogo Backend](../backend) - Go backend with Chi and PostgreSQL
