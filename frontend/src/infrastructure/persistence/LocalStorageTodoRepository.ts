import { Todo } from '@/core/domain/Todo';
import { ITodoRepository, TodoFilters } from '@/core/ports/ITodoRepository';
import { TodoStatus } from '@/core/domain/enums/TodoStatus';

/**
 * LocalStorage Todo Repository - Adapter for Browser Storage
 * Useful for offline functionality or development
 */
export class LocalStorageTodoRepository implements ITodoRepository {
  private readonly STORAGE_KEY = 'todogo_todos';

  /**
   * Get all todos from localStorage
   */
  private getTodos(): Todo[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => this.deserializeTodo(item));
    } catch (error) {
      console.error('Error parsing todos from localStorage:', error);
      return [];
    }
  }

  /**
   * Save todos to localStorage
   */
  private saveTodos(todos: Todo[]): void {
    if (typeof window === 'undefined') return;

    const serialized = todos.map(todo => this.serializeTodo(todo));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
  }

  /**
   * Serialize Todo to plain object
   */
  private serializeTodo(todo: Todo): any {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      status: todo.status,
      priority: todo.priority,
      userId: todo.userId,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
      completedAt: todo.completedAt?.toISOString() || null,
      dueDate: todo.dueDate?.toISOString() || null,
      tags: todo.tags,
    };
  }

  /**
   * Deserialize plain object to Todo
   */
  private deserializeTodo(data: any): Todo {
    return new Todo(
      data.id,
      data.title,
      data.description,
      data.completed,
      data.status,
      data.priority,
      data.userId,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.completedAt ? new Date(data.completedAt) : null,
      data.dueDate ? new Date(data.dueDate) : null,
      data.tags || []
    );
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async findAll(userId: string, filters?: TodoFilters): Promise<Todo[]> {
    let todos = this.getTodos().filter(todo => todo.userId === userId);

    // Apply filters
    if (filters) {
      if (filters.status) {
        todos = todos.filter(todo => todo.status === filters.status);
      }

      if (filters.priority) {
        todos = todos.filter(todo => todo.priority === filters.priority);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        todos = todos.filter(
          todo =>
            todo.title.toLowerCase().includes(searchLower) ||
            todo.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        todos = todos.filter(todo =>
          filters.tags!.some(tag => todo.tags.includes(tag))
        );
      }
    }

    return todos;
  }

  async findById(id: string): Promise<Todo | null> {
    const todos = this.getTodos();
    return todos.find(todo => todo.id === id) || null;
  }

  async save(todo: Todo): Promise<Todo> {
    const todos = this.getTodos();
    const newTodo = new Todo(
      this.generateId(),
      todo.title,
      todo.description,
      todo.completed,
      todo.status,
      todo.priority,
      todo.userId,
      todo.createdAt,
      todo.updatedAt,
      todo.completedAt,
      todo.dueDate,
      todo.tags
    );

    todos.push(newTodo);
    this.saveTodos(todos);
    return newTodo;
  }

  async update(todo: Todo): Promise<Todo> {
    const todos = this.getTodos();
    const index = todos.findIndex(t => t.id === todo.id);

    if (index === -1) {
      throw new Error('Todo not found');
    }

    todos[index] = todo;
    this.saveTodos(todos);
    return todo;
  }

  async delete(id: string): Promise<void> {
    const todos = this.getTodos();
    const filtered = todos.filter(todo => todo.id !== id);
    this.saveTodos(filtered);
  }

  async markAsCompleted(id: string): Promise<Todo> {
    const todo = await this.findById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    if (!todo.completed) {
      todo.toggleComplete();
    }

    return this.update(todo);
  }

  async markAsPending(id: string): Promise<Todo> {
    const todo = await this.findById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }

    if (todo.completed) {
      todo.toggleComplete();
    }

    return this.update(todo);
  }
}
