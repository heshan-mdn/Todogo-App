'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteTodo } from '@/core/application/DeleteTodo';
import { APITodoRepository } from '@/infrastructure/persistence/APITodoRepository';
import { toastNotificationService } from '@/infrastructure/services/NotificationService';

const todoRepository = new APITodoRepository();
const deleteTodo = new DeleteTodo(todoRepository, toastNotificationService);

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
