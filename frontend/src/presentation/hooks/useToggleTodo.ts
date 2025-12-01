'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTodoStatus } from '@/core/application/UpdateTodoStatus';
import { APITodoRepository } from '@/infrastructure/persistence/APITodoRepository';
import { toastNotificationService } from '@/infrastructure/services/NotificationService';

const todoRepository = new APITodoRepository();
const updateTodoStatus = new UpdateTodoStatus(
  todoRepository,
  toastNotificationService
);

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodoStatus.execute(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
