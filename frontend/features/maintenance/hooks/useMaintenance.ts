'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';
import { useToast } from '@/shared/ui/Toast';
import { maintenanceService } from '../services/maintenance.service';
import {
  getMaintenanceVehicleDisplay,
  getMaintenanceReporterDisplay,
  formatMaintenanceDate,
} from '../utils/maintenanceHelpers';
import type {
  BackendMaintenanceRecord,
  MaintenanceRecordWithRelations,
  CreateMaintenanceInput,
  VerifyMaintenanceInput,
  MaintenanceStatus,
  MaintenanceCategory,
  MaintenanceFilters,
  MaintenanceStats,
} from '../types/maintenance.types';

export const MAINTENANCE_QUERY_KEYS = {
  all: ['maintenance'] as const,
  list: (filters?: MaintenanceFilters) => ['maintenance', 'list', filters] as const,
  stats: ['maintenance', 'stats'] as const,
};

/**
 * Hook لجلب سجلات الصيانة مع تحويل العلاقات
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
      return records.map((record) => {
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
      });
    },
  });
}

/**
 * Hook لجلب إحصائيات الصيانة والتكلفة الإجمالية
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

/**
 * Hook لتسجيل طلب صيانة جديد
 */
export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateMaintenanceInput) =>
      maintenanceService.createMaintenanceRecord(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم توثيق طلب الصيانة بنجاح' });
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل توثيق طلب الصيانة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook لاعتماد أو رفض طلب صيانة
 */
export function useVerifyMaintenance() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: VerifyMaintenanceInput) =>
      maintenanceService.verifyMaintenanceRecord(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.addToast({ type: 'success', message: 'تم تحديث حالة طلب الصيانة بنجاح' });
        queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.all });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        toast.addToast({ type: 'error', message: res.message || 'فشل تحديث حالة الصيانة' });
      }
    },
    onError: (err: Error) => {
      toast.addToast({ type: 'error', message: err.message || 'حدث خطأ أثناء الاتصال بالخادم' });
    },
  });
}

/**
 * Hook متكامل لإدارة واجهة صفحة الصيانة والفلترة
 */
export function useMaintenancePage() {
  const { user, logout } = useAuth();
  const vehiclesQuery = useVehicles();

  const [activeTab, setActiveTab] = useState<'all' | MaintenanceStatus>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | MaintenanceCategory>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState<MaintenanceRecordWithRelations | null>(null);
  const [selectedRecordForVerify, setSelectedRecordForVerify] = useState<MaintenanceRecordWithRelations | null>(null);

  const filters: MaintenanceFilters = useMemo(() => ({
    status: activeTab,
    category: activeCategory,
    vehicleId: selectedVehicleId !== 'all' ? selectedVehicleId : undefined,
  }), [activeTab, activeCategory, selectedVehicleId]);

  const maintenanceQuery = useMaintenance(filters);
  const statsQuery = useMaintenanceStats();

  const rawRecords = maintenanceQuery.data ?? [];

  // تصفية إضافية عبر شريط البحث النصي
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return rawRecords;
    const q = searchQuery.toLowerCase();

    return rawRecords.filter((record) => {
      const descMatch = record.description?.toLowerCase().includes(q) ?? false;
      const vehicleMatch =
        record.vehicleModel?.toLowerCase().includes(q) ||
        String(record.vehiclePlate).toLowerCase().includes(q);
      const reporterMatch =
        record.reporterName?.toLowerCase().includes(q) ||
        record.reporterEmail?.toLowerCase().includes(q);

      return descMatch || vehicleMatch || reporterMatch;
    });
  }, [rawRecords, searchQuery]);

  // إحصائيات مدمجة
  const stats: MaintenanceStats = useMemo(() => {
    if (statsQuery.data && statsQuery.data.totalRecords > 0) {
      return statsQuery.data;
    }
    // Fallback locally from records
    let totalRecords = rawRecords.length;
    let totalCost = 0;
    let pending = 0;
    let approved = 0;
    let declined = 0;

    for (const r of rawRecords) {
      if (r.status === 'pending') pending++;
      else if (r.status === 'approved') {
        approved++;
        totalCost += Number(r.cost) || 0;
      } else if (r.status === 'declined') declined++;
    }

    return { totalRecords, totalCost, pending, approved, declined };
  }, [statsQuery.data, rawRecords]);

  return {
    records: filteredRecords,
    allRecordsCount: rawRecords.length,
    isLoading: maintenanceQuery.isLoading || statsQuery.isLoading,
    isError: maintenanceQuery.isError || statsQuery.isError,
    error: maintenanceQuery.error || statsQuery.error,
    refetch: () => {
      maintenanceQuery.refetch();
      statsQuery.refetch();
    },
    isRefetching: maintenanceQuery.isRefetching || statsQuery.isRefetching,

    stats,

    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    selectedVehicleId,
    setSelectedVehicleId,
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
