'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { maintenanceService } from '../services/maintenance.service';
import { MAINTENANCE_QUERY_KEYS } from './useMaintenance';
import type { CreateMaintenanceInput, VerifyMaintenanceInput } from '../types/maintenance.types';

/**
 * Hook لتسجيل وتوثيق طلب صيانة جديد
 */
export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceInput) => {
      const res = await maintenanceService.createMaintenanceRecord(data);
      if (!res.success) {
        throw new Error(res.message || 'فشل توثيق طلب الصيانة');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.addToast({ type: 'success', message: 'تم توثيق طلب الصيانة بنجاح' });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لمراجعة واعتماد أو رفض طلب صيانة
 */
export function useVerifyMaintenance() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: VerifyMaintenanceInput) => {
      const res = await maintenanceService.verifyMaintenanceRecord(data);
      if (!res.success) {
        throw new Error(res.message || 'فشل تحديث حالة الصيانة');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.addToast({ type: 'success', message: 'تم تحديث حالة طلب الصيانة بنجاح' });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook تجميعي لطفرات الصيانة
 */
export function useMaintenanceMutations() {
  const createMutation = useCreateMaintenance();
  const verifyMutation = useVerifyMaintenance();

  return {
    createMaintenance: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    verifyMaintenance: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
  };
}
