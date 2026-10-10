'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { taskKeys, vehicleKeys, driverKeys } from '@/shared/constants/queryKeys';
import { taskService } from '../services/task.service';
import type { CreateTaskInput, UpdateTaskInput } from '../types/task.types';

/**
 * Hook لإنشاء مهمة جديدة
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await taskService.createTask(data);
      if (!res.success) {
        throw new Error(res.message || 'فشل إنشاء المهمة');
      }
      return res.data;
    },
    onSuccess: () => {
      toast.addToast({ type: 'success', message: 'تم إنشاء المهمة وتعيينها بنجاح' });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لتعديل مهمة معلقة
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const res = await taskService.updateTask(id, data);
      if (!res.success) {
        throw new Error(res.message || 'فشل تعديل المهمة');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.addToast({ type: 'success', message: 'تم تحديث بيانات المهمة بنجاح' });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لقبول المهمة وبدء تنفيذها (للسائق)
 */
export function useAcceptTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await taskService.acceptTask(id);
      if (!res.success) {
        throw new Error(res.message || 'فشل قبول المهمة');
      }
      return res.data;
    },
    onSuccess: (_, id) => {
      toast.addToast({ type: 'success', message: 'تم قبول وبدء تنفيذ المهمة بنجاح' });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لإنهاء وتسليم المهمة
 */
export function useFinishTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, endOdometer }: { id: string; endOdometer?: number }) => {
      const res = await taskService.finishTask(id, endOdometer);
      if (!res.success) {
        throw new Error(res.message || 'فشل إنهاء المهمة');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.addToast({ type: 'success', message: 'تم إنهاء وتسليم المهمة بنجاح' });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لإلغاء أو رفض المهمة
 */
export function useDeclineTask() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ id, declineReason }: { id: string; declineReason?: string }) => {
      const res = await taskService.declineTask(id, declineReason);
      if (!res.success) {
        throw new Error(res.message || 'فشل إلغاء المهمة');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.addToast({ type: 'success', message: 'تم إلغاء المهمة بنجاح' });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}
