'use client';

import { useAuth } from '@/features/auth/context/AuthContext';

export function useDashboard() {
  const { user } = useAuth();

  const userName =
    user?.name && user.name !== 'Default'
      ? user.name
      : user?.email
      ? user.email.split('@')[0]
      : 'مستخدم';

  return {
    user,
    userName,
  };
}
