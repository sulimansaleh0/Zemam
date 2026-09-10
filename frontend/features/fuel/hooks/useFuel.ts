'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';
import { useToast } from '@/shared/ui/Toast';
import { fuelService } from '../services/fuel.service';
import {
  getFuelVehicleDisplay,
  getFuelUserDisplay,
  formatFuelDate,
} from '../utils/fuelHelpers';
import type {
  BackendFuelRecord,
  FuelRecordWithRelations,
  CreateFuelInput,
  VerifyFuelInput,
  FuelStatus,
  FuelFilters,
  FuelStats,
} from '../types/fuel.types';

export const FUEL_QUERY_KEYS = {
  all: ['fuel'] as const,
  list: (filters?: FuelFilters) => ['fuel', 'list', filters] as const,
  stats: (vehicleId?: string) => ['fuel', 'stats', vehicleId] as const,
};

/**
 * Hook لجلب قائمة سجلات الوقود مع تحويل العلاقات وحساب سعر اللتر
 */
export function useFuel(filters?: FuelFilters) {
  return useQuery({
    queryKey: FUEL_QUERY_KEYS.list(filters),
    queryFn: async ({ signal }) => {
      const result = await fuelService.getFuelRecords(filters, signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.records ?? [];
    },
    select: (records: BackendFuelRecord[]): FuelRecordWithRelations[] => {
      return records.map((record) => {
        const veh = getFuelVehicleDisplay(record.vehicleId);
        const usr = getFuelUserDisplay(record.userId);
        const formattedDate = formatFuelDate(record.createdAt);
        const pricePerLiter = record.qty > 0 ? record.cost / record.qty : 0;

        return {
          ...record,
          vehicleModel: veh.model,
          vehiclePlate: veh.plate,
          expectedEfficiency: veh.expectedEfficiency,
          userName: usr.name,
          userEmail: usr.email,
          formattedDate,
          pricePerLiter,
        };
      });
    },
  });
}

/**
 * Hook لجلب إحصائيات ومؤشرات كفاءة الوقود
 */
export function useFuelStats(vehicleId?: string) {
  return useQuery({
    queryKey: FUEL_QUERY_KEYS.stats(vehicleId),
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
            fuelIssues: 0,
            fullTankRecords: 0,
            averageEfficiency: 0,
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
          fuelIssues: 0,
          fullTankRecords: 0,
          averageEfficiency: 0,
        }
      );
    },
  });
}

/**
 * Hook لتسجيل إيصال تعبئة وقود جديد
 */
export function useCreateFuel() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateFuelInput) => fuelService.createFuelRecord(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم توثيق إيصال الوقود بنجاح' });
        queryClient.invalidateQueries({ queryKey: FUEL_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل توثيق إيصال الوقود' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
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
    mutationFn: (data: VerifyFuelInput) => fuelService.verifyFuelRecord(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم تحديث حالة إيصال الوقود بنجاح' });
        queryClient.invalidateQueries({ queryKey: FUEL_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل مراجعة الإيصال' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook شامل لإدارة واجهة صفحة الوقود والفلترة
 */
export function useFuelPage() {
  const { user, logout } = useAuth();
  const vehiclesQuery = useVehicles();

  const [activeTab, setActiveTab] = useState<'all' | FuelStatus>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<FuelRecordWithRelations | null>(null);
  const [selectedRecordForVerify, setSelectedRecordForVerify] = useState<FuelRecordWithRelations | null>(null);

  const filters: FuelFilters = useMemo(
    () => ({
      status: activeTab,
      vehicleId: selectedVehicleId !== 'all' ? selectedVehicleId : undefined,
      fuelIssue: onlyIssues ? true : undefined,
    }),
    [activeTab, selectedVehicleId, onlyIssues]
  );

  const fuelQuery = useFuel(filters);
  const statsQuery = useFuelStats(selectedVehicleId !== 'all' ? selectedVehicleId : undefined);

  const rawRecords = fuelQuery.data ?? [];

  // بحث نصي
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return rawRecords;
    const q = searchQuery.toLowerCase();

    return rawRecords.filter((record) => {
      const vehicleMatch =
        record.vehicleModel?.toLowerCase().includes(q) ||
        String(record.vehiclePlate).toLowerCase().includes(q);
      const userMatch =
        record.userName?.toLowerCase().includes(q) ||
        record.userEmail?.toLowerCase().includes(q);
      const issueMatch = record.fuelIssueMessage?.toLowerCase().includes(q) ?? false;

      return vehicleMatch || userMatch || issueMatch;
    });
  }, [rawRecords, searchQuery]);

  return {
    records: filteredRecords,
    allRecordsCount: rawRecords.length,
    isLoading: fuelQuery.isLoading || statsQuery.isLoading,
    isError: fuelQuery.isError || statsQuery.isError,
    error: fuelQuery.error || statsQuery.error,
    refetch: () => {
      fuelQuery.refetch();
      statsQuery.refetch();
    },
    isRefetching: fuelQuery.isRefetching || statsQuery.isRefetching,

    stats: statsQuery.data ?? {
      totalRecords: 0,
      totalCost: 0,
      totalQty: 0,
      pending: 0,
      approved: 0,
      declined: 0,
      fuelIssues: 0,
      fullTankRecords: 0,
      averageEfficiency: 0,
    },

    activeTab,
    setActiveTab,
    selectedVehicleId,
    setSelectedVehicleId,
    onlyIssues,
    setOnlyIssues,
    searchQuery,
    setSearchQuery,

    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedRecordForDetails,
    setSelectedRecordForDetails,
    selectedRecordForVerify,
    setSelectedRecordForVerify,

    vehicles: vehiclesQuery.data ?? [],
    isLoadingVehicles: vehiclesQuery.isLoading,

    userName: user?.name || user?.email || 'المستخدم',
    menuOpen,
    setMenuOpen,
    logout,
  };
}
