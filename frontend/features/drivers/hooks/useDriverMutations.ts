'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { driverService } from '../services/driverService';
import { driverKeys, vehicleKeys, teamKeys } from '@/shared/constants/queryKeys';
import type {
  CreateDriverInput,
  DriverStatus,
} from '../types/driver.types';

// ============================================================
//  Driver Mutations — Invalidate on Success Pattern
// ============================================================

/**
 * Mutation لإنشاء سائق جديد
 */
export function useCreateDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDriverInput) => {
      const result = await driverService.createDriver(data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({ type: 'success', title: 'تمت الإضافة', message: 'تمت إضافة السائق بنجاح' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'فشلت العملية', message: error.message });
    },
  });
}

/**
 * Mutation لتغيير حالة سائق (تفعيل / تعطيل)
 */
export function useChangeDriverStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DriverStatus }) => {
      const result = await driverService.changeDriverStatus(id, { status });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, { id, status }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(id) });
      const label = status === 'active' ? 'تفعيل' : 'تعطيل';
      addToast({ type: 'info', title: 'تغيير الحالة', message: `تم ${label} حساب السائق بنجاح` });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'فشل تغيير الحالة', message: error.message });
    },
  });
}

/**
 * Mutation لحذف سائق (soft delete)
 */
export function useDeleteDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await driverService.deleteDriver(id);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({ type: 'info', title: 'تم الحذف', message: 'تم حذف سجل السائق وفك ارتباط مركباته' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'فشل الحذف', message: error.message });
    },
  });
}

/**
 * Mutation لتعيين مركبة لسائق
 */
export function useAssignVehicleToDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ driverId, vehicleId }: { driverId: string; vehicleId: string }) => {
      const result = await driverService.assignVehicle(driverId, vehicleId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, { driverId, vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(driverId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      addToast({
        type: 'success',
        title: 'تعيين المركبة',
        message: 'تم تعيين المركبة للسائق بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل تعيين المركبة',
        message: error.message,
      });
    },
  });
}

/**
 * Mutation لفك ارتباط مركبة عن سائق
 */
export function useUnassignVehicleFromDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const result = await driverService.unassignVehicle(driverId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, driverId) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(driverId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      addToast({
        type: 'info',
        title: 'فك الارتباط',
        message: 'تم فك ارتباط المركبة عن السائق بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل فك الارتباط',
        message: error.message,
      });
    },
  });
}

/**
 * Mutation لتعيين سائق لفريق تشغيلي
 */
export function useAssignDriverToTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ driverId, teamId }: { driverId: string; teamId: string }) => {
      const result = await driverService.assignTeam(driverId, teamId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, { driverId, teamId }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(driverId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      addToast({
        type: 'success',
        title: 'تعيين الفريق',
        message: 'تم تعيين السائق للفريق بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل التعيين',
        message: error.message,
      });
    },
  });
}

/**
 * Mutation لفك ارتباط سائق عن فريقه التشغيلي
 */
export function useRemoveDriverFromTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const result = await driverService.removeTeam(driverId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (_, driverId) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.detail(driverId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({
        type: 'info',
        title: 'فك ارتباط الفريق',
        message: 'تم فك ارتباط السائق عن الفريق بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل فك الارتباط',
        message: error.message,
      });
    },
  });
}
