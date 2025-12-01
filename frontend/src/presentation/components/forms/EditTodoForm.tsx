'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { useUpdateTodo } from '@/presentation/hooks/useUpdateTodo';
import { updateTodoSchema, UpdateTodoInput } from '@/shared/lib/validators';
import { Todo } from '@/core/domain/Todo';
import { TodoPriority } from '@/core/domain/enums/TodoStatus';

interface EditTodoFormProps {
  todo: Todo;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditTodoForm({ todo, onSuccess, onCancel }: EditTodoFormProps) {
  const { mutate: updateTodo, isPending } = useUpdateTodo();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateTodoInput>({
    resolver: zodResolver(updateTodoSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
    },
  });

  useEffect(() => {
    reset({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
    });
  }, [todo, reset]);

  const onSubmit = (data: UpdateTodoInput) => {
    updateTodo(
      {
        id: todo.id,
        title: data.title,
        description: data.description === null ? null : (data.description || undefined),
        priority: data.priority as TodoPriority | undefined,
        dueDate: data.dueDate === null ? null : (data.dueDate || undefined),
        tags: data.tags,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const priority = watch('priority');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title *</Label>
        <Input
          id="edit-title"
          placeholder="What needs to be done?"
          {...register('title')}
          disabled={isPending}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          placeholder="Add more details..."
          {...register('description')}
          disabled={isPending}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={value =>
              setValue('priority', value as TodoPriority)
            }
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TodoPriority.LOW}>Low</SelectItem>
              <SelectItem value={TodoPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={TodoPriority.HIGH}>High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-dueDate">Due Date</Label>
          <Input
            id="edit-dueDate"
            type="date"
            defaultValue={
              todo.dueDate
                ? new Date(todo.dueDate).toISOString().split('T')[0]
                : ''
            }
            {...register('dueDate', {
              setValueAs: (value: string) => (value ? new Date(value) : null),
            })}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
