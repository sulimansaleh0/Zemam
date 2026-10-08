'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDebounce } from '@/shared/hooks';
import { usePaginatedTeams, useTeams } from './useTeams';
import { calculateTeamDriverCounts, calculateTeamVehicleCounts } from '../utils/teamHelpers';
import { useDriversList } from '@/features/drivers';
import { useVehicles } from '@/features/vehicles';
import { useDisableManager, type FleetManager } from '@/features/managers';
import type { Team, TeamFilterStatus } from '../types/team.types';

/**
 * Orchestrates the Teams listing page with Server-Side Pagination, Debounced Search, and Modal states
 */
export function useTeamsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  // Server-side pagination & filter states
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery.trim(), 350);
  const [managerFilter, setManagerFilter] = useState<TeamFilterStatus>('all');

  // Handle search query change and reset to page 1
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Handle manager filter change
  const handleManagerFilterChange = useCallback((newFilter: TeamFilterStatus) => {
    setManagerFilter(newFilter);
    setPage(1);
  }, []);

  // Query: Paginated Teams from Backend
  const {
    data: queryResult,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePaginatedTeams({
    page,
    limit,
    search: debouncedSearch || undefined,
    managerFilter: managerFilter === 'all' ? undefined : managerFilter,
  });

  const teamsList = queryResult?.teams ?? [];
  const pagination = queryResult?.pagination;

  // Unpaginated queries for overview metrics and counts
  const { data: allTeams = [] } = useTeams();
  const { data: vehiclesList = [] } = useVehicles();
  const { data: driversList = [] } = useDriversList();

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
      if (user?.teamId) {
        router.replace(`/teams/${user.teamId}`);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isFleetManager, user?.teamId, router]);

  const vehicleCounts = useMemo(() => {
    return calculateTeamVehicleCounts(vehiclesList);
  }, [vehiclesList]);

  const driverCounts = useMemo(() => {
    return calculateTeamDriverCounts(driversList);
  }, [driversList]);

  const userName = useMemo(() => {
    return user?.name || user?.email?.split('@')[0] || '';
  }, [user]);

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

  const handleOpenRemoveManager = useCallback(
    async (managerId: string) => {
      try {
        await disableManagerMutation.mutateAsync(managerId);
      } catch {
        // Handled by toast inside mutation
      }
    },
    [disableManagerMutation]
  );

  return {
    // Auth
    isFleetManager,
    userName,
    companyName: user?.name || undefined,
    menuOpen,
    setMenuOpen,
    logout,

    // Data & Pagination
    teamsList,
    allTeams,
    pagination,
    page,
    setPage,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    managerFilter,
    setManagerFilter: handleManagerFilterChange,
    vehiclesList,
    vehicleCounts,
    driverCounts,
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
