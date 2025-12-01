'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, Flag } from 'lucide-react';
import { Todo } from '@/core/domain/Todo';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/presentation/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/presentation/components/ui/dialog';
import { EditTodoForm } from '@/presentation/components/forms/EditTodoForm';
import { useToggleTodo } from '@/presentation/hooks/useToggleTodo';
import { useDeleteTodo } from '@/presentation/hooks/useDeleteTodo';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/lib/utils';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutate: toggleTodo, isPending: isToggling } = useToggleTodo();
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo();

  const handleToggle = () => {
    toggleTodo({ id: todo.id, completed: !todo.completed });
  };

  const handleDelete = () => {
    deleteTodo(todo.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
      },
    });
  };

  const priorityColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
  };

  return (
    <>
      <Card className={cn('transition-opacity', todo.completed && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="mt-1"
            />

            <div className="flex-1 space-y-1">
              <h3
                className={cn(
                  'font-medium',
                  todo.completed && 'line-through text-muted-foreground'
                )}
              >
                {todo.title}
              </h3>

              {todo.description && (
                <p className="text-sm text-muted-foreground">
                  {todo.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Flag className={cn('h-3 w-3', priorityColors[todo.priority])} />
                  <span className="capitalize">{todo.priority}</span>
                </div>

                {todo.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(todo.dueDate)}</span>
                  </div>
                )}

                {todo.isOverdue() && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(true)}
                disabled={isToggling || isDeleting}
              >
                <Edit2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteOpen(true)}
                disabled={isToggling || isDeleting}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>
              Make changes to your todo item below.
            </DialogDescription>
          </DialogHeader>
          <EditTodoForm
            todo={todo}
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Todo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{todo.title}"? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
