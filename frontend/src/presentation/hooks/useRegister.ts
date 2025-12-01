'use client';

import { useMutation } from '@tanstack/react-query';
import { authService } from '@/infrastructure/services/AuthService';
import { RegisterInput } from '@/shared/lib/validators';
import { useAuth } from '@/presentation/providers/AuthProvider';

export function useRegister() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (data) => {
      login(data.token, data.user);
    },
  });
}
