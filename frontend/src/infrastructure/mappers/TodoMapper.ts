import { Todo } from '@/core/domain/Todo';
import { TodoStatus, TodoPriority } from '@/core/domain/enums/TodoStatus';

/**
 * Data Transfer Object from API
 */
export interface TodoDTO {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  status: string;
  priority: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  due_date: string | null;
  tags: string[];
}

/**
 * TodoMapper - Maps between DTO and Domain Entity
 */
export class TodoMapper {
  /**
   * Map DTO to Domain Entity
   */
  static toDomain(dto: TodoDTO): Todo {
    return new Todo(
      dto.id,
      dto.title,
      dto.description,
      dto.completed,
      dto.status as TodoStatus,
      dto.priority as TodoPriority,
      dto.user_id,
      new Date(dto.created_at),
      new Date(dto.updated_at),
      dto.completed_at ? new Date(dto.completed_at) : null,
      dto.due_date ? new Date(dto.due_date) : null,
      dto.tags || []
    );
  }

  /**
   * Map Domain Entity to DTO
   */
  static toDTO(todo: Todo): Partial<TodoDTO> {
    return {
      id: todo.id || undefined,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      status: todo.status,
      priority: todo.priority,
      user_id: todo.userId,
      due_date: todo.dueDate?.toISOString() || null,
      tags: todo.tags,
    };
  }

  /**
   * Map array of DTOs to Domain Entities
   */
  static toDomainList(dtos: TodoDTO[]): Todo[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
