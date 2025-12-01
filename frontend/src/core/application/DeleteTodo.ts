import { ITodoRepository } from '../ports/ITodoRepository';
import { INotificationService } from '../ports/INotificationService';

/**
 * Delete Todo Use Case
 * Deletes a todo item
 */
export class DeleteTodo {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(id: string): Promise<void> {
    try {
      await this.todoRepository.delete(id);
      this.notificationService.success('Todo deleted successfully');
    } catch (error) {
      this.notificationService.error(
        error instanceof Error ? error.message : 'Failed to delete todo'
      );
      throw error;
    }
  }
}
