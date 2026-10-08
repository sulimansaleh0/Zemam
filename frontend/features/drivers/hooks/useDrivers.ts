'use client';

import { useQuery } from '@tanstack/react-query';
import { driverService } from '../services/driverService';
import { driverKeys } from '@/shared/constants/queryKeys';
import { enrichDriver } from '../utils/driverHelpers';
import type {
  Driver,
  DriversQueryParams,
} from '../types/driver.types';
import type { PaginationInfo } from '@/shared/types/api.types';

// ============================================================
//  Centralized Query Keys re-export
// ============================================================

export const DRIVER_KEYS = driverKeys;

// ============================================================
//  Data Query Hooks (React Query)
// ============================================================

/**
 * جلب قائمة السائقين مع تحويل البيانات والألوان والأحرف الأولى
 */
export function useDrivers(params?: DriversQueryParams) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await driverService.getDrivers(params, signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') return { drivers: [] };
        throw new Error(res.message);
      }
      return res.data;
    },
    select: (data): Driver[] => {
      return (data.drivers || []).map(enrichDriver);
    },
    staleTime: 60 * 1000,
  });
}

/**
 * اسم بديل متوافق للتوافق مع الاستخدامات السابقة
 */
export const useDriversList = useDrivers;

/**
 * جلب قائمة السائقين مع دعم الترقيم من الخادم (Server-side Pagination)
 */
export function usePaginatedDrivers(params: DriversQueryParams) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await driverService.getDrivers(params, signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') {
          return { drivers: [], pagination: undefined };
        }
        throw new Error(res.message);
      }
      return res.data;
    },
    select: (data): { drivers: Driver[]; pagination?: PaginationInfo } => {
      return {
        drivers: (data.drivers || []).map(enrichDriver),
        pagination: data.pagination,
      };
    },
    staleTime: 60 * 1000,
  });
}

/**
 * جلب بيانات سائق واحد بالمعرف مع تفاصيل المركبة المسندة
 */
export function useDriver(driverId: string) {
  return useQuery({
    queryKey: driverKeys.detail(driverId),
    queryFn: async ({ signal }) => {
      const res = await driverService.getDriverById(driverId, signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') return null;
        throw new Error(res.message);
      }
      return res.data.driver;
    },
    select: (driver): Driver | null => {
      if (!driver) return null;
      return enrichDriver(driver);
    },
    enabled: Boolean(driverId),
    staleTime: 60 * 1000,
  });
}

/**
 * جلب الإحصائيات التشغيلية لسائق واحد من الخادم
 */
export function useDriverStats(driverId: string) {
  return useQuery({
    queryKey: driverKeys.stats(driverId),
    queryFn: async ({ signal }) => {
      const res = await driverService.getDriverStats(driverId, signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') return null;
        throw new Error(res.message);
      }
      return res.data.stats;
    },
    enabled: Boolean(driverId),
    staleTime: 30 * 1000,
  });
}

/**
 * جلب السائقين المتاحين (غير المرتبطين بفريق)
 */
export function useAvailableDrivers() {
  return useQuery({
    queryKey: driverKeys.list({ withoutTeam: true }),
    queryFn: async ({ signal }) => {
      const res = await driverService.getAvailableDrivers(signal);
      if (!res.success) {
        if (res.message === 'Request cancelled') return [];
        throw new Error(res.message);
      }
      return res.data.drivers;
    },
    select: (drivers): Driver[] => {
      return (drivers || []).map(enrichDriver);
    },
    staleTime: 60 * 1000,
  });
}
