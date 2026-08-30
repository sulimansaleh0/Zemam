'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/Toast';
import { vehicleService } from '../services/vehicle.service';
import { useDriversList } from '@/features/drivers';
import type {
  BackendVehicle,
  VehicleWithRelations,
  CreateVehicleInput,
  AssignDriverInput,
  ChangeVehicleStatusInput,
} from '../types/vehicle.types';

// ============================================================
//  Query Keys
// ============================================================

export const VEHICLE_QUERY_KEYS = {
  all: ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
};

// ============================================================
//  Data Hooks (React Query v5)
// ============================================================

/**
 * Hook لجلب جميع المركبات مع دمج معلومات السائق من قائمة السائقين
 */
export function useVehicles() {
  const driversQuery = useDriversList();
  const drivers = driversQuery.data ?? [];

  return useQuery({
    queryKey: VEHICLE_QUERY_KEYS.all,
    queryFn: async () => {
      const result = await vehicleService.getVehicles();
      if (!result.success) throw new Error(result.message);
      return result.data.vehicles;
    },
    select: (vehicles: BackendVehicle[]): VehicleWithRelations[] => {
      return vehicles.map((v) => {
        const assignedDriver = drivers.find((d) => d._id === v.driverId);
        return {
          ...v,
          driverName: assignedDriver
            ? assignedDriver.name !== 'Default'
              ? assignedDriver.name
              : assignedDriver.email.split('@')[0]
            : undefined,
          driverEmail: assignedDriver?.email,
        };
      });
    },
  });
}

/**
 * Hook لجلب السائقين النشطين المتاحين للتعيين
 */
export function useAvailableDrivers() {
  const driversQuery = useDriversList();
  const drivers = driversQuery.data ?? [];
  return {
    drivers: drivers.filter((d) => d.status === 'active'),
    isLoading: driversQuery.isLoading,
  };
}

/**
 * Mutation لإنشاء مركبة جديدة
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateVehicleInput) => {
      const result = await vehicleService.createVehicle(data);
      if (!result.success) throw new Error(result.message);
      return result.data.vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      addToast({
        type: 'success',
        title: 'تمت الإضافة',
        message: 'تم تسجيل المركبة الجديدة بنجاح',
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
 * Mutation لتغيير حالة المركبة (نشطة / غير نشطة)
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
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      const label = status === 'active' ? 'تفعيل' : 'تعطيل';
      addToast({
        type: 'info',
        title: 'تحديث الحالة',
        message: `تم ${label} المركبة بنجاح`,
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
 * Mutation لتعيين سائق لمركبة
 */
export function useAssignDriver() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      driverId,
    }: {
      vehicleId: string;
      driverId: string;
    }) => {
      const result = await vehicleService.assignDriver(vehicleId, { driverId });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast({
        type: 'success',
        title: 'تعيين السائق',
        message: 'تم تعيين السائق للمركبة بنجاح',
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
 * Mutation لفك ارتباط سائق عن مركبة
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      addToast({
        type: 'info',
        title: 'فك الارتباط',
        message: 'تم فك ارتباط السائق عن المركبة بنجاح',
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
 * Mutation لتعيين مركبة لفريق تشغيلي
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      addToast({
        type: 'success',
        title: 'تعيين الفريق',
        message: 'تم تعيين المركبة للفريق بنجاح',
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
 * Mutation لفك ارتباط مركبة عن فريقها التشغيلي
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      addToast({
        type: 'info',
        title: 'فك ارتباط الفريق',
        message: 'تم نقل المركبة إلى المستودع العام بنجاح',
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
 * Mutation لحذف مركبة (Soft Delete)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VEHICLE_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      addToast({
        type: 'info',
        title: 'حذف المركبة',
        message: 'تم حذف المركبة بنجاح',
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
