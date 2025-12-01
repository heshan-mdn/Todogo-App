/**
 * Notification Service Interface - Port for notifications
 */
export interface INotificationService {
  /**
   * Show a success notification
   */
  success(message: string, title?: string): void;

  /**
   * Show an error notification
   */
  error(message: string, title?: string): void;

  /**
   * Show an info notification
   */
  info(message: string, title?: string): void;

  /**
   * Show a warning notification
   */
  warning(message: string, title?: string): void;
}
