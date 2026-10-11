'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fuelKeys, vehicleKeys } from '@/shared/constants/queryKeys';
import { useToast } from '@/shared/ui/Toast';
import { fuelService } from '../services/fuel.service';
import type { CreateFuelInput, VerifyFuelInput, VoidFuelInput } from '../types/fuel.types';

/**
 * Hook لتسجيل إيصال تعبئة وقود جديد
 */
export function useCreateFuel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateFuelInput) => {
      const res = await fuelService.createFuelRecord(data);
      if (!res.success) {
        throw new Error(res.message || 'فشل توثيق إيصال الوقود');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.addToast({ type: 'success', message: 'تم توثيق إيصال الوقود بنجاح' });
      queryClient.invalidateQueries({ queryKey: fuelKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء الاتصال بالخادم',
      });
    },
  });
}

/**
 * Hook لاعتماد أو رفض إيصال الوقود
 */
export function useVerifyFuel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: VerifyFuelInput) => {
      const res = await fuelService.verifyFuelRecord(data);
      if (!res.success) {
        throw new Error(res.message || 'فشل مراجعة الإيصال');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.addToast({ type: 'success', message: 'تم تحديث حالة إيصال الوقود بنجاح' });
      queryClient.invalidateQueries({ queryKey: fuelKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء الاتصال بالخادم',
      });
    },
  });
}

/**
 * Hook لإلغاء اعتماد إيصال الوقود وعكس رصيد الوقود في المركبة (Void Approval)
 */
export function useVoidFuel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: VoidFuelInput) => {
      const res = await fuelService.voidFuelRecord(data);
      if (!res.success) {
        throw new Error(res.message || 'فشل إلغاء اعتماد إيصال الوقود');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.addToast({ type: 'success', message: 'تم إلغاء الاعتماد وعكس رصيد الوقود بالمركبة بنجاح' });
      queryClient.invalidateQueries({ queryKey: fuelKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({
        type: 'error',
        message: err.message || 'حدث خطأ أثناء الاتصال بالخادم',
      });
    },
  });
}

/**
 * Composite hook returning all fuel mutations
 */
export function useFuelMutations() {
  const createFuel = useCreateFuel();
  const verifyFuel = useVerifyFuel();
  const voidFuel = useVoidFuel();
  return { createFuel, verifyFuel, voidFuel };
}

