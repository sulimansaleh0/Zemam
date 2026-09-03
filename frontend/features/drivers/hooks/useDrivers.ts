'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTeams } from '@/features/teams';
import { useToast } from '@/shared/ui/Toast';
import { driverService } from '../services/driverService';
import { vehicleService } from '@/features/vehicles/services/vehicle.service';
import { enrichDriver, exportDriversCSV, getDriverDisplayName, getDriverTeamId } from '../utils/driverHelpers';
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

const TEAM_KEYS = {
  all: ['teams'] as const,
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
    queryFn: async ({ signal }) => {
      const [driversRes, vehiclesRes] = await Promise.all([
        driverService.getDrivers(signal),
        vehicleService.getVehicles(signal).catch(() => ({ success: true as const, data: { vehicles: [] } })),
      ]);

      if (!driversRes.success) {
        if (driversRes.message === 'Request cancelled') return [];
        throw new Error(driversRes.message);
      }

      const vehicles = vehiclesRes.success && vehiclesRes.data ? vehiclesRes.data.vehicles : [];

      return driversRes.data.drivers.map((d) => {
        const enriched = enrichDriver(d);
        const assignedVeh = vehicles.find((v) => {
          const vDriverId = typeof v.driverId === 'object' && v.driverId !== null ? v.driverId._id : v.driverId;
          return vDriverId === d._id;
        });
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
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * جلب قائمة المركبات لاستخدامها في نافذة تعيين المركبة للسائق
 */
export function useAvailableVehicles() {
  return useQuery({
    queryKey: VEHICLE_KEYS.all,
    queryFn: async ({ signal }) => {
      const result = await vehicleService.getVehicles(signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.vehicles ?? [];
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: DRIVER_KEYS.all });
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
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all });
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
      queryClient.invalidateQueries({ queryKey: TEAM_KEYS.all });
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
//  Page Hook — UI state + Orchestration
// ============================================================

export function useDriversPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  // ── UI State ─────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DriverStatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<DriverSortOrder>('newest');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });

  // ── Data ─────────────────────────────────────────────────
  const driversQuery = useDriversList();
  const createMutation = useCreateDriver();
  const changeStatusMutation = useChangeDriverStatus();
  const deleteMutation = useDeleteDriver();
  const assignVehicleMutation = useAssignVehicleToDriver();
  const unassignVehicleMutation = useUnassignVehicleFromDriver();
  const assignTeamMutation = useAssignDriverToTeam();
  const removeTeamMutation = useRemoveDriverFromTeam();

  const drivers = driversQuery.data ?? [];

  // ── Auto-select first driver ──────────────────────────────
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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [drivers, searchQuery, statusFilter, sortOrder]);

  const selectedDriver = useMemo(
    () => drivers.find((d) => d._id === selectedId) ?? null,
    [drivers, selectedId]
  );

  const metrics = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter((d) => d.status === 'active').length;
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
  const handleCreate = useCallback(
    async (data: CreateDriverInput) => {
      await createMutation.mutateAsync(data);
      setModal({ type: 'closed' });
    },
    [createMutation]
  );

  const handleToggleStatus = useCallback(
    (driver: Driver) => {
      const newStatus: DriverStatus = driver.status === 'active' ? 'inactive' : 'active';
      changeStatusMutation.mutate({ id: driver._id, status: newStatus });
    },
    [changeStatusMutation]
  );

  const handleDelete = useCallback(async () => {
    if (modal.type !== 'delete') return;
    await deleteMutation.mutateAsync(modal.driver._id);
    setModal({ type: 'closed' });
  }, [modal, deleteMutation]);

  const handleAssignVehicle = useCallback(
    async (vehicleId: string) => {
      if (modal.type !== 'assign-vehicle') return;
      await assignVehicleMutation.mutateAsync({
        driverId: modal.driver._id,
        vehicleId,
      });
      setModal({ type: 'closed' });
    },
    [modal, assignVehicleMutation]
  );

  const handleUnassignVehicle = useCallback(
    async (driver: Driver) => {
      await unassignVehicleMutation.mutateAsync(driver._id);
    },
    [unassignVehicleMutation]
  );

  const handleAssignTeam = useCallback((driver: Driver) => {
    setModal({ type: 'assign-team', driver });
  }, []);

  const handleUnassignTeam = useCallback(
    async (driver: Driver) => {
      await removeTeamMutation.mutateAsync(driver._id);
    },
    [removeTeamMutation]
  );

  const handleExportCSV = useCallback(() => {
    if (drivers.length === 0) {
      addToast({ type: 'warning', message: 'لا توجد بيانات سائقين للتصدير' });
      return;
    }
    exportDriversCSV(drivers);
    addToast({ type: 'success', title: 'تم التصدير', message: 'تم تصدير بيانات السائقين بصيغة CSV' });
  }, [drivers, addToast]);

  return {
    // Data
    drivers,
    filteredDrivers,
    selectedDriver,
    metrics,

    // Query state
    isLoading: driversQuery.isLoading,
    isError: driversQuery.isError,
    error: driversQuery.error,

    // Mutations pending state
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isAssigningVehicle: assignVehicleMutation.isPending,
    isUnassigningVehicle: unassignVehicleMutation.isPending,
    isAssigningTeam: assignTeamMutation.isPending,
    isRemovingTeam: removeTeamMutation.isPending,

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

// ============================================================
//  Detail Page Hook — Orchestrates the Driver Detail page
// ============================================================

export function useDriverDetailPage(driverId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<'المهام' | 'البلاغات' | 'الوقود'>('المهام');
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Queries
  const { data: drivers = [], isLoading, isError, error } = useDriversList();
  const { data: teamsList = [] } = useTeams();

  // Mutations
  const changeStatusMutation = useChangeDriverStatus();
  const deleteMutation = useDeleteDriver();
  const assignVehicleMutation = useAssignVehicleToDriver();
  const unassignVehicleMutation = useUnassignVehicleFromDriver();
  const removeTeamMutation = useRemoveDriverFromTeam();

  // Selected driver
  const driver = useMemo(() => {
    return drivers.find((d) => d._id === driverId) || null;
  }, [drivers, driverId]);

  // Team lookup
  const teamObj = useMemo(() => {
    const teamId = getDriverTeamId(driver?.teamId);
    if (!teamId) return null;
    return teamsList.find((t) => t._id === teamId) || null;
  }, [teamsList, driver?.teamId]);

  const displayName = getDriverDisplayName(driver);
  const isActive = driver?.status === 'active';
  const userName = user?.name || user?.email?.split('@')[0] || '';

  // Action handlers
  const handleToggleStatus = useCallback(async () => {
    if (!driver) return;
    const nextStatus: DriverStatus = isActive ? 'inactive' : 'active';
    await changeStatusMutation.mutateAsync({ id: driver._id, status: nextStatus });
  }, [driver, isActive, changeStatusMutation]);

  const handleDelete = useCallback(async () => {
    if (!driver) return;
    await deleteMutation.mutateAsync(driver._id);
    setIsDeleteOpen(false);
    router.push('/drivers');
  }, [driver, deleteMutation, router]);

  const handleAssignVehicle = useCallback(
    async (vehicleId: string) => {
      if (!driver) return;
      await assignVehicleMutation.mutateAsync({
        driverId: driver._id,
        vehicleId,
      });
      setIsAssignVehicleOpen(false);
    },
    [driver, assignVehicleMutation]
  );

  const handleUnassignVehicle = useCallback(async () => {
    if (!driver) return;
    await unassignVehicleMutation.mutateAsync(driver._id);
  }, [driver, unassignVehicleMutation]);

  const handleRemoveTeam = useCallback(async () => {
    if (!driver) return;
    await removeTeamMutation.mutateAsync(driver._id);
  }, [driver, removeTeamMutation]);

  return {
    // Data
    driver,
    displayName,
    isActive,
    teamObj,

    // Status
    isLoading,
    isError,
    error,

    // Tab state
    tab,
    setTab,

    // Modal states
    isAssignVehicleOpen,
    setIsAssignVehicleOpen,
    isAssignTeamOpen,
    setIsAssignTeamOpen,
    isDeleteOpen,
    setIsDeleteOpen,

    // Action handlers
    handleToggleStatus,
    handleDelete,
    handleAssignVehicle,
    handleUnassignVehicle,
    handleRemoveTeam,

    // Pending states
    isChangingStatus: changeStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigningVehicle: assignVehicleMutation.isPending,
    isUnassigningVehicle: unassignVehicleMutation.isPending,
    isRemovingTeam: removeTeamMutation.isPending,

    // Auth & Navigation
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  };
}
