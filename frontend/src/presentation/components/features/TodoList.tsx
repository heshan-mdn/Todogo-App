'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Todo } from '@/core/domain/Todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  isLoading?: boolean;
}

export function TodoList({ todos, isLoading }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No todos yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
