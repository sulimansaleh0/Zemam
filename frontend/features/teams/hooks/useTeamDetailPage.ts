'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTeamDetail, useTeamStatics } from './useTeams';
import { useDriversList, useRemoveDriverFromTeam, getDriverTeamId } from '@/features/drivers';
import { useVehicles, useRemoveVehicleFromTeam, getVehicleTeamId } from '@/features/vehicles';
import { useManagers, useDisableManager } from '@/features/managers';
import type { BackendDriver } from '@/features/drivers/types/driver.types';
import type { VehicleWithRelations } from '@/features/vehicles/types/vehicle.types';

/**
 * Orchestrates the Team Detail page state, metrics, and actions
 */
export function useTeamDetailPage(teamId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  // Team detail queries
  const { data: team, isLoading, isError, error } = useTeamDetail(teamId);
  const {
    data: statics,
    isError: isStaticsError,
    error: staticsError,
  } = useTeamStatics(teamId);

  // Related data
  const { data: allDrivers = [] } = useDriversList();
  const { data: allVehicles = [] } = useVehicles();
  const { data: allManagers = [] } = useManagers();

  const disableManagerMutation = useDisableManager();
  const removeDriverMutation = useRemoveDriverFromTeam();
  const removeVehicleMutation = useRemoveVehicleFromTeam();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddResourcesModalOpen, setIsAddResourcesModalOpen] = useState(false);

  useEffect(() => {
    if (isFleetManager) {
      const userTeamId = user?.teamId ? String(user.teamId) : null;
      // Allow Fleet Manager to view their own assigned team, redirect only if mismatched
      if (!userTeamId || userTeamId !== String(teamId)) {
        router.replace('/dashboard');
      }
    }
  }, [isFleetManager, user?.teamId, teamId, router]);

  const teamDrivers = useMemo(() => {
    return allDrivers.filter((d: BackendDriver) => {
      const dTeamId = getDriverTeamId(d.teamId);
      return String(dTeamId) === String(teamId);
    });
  }, [allDrivers, teamId]);

  const teamVehicles = useMemo(() => {
    return allVehicles.filter((v: VehicleWithRelations) => {
      const vTeamId = getVehicleTeamId(v.teamId);
      return String(vTeamId) === String(teamId);
    });
  }, [allVehicles, teamId]);

  const managerId =
    typeof team?.managerId === 'object' && team?.managerId !== null
      ? team.managerId._id
      : typeof team?.managerId === 'string'
      ? team.managerId
      : null;

  const managerObj = useMemo(() => {
    if (!managerId) return null;
    return allManagers.find((m) => m._id === managerId) || null;
  }, [allManagers, managerId]);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  const handleRemoveDriver = useCallback(
    async (driverId: string) => {
      try {
        await removeDriverMutation.mutateAsync(driverId);
      } catch {
        // Handled by toast inside mutation
      }
    },
    [removeDriverMutation]
  );

  const handleRemoveVehicle = useCallback(
    async (vehicleId: string) => {
      try {
        await removeVehicleMutation.mutateAsync(vehicleId);
      } catch {
        // Handled by toast inside mutation
      }
    },
    [removeVehicleMutation]
  );

  const handleDisableManager = useCallback(async () => {
    if (!managerId) return;
    try {
      await disableManagerMutation.mutateAsync(managerId);
    } catch {
      // Handled by toast inside mutation
    }
  }, [disableManagerMutation, managerId]);

  return {
    // Auth
    user,
    isFleetManager,
    userName,
    menuOpen,
    setMenuOpen,
    logout,

    // Data
    team,
    statics,
    isStaticsError,
    staticsError,
    teamDrivers,
    teamVehicles,
    managerId,
    managerObj,
    isLoading,
    isError,
    error,

    // Modals
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isAddResourcesModalOpen,
    setIsAddResourcesModalOpen,

    // Pending states
    isDisablingManager: disableManagerMutation.isPending,

    // Actions
    handleRemoveDriver,
    handleRemoveVehicle,
    handleDisableManager,
  };
}
