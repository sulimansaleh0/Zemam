'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTeams } from '@/features/teams';
import { useToast } from '@/shared/ui/Toast';
import { vehicleService } from '../services/vehicle.service';
import { useDriversList } from '@/features/drivers';
import { getVehicleTeamId, getVehicleDriverId } from '../utils/vehicleHelpers';
import { vehicleKeys, driverKeys, teamKeys } from '@/shared/constants/queryKeys';
import type {
  BackendVehicle,
  VehicleWithRelations,
  CreateVehicleInput,
  AssignDriverInput,
  ChangeVehicleStatusInput,
} from '../types/vehicle.types';

// ============================================================
//  Query Keys — إعادة تصدير من المصدر المركزي للتوافق الخلفي
// ============================================================

export const VEHICLE_QUERY_KEYS = vehicleKeys;

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
    queryKey: vehicleKeys.all,
    queryFn: async ({ signal }) => {
      const result = await vehicleService.getVehicles(signal);
      if (!result.success) {
        if (result.message === 'Request cancelled') return [];
        throw new Error(result.message);
      }
      return result.data?.vehicles ?? [];
    },
    select: (vehicles: BackendVehicle[]): VehicleWithRelations[] => {
      return vehicles.map((v) => {
        const driverObj = typeof v.driverId === 'object' && v.driverId !== null ? v.driverId : null;
        const driverIdStr = driverObj ? driverObj._id : typeof v.driverId === 'string' ? v.driverId : undefined;
        const assignedDriver = driverObj || (driverIdStr ? drivers.find((d) => d._id === driverIdStr) : null);

        const teamObj = typeof v.teamId === 'object' && v.teamId !== null ? v.teamId : null;
        const teamName = teamObj?.name;

        return {
          ...v,
          driverName: assignedDriver
            ? assignedDriver.name && assignedDriver.name !== 'Default'
              ? assignedDriver.name
              : assignedDriver.email?.split('@')[0]
            : undefined,
          driverEmail: assignedDriver?.email,
          teamName,
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
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
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
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

// ============================================================
//  Page Hook — Orchestrates the Vehicles main page
// ============================================================

export function useVehiclesPage() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Queries
  const {
    data: vehiclesList = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useVehicles();

  // Mutations
  const removeTeamMutation = useRemoveVehicleFromTeam();
  const unassignDriverMutation = useUnassignDriver();

  // Modal states
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [selectedVehicleForAssign, setSelectedVehicleForAssign] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForStatusChange, setSelectedVehicleForStatusChange] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForTeam, setSelectedVehicleForTeam] =
    useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] =
    useState<VehicleWithRelations | null>(null);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  // Handlers
  const handleRemoveTeam = useCallback(
    async (vehicle: VehicleWithRelations) => {
      await removeTeamMutation.mutateAsync(vehicle._id);
    },
    [removeTeamMutation]
  );

  const handleUnassignDriver = useCallback(
    async (vehicle: VehicleWithRelations) => {
      const driverId = getVehicleDriverId(vehicle.driverId);
      if (driverId) {
        await unassignDriverMutation.mutateAsync(driverId);
      }
    },
    [unassignDriverMutation]
  );

  return {
    // Data
    vehiclesList,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,

    // Modal states
    isAddVehicleModalOpen,
    setIsAddVehicleModalOpen,
    selectedVehicleForAssign,
    setSelectedVehicleForAssign,
    selectedVehicleForStatusChange,
    setSelectedVehicleForStatusChange,
    selectedVehicleForTeam,
    setSelectedVehicleForTeam,
    selectedVehicleForDelete,
    setSelectedVehicleForDelete,

    // Actions
    handleRemoveTeam,
    handleUnassignDriver,

    // Auth & Navigation
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  };
}

// ============================================================
//  Detail Page Hook — Orchestrates the Vehicle Detail page
// ============================================================

export function useVehicleDetailPage(vehicleId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Queries
  const { data: vehicles = [], isLoading, isError, error } = useVehicles();
  const { data: teamsList = [] } = useTeams();

  // Mutations
  const changeStatusMutation = useChangeVehicleStatus();
  const removeTeamMutation = useRemoveVehicleFromTeam();
  const unassignDriverMutation = useUnassignDriver();
  const deleteMutation = useDeleteVehicle();

  // Modals
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected vehicle
  const vehicle = useMemo(() => {
    return vehicles.find((v) => v._id === vehicleId) || null;
  }, [vehicles, vehicleId]);

  // Team lookup
  const teamObj = useMemo(() => {
    const teamId = getVehicleTeamId(vehicle?.teamId);
    if (!teamId) return null;
    return teamsList.find((t) => t._id === teamId) || null;
  }, [teamsList, vehicle?.teamId]);

  const userName = user?.name || user?.email?.split('@')[0] || '';
  const isActive = vehicle?.status === 'active';

  // Action handlers
  const handleToggleStatus = useCallback(async () => {
    if (!vehicle) return;
    const newStatus = isActive ? 'inactive' : 'active';
    await changeStatusMutation.mutateAsync({ id: vehicle._id, status: newStatus });
  }, [vehicle, isActive, changeStatusMutation]);

  const handleRemoveTeam = useCallback(async () => {
    if (!vehicle) return;
    await removeTeamMutation.mutateAsync(vehicle._id);
  }, [vehicle, removeTeamMutation]);

  const handleUnassignDriver = useCallback(async () => {
    if (!vehicle) return;
    const driverId = getVehicleDriverId(vehicle.driverId);
    if (driverId) {
      await unassignDriverMutation.mutateAsync(driverId);
    }
  }, [vehicle, unassignDriverMutation]);

  const handleDelete = useCallback(async () => {
    if (!vehicle) return;
    await deleteMutation.mutateAsync(vehicle._id);
    setIsDeleteOpen(false);
    router.push('/vehicles');
  }, [vehicle, deleteMutation, router]);

  return {
    // Data
    vehicle,
    teamObj,
    isActive,

    // Query states
    isLoading,
    isError,
    error,

    // Modal states
    isAssignDriverOpen,
    setIsAssignDriverOpen,
    isAssignTeamOpen,
    setIsAssignTeamOpen,
    isDeleteOpen,
    setIsDeleteOpen,

    // Mutation pending states
    isChangingStatus: changeStatusMutation.isPending,
    isRemovingTeam: removeTeamMutation.isPending,
    isUnassigningDriver: unassignDriverMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Action handlers
    handleToggleStatus,
    handleRemoveTeam,
    handleUnassignDriver,
    handleDelete,

    // Auth & Navigation
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  };
}
