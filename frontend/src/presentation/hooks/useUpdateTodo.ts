'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTodo, UpdateTodoDTO } from '@/core/application/UpdateTodo';
import { APITodoRepository } from '@/infrastructure/persistence/APITodoRepository';
import { toastNotificationService } from '@/infrastructure/services/NotificationService';

const todoRepository = new APITodoRepository();
const updateTodo = new UpdateTodo(todoRepository, toastNotificationService);

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateTodoDTO) => updateTodo.execute(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
