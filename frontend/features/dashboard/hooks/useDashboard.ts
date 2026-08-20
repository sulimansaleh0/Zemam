'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

export function useDashboard() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [doneTasks, setDoneTasks] = useState<number[]>([0]); // First task completed by default

  const toggleTask = (index: number) => {
    setDoneTasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'محمد العتيبي';

  return {
    user,
    userName,
    menuOpen,
    setMenuOpen,
    searchQuery,
    setSearchQuery,
    doneTasks,
    toggleTask,
    logout,
  };
}
