'use client';

import React from 'react';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Input } from '@/presentation/components/ui/input';
import { TodoStatus, TodoPriority } from '@/core/domain/enums/TodoStatus';
import { Search } from 'lucide-react';

export interface TodoFiltersState {
  status?: TodoStatus;
  priority?: TodoPriority;
  search?: string;
}

interface TodoFiltersProps {
  filters: TodoFiltersState;
  onFiltersChange: (filters: TodoFiltersState) => void;
}

export function TodoFilters({ filters, onFiltersChange }: TodoFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as TodoStatus),
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'all' ? undefined : (value as TodoPriority),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.search;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={TodoStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={TodoStatus.COMPLETED}>Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || 'all'}
          onValueChange={handlePriorityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value={TodoPriority.LOW}>Low</SelectItem>
            <SelectItem value={TodoPriority.MEDIUM}>Medium</SelectItem>
            <SelectItem value={TodoPriority.HIGH}>High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
