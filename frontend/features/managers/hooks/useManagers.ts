'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { managerService } from '../services/manager.service';
import { TEAM_QUERY_KEYS } from '@/features/teams';
import type { CreateManagerInput } from '../types/manager.types';

// ============================================================
//  Query Keys
// ============================================================

export const MANAGER_QUERY_KEYS = {
  all: ['managers'] as const,
  byStatus: (status?: string) => ['managers', { status }] as const,
};

// ============================================================
//  Data Hooks
// ============================================================

/**
 * Hook to fetch all fleet managers
 */
export function useManagers(status?: string) {
  return useQuery({
    queryKey: MANAGER_QUERY_KEYS.byStatus(status),
    queryFn: () => managerService.getManagers(status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================
//  Mutation Hooks
// ============================================================

/**
 * Hook to create a new fleet manager
 */
export function useCreateManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateManagerInput) => managerService.createManager(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      addToast({
        type: 'success',
        title: 'تم إنشاء الحساب',
        message: 'تمت إضافة مدير الأسطول وربطه بالفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الإضافة',
        message: err.message || 'تعذر إضافة مدير الأسطول، حاول مرة أخرى',
      });
    },
  });
}

/**
 * Hook to deactivate / delete a fleet manager
 */
export function useDeleteManager() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (managerId: string) => managerService.deleteManager(managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MANAGER_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
      addToast({
        type: 'success',
        title: 'تم التعطيل',
        message: 'تم تعطيل حساب مدير الأسطول وفك ارتباطه بالفريق',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في التعطيل',
        message: err.message || 'تعذر تعطيل حساب مدير الأسطول',
      });
    },
  });
}
