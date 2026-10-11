'use client';

import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '../services/vehicle.service';
import { vehicleKeys } from '@/shared/constants/queryKeys';
import { useDriversList } from '@/features/drivers';
import type {
  BackendVehicle,
  VehicleWithRelations,
  DriverSummary,
  TeamSummary,
  VehicleQueryParams,
  PaginationInfo,
} from '../types/vehicle.types';

// Re-export mutations and page hooks for seamless module access
export {
  useCreateVehicle,
  useUpdateVehicle,
  useChangeVehicleStatus,
  useAssignDriver,
  useUnassignDriver,
  useAssignVehicleToTeam,
  useRemoveVehicleFromTeam,
  useDeleteVehicle,
} from './useVehicleMutations';

export { useVehiclesPage } from './useVehiclesPage';
export { useVehicleDetailPage } from './useVehicleDetailPage';

// Export centrally defined query keys
export const VEHICLE_QUERY_KEYS = vehicleKeys;

/**
 * Hook لجلب جميع المركبات (للقوائم المنسدلة وشاشات التعيين) مع استخراج معلومات السائق والفريق
 */
export function useVehicles(params?: VehicleQueryParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: params ? vehicleKeys.list(params) : vehicleKeys.all,
    queryFn: async ({ signal }) => {
      const result = await vehicleService.getVehicles(params, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.vehicles ?? [];
    },
    enabled: options?.enabled,
    select: (vehicles: BackendVehicle[]): VehicleWithRelations[] => {
      return vehicles.map((v) => {
        const driverObj = typeof v.driverId === 'object' && v.driverId !== null ? (v.driverId as DriverSummary) : null;
        const teamObj = typeof v.teamId === 'object' && v.teamId !== null ? (v.teamId as TeamSummary) : null;

        return {
          ...v,
          driverName: driverObj
            ? driverObj.name && driverObj.name !== 'Default'
              ? driverObj.name
              : driverObj.email?.split('@')[0]
            : undefined,
          driverEmail: driverObj?.email,
          teamName: teamObj?.name,
        };
      });
    },
  });
}

/**
 * Hook لجلب قائمة المركبات مع دعم كامل للترقيم والتصفية والبحث من الخادم (Server-side Pagination & Filtering)
 */
export function usePaginatedVehicles(params: VehicleQueryParams = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: async ({ signal }) => {
      const result = await vehicleService.getVehicles(params, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return { vehicles: [], pagination: undefined };
        throw new Error(result.message);
      }
      return {
        vehicles: result.data?.vehicles ?? [],
        pagination: result.data?.pagination,
      };
    },
    select: (data): { vehicles: VehicleWithRelations[]; pagination?: PaginationInfo } => {
      const vehicles: VehicleWithRelations[] = (data.vehicles || []).map((v) => {
        const driverObj = typeof v.driverId === 'object' && v.driverId !== null ? (v.driverId as DriverSummary) : null;
        const teamObj = typeof v.teamId === 'object' && v.teamId !== null ? (v.teamId as TeamSummary) : null;

        return {
          ...v,
          driverName: driverObj
            ? driverObj.name && driverObj.name !== 'Default'
              ? driverObj.name
              : driverObj.email?.split('@')[0]
            : undefined,
          driverEmail: driverObj?.email,
          teamName: teamObj?.name,
        };
      });
      return {
        vehicles,
        pagination: data.pagination,
      };
    },
  });
}

/**
 * Hook لجلب إحصائيات الأسطول الإجمالية المحسوبة مباشرة في الباك إند
 */
export function useFleetOverviewStats() {
  return useQuery({
    queryKey: vehicleKeys.overviewStats,
    queryFn: async ({ signal }) => {
      const res = await vehicleService.getFleetOverviewStats(signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') return null;
        throw new Error(res.message);
      }
      return res.data?.stats ?? null;
    },
  });
}

/**
 * Hook لجلب السائقين النشطين المتاحين للتعيين (يُستدعى فقط عند الحاجة في شاشات ونوافذ التعيين)
 */
export function useAvailableDrivers() {
  const driversQuery = useDriversList();
  const drivers = driversQuery.data ?? [];
  return {
    drivers: drivers.filter((d: { status?: string }) => d.status === 'active'),
    isLoading: driversQuery.isLoading,
  };
}

/**
 * Hook لجلب المركبات المتاحة (بدون فريق / في المخزون العام)
 */
export function useAvailableVehicles() {
  return useQuery({
    queryKey: vehicleKeys.list('available'),
    queryFn: async ({ signal }) => {
      const result = await vehicleService.getAvailableVehicles(signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.vehicles ?? [];
    },
  });
}

/**
 * Hook لجلب تفاصيل مركبة محددة
 */
export function useVehicleDetail(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const result = await vehicleService.getVehicleById(id, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return null;
        throw new Error(result.message);
      }
      return result.data?.vehicle ?? null;
    },
    select: (v: BackendVehicle | null): VehicleWithRelations | null => {
      if (!v) return null;
      const driverObj = typeof v.driverId === 'object' && v.driverId !== null ? (v.driverId as DriverSummary) : null;
      const teamObj = typeof v.teamId === 'object' && v.teamId !== null ? (v.teamId as TeamSummary) : null;

      return {
        ...v,
        driverName: driverObj
          ? driverObj.name && driverObj.name !== 'Default'
            ? driverObj.name
            : driverObj.email?.split('@')[0]
          : undefined,
        driverEmail: driverObj?.email,
        teamName: teamObj?.name,
      };
    },
    enabled: Boolean(id),
  });
}

/**
 * Hook لجلب إحصائيات تشغيل المركبة (مسافة، وقود، صيانة، كفاءة)
 */
export function useVehicleStats(vehicleId: string) {
  return useQuery({
    queryKey: vehicleKeys.stats(vehicleId),
    queryFn: async ({ signal }) => {
      if (!vehicleId) return null;
      const res = await vehicleService.getVehicleStats(vehicleId, signal);
      if (!res.success) return null;
      return res.data?.stats ?? null;
    },
    enabled: Boolean(vehicleId),
  });
}
