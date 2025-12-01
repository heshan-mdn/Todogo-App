import { Todo } from '../domain/Todo';
import { TodoStatus, TodoPriority } from '../domain/enums/TodoStatus';
import { ITodoRepository } from '../ports/ITodoRepository';
import { INotificationService } from '../ports/INotificationService';

/**
 * Create Todo Use Case
 * Creates a new todo item
 */
export interface CreateTodoDTO {
  title: string;
  description?: string;
  priority?: TodoPriority;
  userId: string;
  dueDate?: Date;
  tags?: string[];
}

export class CreateTodo {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(dto: CreateTodoDTO): Promise<Todo> {
    try {
      // Create the todo entity
      const todo = new Todo(
        '', // ID will be assigned by the backend
        dto.title.trim(),
        dto.description?.trim() || null,
        false,
        TodoStatus.PENDING,
        dto.priority || TodoPriority.MEDIUM,
        dto.userId,
        new Date(),
        new Date(),
        null,
        dto.dueDate || null,
        dto.tags || []
      );

      // Validate the todo
      const validation = todo.validate();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Save the todo
      const savedTodo = await this.todoRepository.save(todo);

      this.notificationService.success('Todo created successfully');

      return savedTodo;
    } catch (error) {
      this.notificationService.error(
        error instanceof Error ? error.message : 'Failed to create todo'
      );
      throw error;
    }
  }
}
