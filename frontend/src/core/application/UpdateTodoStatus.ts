import { Todo } from '../domain/Todo';
import { ITodoRepository } from '../ports/ITodoRepository';
import { INotificationService } from '../ports/INotificationService';

/**
 * Update Todo Status Use Case
 * Updates the completion status of a todo
 */
export class UpdateTodoStatus {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(id: string, completed: boolean): Promise<Todo> {
    try {
      // Fetch the todo
      const todo = await this.todoRepository.findById(id);

      if (!todo) {
        throw new Error('Todo not found');
      }

      // Toggle completion
      if (todo.completed !== completed) {
        todo.toggleComplete();
      }

      // Update the todo
      const updatedTodo = await this.todoRepository.update(todo);

      this.notificationService.success(
        completed ? 'Todo marked as completed' : 'Todo marked as pending'
      );

      return updatedTodo;
    } catch (error) {
      this.notificationService.error(
        error instanceof Error ? error.message : 'Failed to update todo status'
      );
      throw error;
    }
  }
}
