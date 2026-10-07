'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicleDetail, useVehicleStats } from './useVehicles';
import {
  useUpdateVehicle,
  useChangeVehicleStatus,
  useRemoveVehicleFromTeam,
  useUnassignDriver,
} from './useVehicleMutations';
import { getVehicleDriverId } from '../utils/vehicleHelpers';
import type { UpdateVehicleInput, TeamSummary } from '../types/vehicle.types';

export function useVehicleDetailPage(vehicleId: string) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Queries
  const {
    data: vehicle,
    isLoading,
    isError,
    error,
    refetch,
  } = useVehicleDetail(vehicleId);

  const {
    data: vehicleStats,
    isLoading: isLoadingStats,
  } = useVehicleStats(vehicleId);

  // Mutations
  const updateMutation = useUpdateVehicle();
  const statusMutation = useChangeVehicleStatus();
  const removeTeamMutation = useRemoveVehicleFromTeam();
  const unassignDriverMutation = useUnassignDriver();

  // Modals state
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const userName = useMemo(() => {
    return user?.name || user?.email?.split('@')[0] || 'المستخدم';
  }, [user]);

  const teamObj: TeamSummary | null =
    vehicle?.teamId && typeof vehicle.teamId === 'object'
      ? (vehicle.teamId as TeamSummary)
      : null;

  const isActive = vehicle?.status === 'active';

  const handleToggleStatus = useCallback(async () => {
    if (!vehicle) return;
    const nextStatus = vehicle.status === 'active' ? 'inactive' : 'active';
    await statusMutation.mutateAsync({ id: vehicle._id, status: nextStatus });
  }, [vehicle, statusMutation]);

  const handleUpdateVehicle = useCallback(
    async (data: UpdateVehicleInput) => {
      if (!vehicle) return;
      await updateMutation.mutateAsync({ id: vehicle._id, data });
    },
    [vehicle, updateMutation]
  );

  const handleRemoveTeam = useCallback(async () => {
    if (!vehicle) return;
    await removeTeamMutation.mutateAsync(vehicle._id);
  }, [vehicle, removeTeamMutation]);

  const handleUnassignDriver = useCallback(async () => {
    if (!vehicle) return;
    const driverId = getVehicleDriverId(vehicle.driverId);
    if (!driverId) return;
    await unassignDriverMutation.mutateAsync(driverId);
  }, [vehicle, unassignDriverMutation]);

  return {
    vehicle,
    teamObj,
    isActive,
    vehicleStats,
    isLoadingStats,
    isLoading,
    isError,
    error,
    refetch,
    isAssignDriverOpen,
    setIsAssignDriverOpen,
    isAssignTeamOpen,
    setIsAssignTeamOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    isUpdating: updateMutation.isPending,
    isChangingStatus: statusMutation.isPending,
    isRemovingTeam: removeTeamMutation.isPending,
    isUnassigningDriver: unassignDriverMutation.isPending,
    handleToggleStatus,
    handleUpdateVehicle,
    handleRemoveTeam,
    handleUnassignDriver,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  };
}
