'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { driverService } from '../services/driverService';
import { vehicleService } from '@/features/vehicles/services/vehicle.service';
import { enrichDriver, exportDriversCSV } from '../utils/driverHelpers';
import type {
  Driver,
  DriverStatus,
  DriverStatusFilter,
  DriverSortOrder,
  CreateDriverInput,
} from '../types/driver.types';

// ============================================================
//  Query Keys
// ============================================================

export const DRIVER_KEYS = {
  all: ['drivers'] as const,
} as const;

const VEHICLE_KEYS = {
  all: ['vehicles'] as const,
} as const;

// ============================================================
//  Data Hooks (React Query)
// ============================================================

/**
 * جلب قائمة السائقين مع enrichment وربط بيانات المركبة المعينة.
 */
export function useDriversList() {
  return useQuery({
    queryKey: DRIVER_KEYS.all,
    queryFn: async () => {
      const [driversRes, vehiclesRes] = await Promise.all([
        driverService.getDrivers(),
        vehicleService.getVehicles().catch(() => ({ success: true as const, data: { vehicles: [] } })),
      ]);
      if (!driversRes.success) throw new Error(driversRes.message);

      const vehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data.vehicles : [];

      return driversRes.data.drivers.map((d) => {
        const enriched = enrichDriver(d);
        const assignedVeh = vehicles.find((v) => v.driverId === d._id);
        if (assignedVeh) {
          enriched.assignedVehicle = {
            _id: assignedVeh._id,
            model: assignedVeh.model,
            year: assignedVeh.year,
            plateNumber: assignedVeh.plateNumber,
          };
        }
        return enriched;
      });
    },
  });
}

/**
 * جلب قائمة المركبات لاستخدامها في نافذة تعيين المركبة للسائق
 */
export function useAvailableVehicles() {
  return useQuery({
    queryKey: VEHICLE_KEYS.all,
    queryFn: async () => {
      const result = await vehicleService.getVehicles();
      if (!result.success) throw new Error(result.message);
      return result.data.vehicles;
    },
  });
}

/**
 * Mutation لإنشاء سائق جديد.
 * يُحدّث القائمة ويُطلق toast عند النجاح أو الفشل.
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
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      addToast({ type: 'success', title: 'تمت الإضافة', message: 'تمت إضافة السائق بنجاح' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'فشلت العملية', message: error.message });
    },
  });
}

/**
 * Mutation لتغيير حالة سائق (تفعيل / تعطيل).
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
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      const label = status === 'active' ? 'تفعيل' : 'تعطيل';
      addToast({ type: 'info', title: 'تغيير الحالة', message: `تم ${label} حساب السائق بنجاح` });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'فشل تغيير الحالة', message: error.message });
    },
  });
}

/**
 * Mutation لحذف سائق (soft delete).
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
      addToast({ type: 'info', title: 'تم الحذف', message: 'تم حذف سجل السائق' });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: VEHICLE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
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

// ============================================================
//  Modal State — Discriminated Union
// ============================================================

export type ModalState =
  | { type: 'closed' }
  | { type: 'create' }
  | { type: 'delete'; driver: Driver }
  | { type: 'assign-vehicle'; driver: Driver }
  | { type: 'assign-team'; driver: Driver };

// ============================================================
//  Page Hook — UI state + orchestration
// ============================================================

/**
 * Hook رئيسي لصفحة السائقين.
 * يجمع بين الـ data hooks والـ UI state في مكان واحد.
 */
