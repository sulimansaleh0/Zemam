'use client';

import { useQuery } from '@tanstack/react-query';
import { maintenanceService } from '../services/maintenance.service';
import {
  getMaintenanceVehicleDisplay,
  getMaintenanceReporterDisplay,
  formatMaintenanceDate,
} from '../utils/maintenanceHelpers';
import type {
  BackendMaintenanceRecord,
  MaintenanceRecordWithRelations,
  MaintenanceFilters,
  PaginatedMaintenanceResult,
} from '../types/maintenance.types';

export const MAINTENANCE_QUERY_KEYS = {
  all: ['maintenance'] as const,
  list: (filters?: MaintenanceFilters) => ['maintenance', 'list', filters] as const,
  stats: ['maintenance', 'stats'] as const,
};

function transformMaintenanceRecord(record: BackendMaintenanceRecord): MaintenanceRecordWithRelations {
  const veh = getMaintenanceVehicleDisplay(record.vehicleId);
  const rep = getMaintenanceReporterDisplay(record.reportedBy);
  const formattedDate = formatMaintenanceDate(record.createdAt);

  return {
    ...record,
    vehicleModel: veh.model,
    vehiclePlate: veh.plate,
    reporterName: rep.name,
    reporterEmail: rep.email,
    formattedDate,
  };
}

/**
 * Hook لجلب سجلات الصيانة العادية (غير المقسمة صفحات) مع تحويل العلاقات
 */
export function useMaintenance(filters?: MaintenanceFilters) {
  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.list(filters),
    queryFn: async ({ signal }) => {
      const result = await maintenanceService.getMaintenanceRecords(filters, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.records ?? [];
    },
    select: (records: BackendMaintenanceRecord[]): MaintenanceRecordWithRelations[] => {
      return records.map(transformMaintenanceRecord);
    },
  });
}

/**
 * Hook لجلب سجلات الصيانة مع دعم الترقيم والبحث من الخادم
 */
export function usePaginatedMaintenance(filters?: MaintenanceFilters) {
  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.list(filters),
    queryFn: async ({ signal }): Promise<PaginatedMaintenanceResult> => {
      const result = await maintenanceService.getMaintenanceRecords(filters, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') {
          return { records: [], pagination: undefined };
        }
        throw new Error(result.message);
      }

      const rawRecords = result.data?.records ?? [];
      const records = rawRecords.map(transformMaintenanceRecord);

      return {
        records,
        pagination: result.data?.pagination,
      };
    },
  });
}

/**
 * Hook لجلب إحصائيات الصيانة والتكلفة الإجمالية من تجميعات الخادم
 */
export function useMaintenanceStats() {
  return useQuery({
    queryKey: MAINTENANCE_QUERY_KEYS.stats,
    queryFn: async ({ signal }) => {
      const result = await maintenanceService.getMaintenanceStats(signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') {
          return { totalRecords: 0, totalCost: 0, pending: 0, approved: 0, declined: 0 };
        }
        throw new Error(result.message);
      }
      return result.data?.stats ?? { totalRecords: 0, totalCost: 0, pending: 0, approved: 0, declined: 0 };
    },
  });
}
