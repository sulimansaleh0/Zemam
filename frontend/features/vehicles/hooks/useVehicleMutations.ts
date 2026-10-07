'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { vehicleService } from '../services/vehicle.service';
import { vehicleKeys, driverKeys, teamKeys } from '@/shared/constants/queryKeys';
import type { CreateVehicleInput, UpdateVehicleInput } from '../types/vehicle.types';

/**
 * 1. إضافة مركبة جديدة (Create Vehicle)
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateVehicleInput) => {
      const result = await vehicleService.createVehicle(data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.overviewStats });

      addToast({
        type: 'success',
        title: 'تمت الإضافة',
        message: result.message || 'تم تسجيل المركبة بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشلت العملية',
        message: error.message,
      });
    },
  });
}

/**
 * 2. تعديل بيانات المركبة (Update Vehicle)
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVehicleInput }) => {
      const result = await vehicleService.updateVehicle(id, data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.overviewStats });

      addToast({
        type: 'success',
        title: 'تم التحديث',
        message: result.message || 'تم تحديث بيانات المركبة بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل التحديث',
        message: error.message,
      });
    },
  });
}

/**
 * 3. تغيير حالة المركبة (نشطة / غير نشطة - Change Status)
 */
export function useChangeVehicleStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const result = await vehicleService.changeVehicleStatus(id, { status });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result, { id, status }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.overviewStats });

      const fallback = status === 'active' ? 'تم تفعيل المركبة بنجاح' : 'تم تعطيل المركبة بنجاح';
      addToast({
        type: 'info',
        title: 'تحديث الحالة',
        message: result.message || fallback,
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل تحديث الحالة',
        message: error.message,
      });
    },
  });
}

/**
 * 4. تعيين سائق لمركبة (Assign Driver)
 */
export function useAssignDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ vehicleId, driverId }: { vehicleId: string; driverId: string }) => {
      const result = await vehicleService.assignDriver(vehicleId, { driverId });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });

      addToast({
        type: 'success',
        title: 'تعيين السائق',
        message: result.message || 'تم تعيين السائق للمركبة بنجاح',
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
 * 5. فك ارتباط السائق عن المركبة (Unassign Driver)
 */
export function useUnassignDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const result = await vehicleService.unassignDriver(driverId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });

      addToast({
        type: 'info',
        title: 'فك الارتباط',
        message: result.message || 'تم فك ارتباط السائق عن المركبة بنجاح',
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
 * 6. تعيين المركبة لفريق تشغيلي (Assign Vehicle to Team)
 */
export function useAssignVehicleToTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ vehicleId, teamId }: { vehicleId: string; teamId: string }) => {
      const result = await vehicleService.assignTeam(vehicleId, teamId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });

      addToast({
        type: 'success',
        title: 'تعيين الفريق',
        message: result.message || 'تم تعيين المركبة للفريق بنجاح',
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
 * 7. فك ارتباط المركبة عن الفريق وإرجاعها للمستودع العام (Remove from Team)
 */
export function useRemoveVehicleFromTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const result = await vehicleService.removeTeam(vehicleId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result, vehicleId) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });

      addToast({
        type: 'info',
        title: 'فك ارتباط الفريق',
        message: result.message || 'تم نقل المركبة إلى المستودع العام بنجاح',
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
 * 8. حذف المركبة (Soft Delete Vehicle)
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const result = await vehicleService.deleteVehicle(vehicleId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.overviewStats });

      addToast({
        type: 'info',
        title: 'حذف المركبة',
        message: result.message || 'تم حذف المركبة بنجاح',
      });
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: 'فشل الحذف',
        message: error.message,
      });
    },
  });
}
