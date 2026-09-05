import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { teamService } from '../services/team.service';
import { calculateTeamVehicleCounts } from '../utils/teamHelpers';
import { useDriversList, useRemoveDriverFromTeam, getDriverTeamId } from '@/features/drivers';
import { useVehicles, useRemoveVehicleFromTeam, getVehicleTeamId } from '@/features/vehicles';
import { useManagers, useDisableManager, type FleetManager } from '@/features/managers';
import { teamKeys, driverKeys, vehicleKeys, managerKeys } from '@/shared/constants/queryKeys';
import type { BackendDriver } from '@/features/drivers/types/driver.types';
import type { VehicleWithRelations } from '@/features/vehicles/types/vehicle.types';
import type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
} from '../types/team.types';

// ============================================================
//  Query Keys — إعادة تصدير من المصدر المركزي للتوافق الخلفي
// ============================================================

export const TEAM_QUERY_KEYS = teamKeys;

// ============================================================
//  Data Hooks
// ============================================================

/**
 * Hook to fetch all teams
 */
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: ({ signal }) => teamService.getTeams(signal),
  });
}

/**
 * Hook to fetch single team detail
 */
export function useTeamDetail(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: ({ signal }) => teamService.getTeamById(id, signal),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch team statics
 */
export function useTeamStatics(teamId?: string) {
  return useQuery({
    queryKey: teamKeys.statics(teamId),
    queryFn: ({ signal }) => teamService.getTeamStatics(teamId, signal),
    staleTime: 1000 * 30, // 30 seconds
  });
}

// ============================================================
//  Mutation Hooks
// ============================================================

/**
 * Hook to create a new team
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateTeamInput) => teamService.createTeam(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      addToast({
        type: 'success',
        title: 'تم إنشاء الفريق',
        message: 'تمت إضافة الفريق الجديد بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الإنشاء',
        message: err.message || 'تعذر إنشاء الفريق، حاول مرة أخرى',
      });
    },
  });
}

/**
 * Hook to update team name
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, payload }: { teamId: string; payload: UpdateTeamInput }) =>
      teamService.updateTeam(teamId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      addToast({
        type: 'success',
        title: 'تم التعديل',
        message: 'تم تحديث بيانات الفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في التعديل',
        message: err.message || 'تعذر تعديل بيانات الفريق',
      });
    },
  });
}

/**
 * Hook to delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
      addToast({
        type: 'success',
        title: 'تم الحذف',
        message: 'تم حذف الفريق بنجاح',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'خطأ في الحذف',
        message: err.message || 'تعذر حذف الفريق',
      });
    },
  });
}

// ============================================================
//  Page Hooks
// ============================================================

/**
 * Orchestrates the Teams listing page
 */
export function useTeamsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const {
    data: teamsList = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTeams();

  const { data: vehiclesList = [] } = useVehicles();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<Team | null>(null);
  const [selectedTeamForDelete, setSelectedTeamForDelete] = useState<Team | null>(null);

  // Fleet Manager Modal states
  const [isAssignManagerModalOpen, setIsAssignManagerModalOpen] = useState(false);
  const [isCreateManagerModalOpen, setIsCreateManagerModalOpen] = useState(false);
  const [selectedTeamForManager, setSelectedTeamForManager] = useState<Team | null>(null);
  const [selectedManagerForDelete, setSelectedManagerForDelete] = useState<{
    manager: FleetManager;
    teamName?: string;
  } | null>(null);

  // Add Resources Modal state
  const [selectedTeamForResources, setSelectedTeamForResources] = useState<Team | null>(null);

  const disableManagerMutation = useDisableManager();

  useEffect(() => {
    if (isFleetManager) {
      router.replace('/dashboard');
    }
  }, [isFleetManager, router]);

  const vehicleCounts = useMemo(() => {
    return calculateTeamVehicleCounts(vehiclesList);
  }, [vehiclesList]);

  const userName = user?.name || user?.email?.split('@')[0] || '';

  const handleOpenAdd = useCallback(() => setIsCreateModalOpen(true), []);
  const handleOpenEdit = useCallback((team: Team) => setSelectedTeamForEdit(team), []);
  const handleOpenDelete = useCallback((team: Team) => setSelectedTeamForDelete(team), []);

  const handleOpenAssignManager = useCallback((team: Team) => {
    setSelectedTeamForManager(team);
    setIsAssignManagerModalOpen(true);
  }, []);

  const handleOpenAddResources = useCallback((team: Team) => {
    setSelectedTeamForResources(team);
  }, []);

  const handleOpenRemoveManager = useCallback(async (managerId: string) => {
    try {
      await disableManagerMutation.mutateAsync(managerId);
    } catch {
      // Handled by toast
    }
  }, [disableManagerMutation]);

  return {
    // Auth
    isFleetManager,
    userName,
    companyName: user?.name || undefined,
    menuOpen,
    setMenuOpen,
    logout,

    // Data
    teamsList,
    vehiclesList,
    vehicleCounts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,

    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedTeamForEdit,
    setSelectedTeamForEdit,
    selectedTeamForDelete,
    setSelectedTeamForDelete,
    isAssignManagerModalOpen,
    setIsAssignManagerModalOpen,
    isCreateManagerModalOpen,
    setIsCreateManagerModalOpen,
    selectedTeamForManager,
    setSelectedTeamForManager,
    selectedManagerForDelete,
    setSelectedManagerForDelete,
    selectedTeamForResources,
    setSelectedTeamForResources,

    // Actions
    handleOpenAdd,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenAssignManager,
    handleOpenAddResources,
    handleOpenRemoveManager,
  };
}

/**
 * Orchestrates the Team Detail page
 */
export function useTeamDetailPage(teamId: string) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  // Team detail queries
  const { data: team, isLoading, isError, error } = useTeamDetail(teamId);
  const { data: statics } = useTeamStatics(teamId);

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
  const [isAssignManagerModalOpen, setIsAssignManagerModalOpen] = useState(false);
  const [isAddResourcesModalOpen, setIsAddResourcesModalOpen] = useState(false);

  useEffect(() => {
    if (isFleetManager) {
      router.replace('/dashboard');
    }
  }, [isFleetManager, router]);

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

  const handleRemoveDriver = useCallback(async (driverId: string) => {
    try {
      await removeDriverMutation.mutateAsync(driverId);
    } catch {
      // Handled by toast
    }
  }, [removeDriverMutation]);

  const handleRemoveVehicle = useCallback(async (vehicleId: string) => {
    try {
      await removeVehicleMutation.mutateAsync(vehicleId);
    } catch {
      // Handled by toast
    }
  }, [removeVehicleMutation]);

  const handleDisableManager = useCallback(async () => {
    if (!managerId) return;
    try {
      await disableManagerMutation.mutateAsync(managerId);
    } catch {
      // Handled by toast
    }
  }, [disableManagerMutation, managerId]);

  return {
    // Auth
    isFleetManager,
    userName,
    menuOpen,
    setMenuOpen,
    logout,

    // Data
    team,
    statics,
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
    isAssignManagerModalOpen,
    setIsAssignManagerModalOpen,
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
