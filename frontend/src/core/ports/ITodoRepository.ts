import { Todo } from '../domain/Todo';
import { TodoStatus, TodoPriority } from '../domain/enums/TodoStatus';

/**
 * Repository Interface - Port for Todo persistence
 */
export interface ITodoRepository {
  /**
   * Find all todos for a user
   */
  findAll(userId: string, filters?: TodoFilters): Promise<Todo[]>;

  /**
   * Find a todo by ID
   */
  findById(id: string): Promise<Todo | null>;

  /**
   * Save a new todo
   */
  save(todo: Todo): Promise<Todo>;

  /**
   * Update an existing todo
   */
  update(todo: Todo): Promise<Todo>;

  /**
   * Delete a todo
   */
  delete(id: string): Promise<void>;

  /**
   * Mark a todo as completed
   */
  markAsCompleted(id: string): Promise<Todo>;

  /**
   * Mark a todo as pending
   */
  markAsPending(id: string): Promise<Todo>;
}

/**
 * Filters for querying todos
 */
export interface TodoFilters {
  status?: TodoStatus;
  priority?: TodoPriority;
  search?: string;
  tags?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}
