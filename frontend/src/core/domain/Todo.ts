import { TodoStatus, TodoPriority } from './enums/TodoStatus';

/**
 * Todo Entity - Core Domain Model
 * Represents a todo item with its business rules
 */
export class Todo {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public completed: boolean,
    public status: TodoStatus,
    public priority: TodoPriority,
    public userId: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public completedAt: Date | null = null,
    public dueDate: Date | null = null,
    public tags: string[] = []
  ) {}

  /**
   * Toggle the completion status of the todo
   */
  toggleComplete(): void {
    this.completed = !this.completed;
    this.status = this.completed ? TodoStatus.COMPLETED : TodoStatus.PENDING;
    this.completedAt = this.completed ? new Date() : null;
    this.updatedAt = new Date();
  }

  /**
   * Update the title of the todo
   */
  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    this.title = title.trim();
    this.updatedAt = new Date();
  }

  /**
   * Update the description of the todo
   */
  updateDescription(description: string | null): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  /**
   * Update the priority of the todo
   */
  updatePriority(priority: TodoPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  /**
   * Set the due date for the todo
   */
  setDueDate(dueDate: Date | null): void {
    this.dueDate = dueDate;
    this.updatedAt = new Date();
  }

  /**
   * Add a tag to the todo
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove a tag from the todo
   */
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  /**
   * Check if the todo is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.completed) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  /**
   * Validate the todo entity
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (this.description && this.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
