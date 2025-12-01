'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo } from '@/core/domain/Todo';
import { TodoFilters } from '@/core/ports/ITodoRepository';
import { GetTodos } from '@/core/application/GetTodos';
import { APITodoRepository } from '@/infrastructure/persistence/APITodoRepository';

const todoRepository = new APITodoRepository();
const getTodos = new GetTodos(todoRepository);

export function useTodos(userId: string, filters?: TodoFilters) {
  return useQuery({
    queryKey: ['todos', userId, filters],
    queryFn: () => getTodos.execute(userId, filters),
    enabled: !!userId,
  });
}

export function useOptimisticTodos(userId: string, filters?: TodoFilters) {
  const queryClient = useQueryClient();

  const query = useTodos(userId, filters);

  const optimisticUpdate = (updater: (todos: Todo[]) => Todo[]) => {
    queryClient.setQueryData<Todo[]>(
      ['todos', userId, filters],
      (oldData = []) => updater(oldData)
    );
  };

  return {
    ...query,
    optimisticUpdate,
  };
}
