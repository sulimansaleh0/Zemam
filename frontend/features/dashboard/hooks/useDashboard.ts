'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useDashboard() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName =
    user?.name && user.name !== 'Default'
      ? user.name
      : user?.email
      ? user.email.split('@')[0]
      : 'مستخدم';

  return {
    user,
    userName,
    menuOpen,
    setMenuOpen,
    searchQuery,
    setSearchQuery,
    logout,
  };
}