export function useDriversPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  // ── UI State ─────────────────────────────────────────────
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState<DriverStatusFilter>('all');
  const [sortOrder, setSortOrder]         = useState<DriverSortOrder>('newest');
  const [menuOpen, setMenuOpen]           = useState(false);
  const [modal, setModal]                 = useState<ModalState>({ type: 'closed' });

  // ── Data ─────────────────────────────────────────────────
  const driversQuery            = useDriversList();
  const createMutation          = useCreateDriver();
  const changeStatusMutation    = useChangeDriverStatus();
  const deleteMutation          = useDeleteDriver();
  const assignVehicleMutation   = useAssignVehicleToDriver();
  const unassignVehicleMutation = useUnassignVehicleFromDriver();
  const assignTeamMutation      = useAssignDriverToTeam();
  const removeTeamMutation      = useRemoveDriverFromTeam();

  const drivers = driversQuery.data ?? [];

  // ── Auto-select ──────────────────────────────────────────
  // اختيار أول سائق تلقائياً عند التحميل أو بعد حذف السائق المحدد
  useEffect(() => {
    if (drivers.length === 0) {
      setSelectedId(null);
      return;
    }
    const selectedStillExists = drivers.some((d) => d._id === selectedId);
    if (!selectedId || !selectedStillExists) {
      setSelectedId(drivers[0]._id);
    }
  }, [drivers, selectedId]);

  // ── Computed ─────────────────────────────────────────────

  const filteredDrivers = useMemo(() => {
    let result = drivers.filter((driver) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        driver.name.toLowerCase().includes(q) ||
        driver.email.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || driver.status === statusFilter;

      return matchesQuery && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // newest (default)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [drivers, searchQuery, statusFilter, sortOrder]);

  const selectedDriver = useMemo(
    () => drivers.find((d) => d._id === selectedId) ?? null,
    [drivers, selectedId],
  );

  const metrics = useMemo(() => {
    const total    = drivers.length;
    const active   = drivers.filter((d) => d.status === 'active').length;
    const inactive = drivers.filter((d) => d.status === 'inactive').length;
    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [drivers]);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  // ── Handlers ─────────────────────────────────────────────

  /** إضافة سائق جديد — يُغلق الـ modal عند النجاح فقط */
  const handleCreate = useCallback(
    async (data: CreateDriverInput) => {
      await createMutation.mutateAsync(data);
      setModal({ type: 'closed' });
    },
    [createMutation],
  );

  /** تبديل حالة السائق بين active وinactive */
  const handleToggleStatus = useCallback(
    (driver: Driver) => {
      const newStatus: DriverStatus = driver.status === 'active' ? 'inactive' : 'active';
      changeStatusMutation.mutate({ id: driver._id, status: newStatus });
    },
    [changeStatusMutation],
  );

  /** تنفيذ الحذف بعد التأكيد */
  const handleDelete = useCallback(async () => {
    if (modal.type !== 'delete') return;
    await deleteMutation.mutateAsync(modal.driver._id);
    setModal({ type: 'closed' });
  }, [modal, deleteMutation]);

  /** تعيين مركبة لسائق */
  const handleAssignVehicle = useCallback(
    async (vehicleId: string) => {
      if (modal.type !== 'assign-vehicle') return;
      await assignVehicleMutation.mutateAsync({
        driverId: modal.driver._id,
        vehicleId,
      });
      setModal({ type: 'closed' });
    },
    [modal, assignVehicleMutation],
  );

  /** فك ارتباط مركبة عن سائق */
  const handleUnassignVehicle = useCallback(
    async (driver: Driver) => {
      await unassignVehicleMutation.mutateAsync(driver._id);
    },
    [unassignVehicleMutation],
  );

  /** فتح نافذة تعيين السائق لفريق */
  const handleAssignTeam = useCallback((driver: Driver) => {
    setModal({ type: 'assign-team', driver });
  }, []);

  /** فك ارتباط السائق عن فريقه */
  const handleUnassignTeam = useCallback(
    async (driver: Driver) => {
      await removeTeamMutation.mutateAsync(driver._id);
    },
    [removeTeamMutation],
  );

  /** تصدير CSV */
  const handleExportCSV = useCallback(() => {
    if (drivers.length === 0) {
      addToast({ type: 'warning', message: 'لا توجد بيانات سائقين للتصدير' });
      return;
    }
    exportDriversCSV(drivers);
    addToast({ type: 'success', title: 'تم التصدير', message: 'تم تصدير بيانات السائقين بصيغة CSV' });
  }, [drivers, addToast]);

  // ── Return ────────────────────────────────────────────────

  return {
    // Data
    drivers,
    filteredDrivers,
    selectedDriver,
    metrics,

    // Query state
    isLoading: driversQuery.isLoading,
    isError:   driversQuery.isError,
    error:     driversQuery.error,

    // Mutations pending state
    isCreating:               createMutation.isPending,
    isDeleting:               deleteMutation.isPending,
    isChangingStatus:         changeStatusMutation.isPending,
    isAssigningVehicle:       assignVehicleMutation.isPending,
    isUnassigningVehicle:     unassignVehicleMutation.isPending,
    isAssigningTeam:          assignTeamMutation.isPending,
    isRemovingTeam:           removeTeamMutation.isPending,

    // UI state
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    menuOpen,
    setMenuOpen,
    modal,
    setModal,

    // Handlers
    handleCreate,
    handleToggleStatus,
    handleDelete,
    handleAssignVehicle,
    handleUnassignVehicle,
    handleAssignTeam,
    handleUnassignTeam,
    handleExportCSV,

    // Auth
    userName,
    logout,
  };
}
