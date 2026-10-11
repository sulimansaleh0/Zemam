'use client';

import { useQuery } from '@tanstack/react-query';
import { fuelKeys } from '@/shared/constants/queryKeys';
import { fuelService } from '../services/fuel.service';
import {
  getFuelVehicleDisplay,
  getFuelUserDisplay,
  formatFuelDate,
} from '../utils/fuelHelpers';
import type {
  BackendFuelRecord,
  FuelRecordWithRelations,
  FuelFilters,
  PaginatedFuelResult,
  PaginationInfo,
} from '../types/fuel.types';

export { useCreateFuel, useVerifyFuel, useVoidFuel } from './useFuelMutations';
export { useFuelPage } from './useFuelPage';

function mapRecordWithRelations(record: BackendFuelRecord): FuelRecordWithRelations {
  const veh = getFuelVehicleDisplay(record.vehicleId);
  const usr = getFuelUserDisplay(record.userId);
  const formattedDate = formatFuelDate(record.createdAt);
  const pricePerLiter = record.qty > 0 ? record.cost / record.qty : 0;

  return {
    ...record,
    vehicleModel: veh.model,
    vehiclePlate: veh.plate,
    userName: usr.name,
    userEmail: usr.email,
    formattedDate,
    pricePerLiter,
  };
}

/**
 * Hook لجلب سجلات الوقود المرقّمة سيرفرياً (Server-side Pagination)
 */
export function usePaginatedFuel(filters?: FuelFilters) {
  return useQuery({
    queryKey: fuelKeys.list(filters),
    queryFn: async ({ signal }): Promise<PaginatedFuelResult> => {
      const result = await fuelService.getFuelRecords(filters, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') {
          return {
            records: [],
            pagination: {
              total: 0,
              page: 1,
              limit: filters?.limit || 10,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          };
        }
        throw new Error(result.message);
      }

      const rawRecords = result.data?.records ?? [];
      const mapped = rawRecords.map(mapRecordWithRelations);

      const pagination: PaginationInfo = result.data?.pagination || {
        total: mapped.length,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        totalPages: Math.max(1, Math.ceil(mapped.length / (filters?.limit || 10))),
        hasNextPage: false,
        hasPrevPage: false,
      };

      return {
        records: mapped,
        pagination,
      };
    },
  });
}

/**
 * Hook لجلب قائمة سجلات الوقود (قائمة كاملة أو مسوّرة)
 */
export function useFuel(filters?: FuelFilters) {
  return useQuery({
    queryKey: fuelKeys.list(filters),
    queryFn: async ({ signal }) => {
      const result = await fuelService.getFuelRecords(filters, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.records ?? [];
    },
    select: (records: BackendFuelRecord[]): FuelRecordWithRelations[] => {
      return records.map(mapRecordWithRelations);
    },
  });
}

/**
 * Hook لجلب إحصائيات الوقود ورصيد المركبات الصافي من السيرفر
 */
export function useFuelStats(vehicleId?: string) {
  return useQuery({
    queryKey: fuelKeys.stats(vehicleId),
    queryFn: async ({ signal }) => {
      const result = await fuelService.getFuelStats(vehicleId, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') {
          return {
            totalRecords: 0,
            totalCost: 0,
            totalQty: 0,
            pending: 0,
            approved: 0,
            declined: 0,
            averageEfficiency: 0,
            fuelBalanceLitres: 0,
          };
        }
        throw new Error(result.message);
      }
      return (
        result.data?.stats ?? {
          totalRecords: 0,
          totalCost: 0,
          totalQty: 0,
          pending: 0,
          approved: 0,
          declined: 0,
          averageEfficiency: 0,
          fuelBalanceLitres: 0,
        }
      );
    },
  });
}
