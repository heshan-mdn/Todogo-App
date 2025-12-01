'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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
import { useCreateTodo } from '@/presentation/hooks/useCreateTodo';
import { createTodoSchema, CreateTodoInput } from '@/shared/lib/validators';
import { TodoPriority } from '@/core/domain/enums/TodoStatus';

interface AddTodoFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function AddTodoForm({ userId, onSuccess }: AddTodoFormProps) {
  const { mutate: createTodo, isPending } = useCreateTodo();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      priority: TodoPriority.MEDIUM,
    },
  });

  const onSubmit = (data: CreateTodoInput) => {
    createTodo(
      {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority as TodoPriority,
        userId,
        dueDate: data.dueDate || undefined,
        tags: data.tags,
      },
      {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      }
    );
  };

  const priority = watch('priority');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="What needs to be done?"
          {...register('title')}
          disabled={isPending}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
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
          <Label htmlFor="priority">Priority</Label>
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
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate', {
              setValueAs: (value: string) => (value ? new Date(value) : null),
            })}
            disabled={isPending}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        {isPending ? 'Adding...' : 'Add Todo'}
      </Button>
    </form>
  );
}
