import { Todo } from '../domain/Todo';
import { TodoPriority } from '../domain/enums/TodoStatus';
import { ITodoRepository } from '../ports/ITodoRepository';
import { INotificationService } from '../ports/INotificationService';

/**
 * Update Todo Use Case
 * Updates a todo item
 */
export interface UpdateTodoDTO {
  id: string;
  title?: string;
  description?: string | null;
  priority?: TodoPriority;
  dueDate?: Date | null;
  tags?: string[];
}

export class UpdateTodo {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(dto: UpdateTodoDTO): Promise<Todo> {
    try {
      // Fetch the todo
      const todo = await this.todoRepository.findById(dto.id);

      if (!todo) {
        throw new Error('Todo not found');
      }

      // Update fields
      if (dto.title !== undefined) {
        todo.updateTitle(dto.title);
      }

      if (dto.description !== undefined) {
        todo.updateDescription(dto.description);
      }

      if (dto.priority !== undefined) {
        todo.updatePriority(dto.priority);
      }

      if (dto.dueDate !== undefined) {
        todo.setDueDate(dto.dueDate);
      }

      if (dto.tags !== undefined) {
        todo.tags = dto.tags;
        todo.updatedAt = new Date();
      }

      // Validate the todo
      const validation = todo.validate();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Update the todo
      const updatedTodo = await this.todoRepository.update(todo);

      this.notificationService.success('Todo updated successfully');

      return updatedTodo;
    } catch (error) {
      this.notificationService.error(
        error instanceof Error ? error.message : 'Failed to update todo'
      );
      throw error;
    }
  }
}
