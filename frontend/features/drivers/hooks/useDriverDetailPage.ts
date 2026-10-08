'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTeams } from '@/features/teams';
import { useDriver, useDriverStats } from './useDrivers';
import {
  useChangeDriverStatus,
  useDeleteDriver,
  useAssignVehicleToDriver,
  useUnassignVehicleFromDriver,
  useRemoveDriverFromTeam,
} from './useDriverMutations';
import { getDriverDisplayName, getDriverTeamId } from '../utils/driverHelpers';
import type { DriverStatus } from '../types/driver.types';

export function useDriverDetailPage(driverId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'fuel' | 'audit'>('tasks');

  // Modals state
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Queries
  const {
    data: driver,
    isLoading: isLoadingDriver,
    isError: isDriverError,
    error: driverError,
    refetch: refetchDriver,
  } = useDriver(driverId);

  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useDriverStats(driverId);

  const { data: teamsList = [] } = useTeams();

  // Mutations
  const changeStatusMutation = useChangeDriverStatus();
  const deleteMutation = useDeleteDriver();
  const assignVehicleMutation = useAssignVehicleToDriver();
  const unassignVehicleMutation = useUnassignVehicleFromDriver();
  const removeTeamMutation = useRemoveDriverFromTeam();

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
    stats,
    displayName,
    isActive,
    teamObj,

    // Status
    isLoading: isLoadingDriver,
    isLoadingStats,
    isError: isDriverError,
    error: driverError,
    refetch: refetchDriver,

    // Tab state
    activeTab,
    setActiveTab,

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
