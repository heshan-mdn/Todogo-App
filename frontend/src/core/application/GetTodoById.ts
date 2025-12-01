import { Todo } from '../domain/Todo';
import { ITodoRepository } from '../ports/ITodoRepository';

/**
 * Get Todo By ID Use Case
 * Retrieves a single todo by its ID
 */
export class GetTodoById {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(id: string): Promise<Todo | null> {
    try {
      const todo = await this.todoRepository.findById(id);
      return todo;
    } catch (error) {
      throw error;
    }
  }
}
