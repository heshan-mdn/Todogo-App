'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTodo, CreateTodoDTO } from '@/core/application/CreateTodo';
import { APITodoRepository } from '@/infrastructure/persistence/APITodoRepository';
import { toastNotificationService } from '@/infrastructure/services/NotificationService';

const todoRepository = new APITodoRepository();
const createTodo = new CreateTodo(todoRepository, toastNotificationService);

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTodoDTO) => createTodo.execute(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
