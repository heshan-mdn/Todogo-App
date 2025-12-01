import { Todo } from '@/core/domain/Todo';
import { ITodoRepository, TodoFilters } from '@/core/ports/ITodoRepository';
import { TodoMapper, TodoDTO } from '../mappers/TodoMapper';

/**
 * API Todo Repository - Adapter for Backend API
 */
export class APITodoRepository implements ITodoRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Get headers with authentication
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      const errorMessage = error.message || `HTTP error! status: ${response.status}`;
      return Promise.reject(new Error(errorMessage));
    }
    return response.json();
  }

  async findAll(userId: string, filters?: TodoFilters): Promise<Todo[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.priority) {
        params.append('priority', filters.priority);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }

      const url = `${this.baseUrl}/todos?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ data: TodoDTO[] }>(response);
      return TodoMapper.toDomainList(data.data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Todo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return null;
      }

      const data = await this.handleResponse<{ data: TodoDTO }>(response);
      return TodoMapper.toDomain(data.data);
    } catch (error) {
      console.error('Error fetching todo:', error);
      throw error;
    }
  }

  async save(todo: Todo): Promise<Todo> {
    try {
      const dto = TodoMapper.toDTO(todo);
      const response = await fetch(`${this.baseUrl}/todos`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });

      const data = await this.handleResponse<{ data: TodoDTO }>(response);
      return TodoMapper.toDomain(data.data);
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  async update(todo: Todo): Promise<Todo> {
    try {
      const dto = TodoMapper.toDTO(todo);
      const response = await fetch(`${this.baseUrl}/todos/${todo.id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(dto),
      });

      const data = await this.handleResponse<{ data: TodoDTO }>(response);
      return TodoMapper.toDomain(data.data);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      await this.handleResponse<void>(response);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  async markAsCompleted(id: string): Promise<Todo> {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}/complete`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ data: TodoDTO }>(response);
      return TodoMapper.toDomain(data.data);
    } catch (error) {
      console.error('Error marking todo as completed:', error);
      throw error;
    }
  }

  async markAsPending(id: string): Promise<Todo> {
    try {
      const response = await fetch(`${this.baseUrl}/todos/${id}/incomplete`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      const data = await this.handleResponse<{ data: TodoDTO }>(response);
      return TodoMapper.toDomain(data.data);
    } catch (error) {
      console.error('Error marking todo as pending:', error);
      throw error;
    }
  }
}
