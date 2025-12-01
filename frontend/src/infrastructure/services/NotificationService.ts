import { INotificationService } from '@/core/ports/INotificationService';

/**
 * Toast Notification Service
 * Implementation using browser's native notifications or custom toast
 */
export class ToastNotificationService implements INotificationService {
  private toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    title?: string;
  }> = [];

  private listeners: Array<(toasts: typeof this.toasts) => void> = [];

  /**
   * Subscribe to toast changes
   */
  subscribe(listener: (toasts: typeof this.toasts) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  /**
   * Add a toast
   */
  private addToast(
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    title?: string
  ): void {
    const id = `toast_${Date.now()}_${Math.random()}`;
    this.toasts.push({ id, type, message, title });
    this.notify();

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }

  /**
   * Remove a toast
   */
  removeToast(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(message: string, title?: string): void {
    this.addToast('success', message, title);
  }

  error(message: string, title?: string): void {
    this.addToast('error', message, title);
  }

  info(message: string, title?: string): void {
    this.addToast('info', message, title);
  }

  warning(message: string, title?: string): void {
    this.addToast('warning', message, title);
  }
}

// Singleton instance
export const toastNotificationService = new ToastNotificationService();
