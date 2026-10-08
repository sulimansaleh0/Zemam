'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDebounce } from '@/shared/hooks';
import { useTeams } from '@/features/teams';
import { usePaginatedManagers, useAllManagers } from './useManagers';
import {
  useChangeManagerStatus,
  useDisableManager,
  useDeleteManager,
} from './useManagerMutations';
import type {
  FleetManager,
  ManagerFilterStatus,
  ManagerSortOrder,
  ManagersQueryParams,
} from '../types/manager.types';

// ============================================================
//  Modal State Type (Discriminated Union)
// ============================================================

export type ManagerModalState =
  | { type: 'closed' }
  | { type: 'create'; initialTeamId?: string }
  | { type: 'delete'; manager: FleetManager; teamName?: string }
  | { type: 'assign'; manager: FleetManager }
  | { type: 'detail'; manager: FleetManager };

// ============================================================
//  Page Hook — Orchestrates the Fleet Managers page
// ============================================================

const SORT_CYCLE: ManagerSortOrder[] = ['newest', 'oldest', 'name'];

export function useManagersPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  useEffect(() => {
    if (isFleetManager) {
      router.replace('/dashboard');
    }
  }, [isFleetManager, router]);

  const [menuOpen, setMenuOpen] = useState(false);

  // ── Filters & Search ───────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [statusFilter, setStatusFilter] = useState<ManagerFilterStatus>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<ManagerSortOrder>('newest');

  // ── Pagination ─────────────────────────────────────────────
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((status: ManagerFilterStatus) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleTeamFilterChange = useCallback((teamId: string) => {
    setTeamFilter(teamId);
    setPage(1);
  }, []);

  const toggleSort = useCallback(() => {
    setSortOrder((prev) => {
      const currentIndex = SORT_CYCLE.indexOf(prev);
      return SORT_CYCLE[(currentIndex + 1) % SORT_CYCLE.length];
    });
  }, []);

  // ── Modal State ────────────────────────────────────────────
  const [modalState, setModalState] = useState<ManagerModalState>({ type: 'closed' });

  // ── Server-side Paginated Query ────────────────────────────
  const queryParams: ManagersQueryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      withoutTeam: teamFilter === 'without_team' ? true : undefined,
      teamId: teamFilter !== 'all' && teamFilter !== 'without_team' ? teamFilter : undefined,
    }),
    [page, limit, debouncedSearch, statusFilter, teamFilter]
  );

  const paginatedQuery = usePaginatedManagers(queryParams);
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = paginatedQuery;

  const managersList = paginatedData?.fleetManagers ?? [];
  const pagination = paginatedData?.pagination;

  // Unpaginated full list for summary metrics
  const allManagersQuery = useAllManagers();
  const allManagers = allManagersQuery.data ?? [];

  // Teams list
  const { data: teamsList = [] } = useTeams();

  // ── Mutations ──────────────────────────────────────────────
  const changeStatusMutation = useChangeManagerStatus();
  const disableTeamMutation = useDisableManager();
  const deleteMutation = useDeleteManager();

  const userName = user?.name || user?.email?.split('@')[0] || '';

  // ── Modal Handlers ─────────────────────────────────────────
  const handleOpenAdd = useCallback((teamId?: string) => {
    setModalState({ type: 'create', initialTeamId: teamId });
  }, []);

  const handleOpenDelete = useCallback((manager: FleetManager, teamName?: string) => {
    setModalState({ type: 'delete', manager, teamName });
  }, []);

  const handleOpenAssign = useCallback((manager: FleetManager) => {
    setModalState({ type: 'assign', manager });
  }, []);

  const handleOpenDetail = useCallback((manager: FleetManager) => {
    setModalState({ type: 'detail', manager });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ type: 'closed' });
  }, []);

  // ── Action Handlers ────────────────────────────────────────
  const handleToggleStatus = useCallback(
    (manager: FleetManager) => {
      const currentActive = (manager.status || 'active').toLowerCase() === 'active';
      changeStatusMutation.mutate({
        managerId: manager._id,
        status: currentActive ? 'inactive' : 'active',
      });
    },
    [changeStatusMutation]
  );

  const handleDisableTeam = useCallback(
    (manager: FleetManager) => {
      disableTeamMutation.mutate(manager._id);
    },
    [disableTeamMutation]
  );

  return {
    // Auth & Layout
    isFleetManager,
    userName,
    menuOpen,
    setMenuOpen,
    logout,

    // Search, Filters & Sorting
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    debouncedSearch,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    teamFilter,
    setTeamFilter: handleTeamFilterChange,
    sortOrder,
    toggleSort,

    // Pagination
    page,
    setPage,
    limit,
    pagination,

    // Data
    managersList,
    allManagers,
    teamsList,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,

    // Modal state machine
    modalState,
    setModalState,
    handleOpenAdd,
    handleOpenDelete,
    handleOpenAssign,
    handleOpenDetail,
    handleCloseModal,

    // Actions
    handleToggleStatus,
    handleDisableTeam,
    deleteMutation,

    // Backward-compatibility properties
    isCreateModalOpen: modalState.type === 'create',
    setIsCreateModalOpen: (open: boolean) => {
      if (!open) handleCloseModal();
      else handleOpenAdd();
    },
    selectedManagerForDelete:
      modalState.type === 'delete' ? { manager: modalState.manager, teamName: modalState.teamName } : null,
    setSelectedManagerForDelete: (val: { manager: FleetManager; teamName?: string } | null) => {
      if (!val) handleCloseModal();
      else handleOpenDelete(val.manager, val.teamName);
    },
    selectedManagerForAssign: modalState.type === 'assign' ? modalState.manager : null,
    setSelectedManagerForAssign: (m: FleetManager | null) => {
      if (!m) handleCloseModal();
      else handleOpenAssign(m);
    },
    selectedManagerForDetail: modalState.type === 'detail' ? modalState.manager : null,
    setSelectedManagerForDetail: (m: FleetManager | null) => {
      if (!m) handleCloseModal();
      else handleOpenDetail(m);
    },
    selectedTeamIdForCreate: modalState.type === 'create' ? modalState.initialTeamId : undefined,
    setSelectedTeamIdForCreate: (id?: string) => {
      if (modalState.type === 'create') {
        setModalState({ type: 'create', initialTeamId: id });
      }
    },
  };
}
