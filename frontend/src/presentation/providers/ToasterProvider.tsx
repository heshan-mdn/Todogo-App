'use client';

import React, { useEffect, useState } from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/presentation/components/ui/toast';
import { toastNotificationService } from '@/infrastructure/services/NotificationService';

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: 'success' | 'error' | 'info' | 'warning';
      message: string;
      title?: string;
    }>
  >([]);

  useEffect(() => {
    const unsubscribe = toastNotificationService.subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  return (
    <ToastProvider>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          variant={
            toast.type === 'error'
              ? 'destructive'
              : toast.type === 'success'
              ? 'success'
              : 'default'
          }
        >
          <div className="grid gap-1">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            <ToastDescription>{toast.message}</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
