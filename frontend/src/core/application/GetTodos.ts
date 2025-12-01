import { Todo } from '../domain/Todo';
import { ITodoRepository, TodoFilters } from '../ports/ITodoRepository';

/**
 * Get Todos Use Case
 * Retrieves todos with optional filters
 */
export class GetTodos {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(userId: string, filters?: TodoFilters): Promise<Todo[]> {
    try {
      const todos = await this.todoRepository.findAll(userId, filters);
      return todos;
    } catch (error) {
      throw error;
    }
  }
}
