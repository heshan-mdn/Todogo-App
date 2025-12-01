'use client';

import React, { useState } from 'react';
import { Plus, LogIn } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { AddTodoForm } from '@/presentation/components/forms/AddTodoForm';
import { TodoList } from '@/presentation/components/features/TodoList';
import {
  TodoFilters,
  TodoFiltersState,
} from '@/presentation/components/features/TodoFilters';
import { useTodos } from '@/presentation/hooks/useTodos';
import { useAuth } from '@/presentation/providers/AuthProvider';
import { AuthDialog } from '@/presentation/components/features/AuthDialog';

export default function HomePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filters, setFilters] = useState<TodoFiltersState>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const { data: todos = [], isLoading } = useTodos(user?.id || '', filters);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Todogo</CardTitle>
            <CardDescription className="text-base">
              A modern task management application to keep you organized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">✨ Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create and manage tasks</li>
                  <li>• Set priorities and due dates</li>
                  <li>• Organize with tags</li>
                  <li>• Filter and search</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">🔒 Secure</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• JWT authentication</li>
                  <li>• Encrypted passwords</li>
                  <li>• Private todo lists</li>
                  <li>• Session management</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => {
                  setAuthDialogOpen(true);
                }}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login to Get Started
              </Button>
            </div>
          </CardContent>
        </Card>

        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          defaultMode="login"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-4xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-4xl text-green-600">
              {stats.completed}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-4xl text-orange-600">
              {stats.pending}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Manage your daily tasks efficiently</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <TodoFilters filters={filters} onFiltersChange={setFilters} />
          <TodoList todos={todos} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Add Todo Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your todo list. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          {user?.id && (
            <AddTodoForm
              userId={user.id}
              onSuccess={() => setIsAddDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
