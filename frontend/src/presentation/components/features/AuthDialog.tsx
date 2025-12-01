'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { LoginForm } from '@/presentation/components/forms/LoginForm';
import { RegisterForm } from '@/presentation/components/forms/RegisterForm';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'register';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'login' }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Login to your account' : 'Create an account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Enter your credentials to access your todos'
              : 'Fill in the information to create your account'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
