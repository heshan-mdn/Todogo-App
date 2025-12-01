'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/infrastructure/services/AuthService';
import { LoginInput } from '@/shared/lib/validators';
import { useAuth } from '@/presentation/providers/AuthProvider';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (data) => {
      login(data.token, data.user);
    },
  });
}
