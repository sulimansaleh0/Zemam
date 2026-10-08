'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/shared/ui/Toast';
import { useDebounce } from '@/shared/hooks';
import { usePaginatedDrivers, useDrivers } from './useDrivers';
import {
  useCreateDriver,
  useChangeDriverStatus,
  useDeleteDriver,
  useAssignVehicleToDriver,
  useUnassignVehicleFromDriver,
  useAssignDriverToTeam,
  useRemoveDriverFromTeam,
} from './useDriverMutations';
import { useTeams } from '@/features/teams';
import { exportDriversCSV } from '../utils/driverHelpers';
import type {
  Driver,
  DriverStatus,
  DriverStatusFilter,
  DriverSortOrder,
  CreateDriverInput,
} from '../types/driver.types';

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

  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  // ── UI Filter & Search State ─────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [statusFilter, setStatusFilter] = useState<DriverStatusFilter>('all');
  const [licenseFilter, setLicenseFilter] = useState<'all' | 'normal' | 'van' | 'truck'>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<DriverSortOrder>('newest');

  // ── Pagination State ─────────────────────────────────────
  const [page, setPage] = useState<number>(1);
  const limit = 8;

  // Handle search query change and reset to page 1
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Handle status filter change and reset to page 1
  const handleStatusFilterChange = useCallback((newStatus: DriverStatusFilter) => {
    setStatusFilter(newStatus);
    setPage(1);
  }, []);

  // Handle license filter change and reset to page 1
  const handleLicenseFilterChange = useCallback((newLicense: 'all' | 'normal' | 'van' | 'truck') => {
    setLicenseFilter(newLicense);
    setPage(1);
  }, []);

  // Handle team filter change and reset to page 1
  const handleTeamFilterChange = useCallback((newTeam: string) => {
    setTeamFilter(newTeam);
    setPage(1);
  }, []);

  // ── Shell & Modal State ──────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: 'closed' });

  // ── Query Parameters for Server-side Filtering ───────────
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      licenseType: licenseFilter !== 'all' ? licenseFilter : undefined,
      withoutTeam: teamFilter === 'without_team' ? true : undefined,
    };
  }, [page, limit, debouncedSearch, statusFilter, licenseFilter, teamFilter]);

  // ── Server-Side Paginated Query ──────────────────────────
  const paginatedQuery = usePaginatedDrivers(queryParams);
  const { drivers = [], pagination } = paginatedQuery.data ?? { drivers: [], pagination: undefined };

  // Total drivers query for overview metrics cards
  const allDriversQuery = useDrivers();
  const allDrivers = useMemo(() => allDriversQuery.data ?? [], [allDriversQuery.data]);

  // Teams list for filter selector and row labels
  const { data: teamsList = [] } = useTeams();

  // ── Mutations ────────────────────────────────────────────
  const createMutation = useCreateDriver();
  const changeStatusMutation = useChangeDriverStatus();
  const deleteMutation = useDeleteDriver();
  const assignVehicleMutation = useAssignVehicleToDriver();
  const unassignVehicleMutation = useUnassignVehicleFromDriver();
  const assignTeamMutation = useAssignDriverToTeam();
  const removeTeamMutation = useRemoveDriverFromTeam();

  // ── Computed Metrics ─────────────────────────────────────
  const metrics = useMemo(() => {
    const list = allDrivers.length > 0 ? allDrivers : drivers;
    const total = pagination?.total ?? list.length;
    const active = list.filter((d) => d.status === 'active').length;
    const inactive = list.filter((d) => d.status === 'inactive').length;
    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [allDrivers, drivers, pagination?.total]);

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
    const listToExport = allDrivers.length > 0 ? allDrivers : drivers;
    if (listToExport.length === 0) {
      addToast({ type: 'warning', message: 'لا توجد بيانات سائقين للتصدير' });
      return;
    }
    exportDriversCSV(listToExport);
    addToast({
      type: 'success',
      title: 'تم التصدير',
      message: 'تم تصدير بيانات السائقين بصيغة CSV',
    });
  }, [allDrivers, drivers, addToast]);

  return {
    // Auth & Role
    user,
    isFleetManager,
    userName,
    logout,

    // Data
    drivers,
    allDrivers,
    teamsList,
    pagination,
    metrics,

    // Query state
    isLoading: paginatedQuery.isLoading,
    isError: paginatedQuery.isError,
    error: paginatedQuery.error,
    refetch: paginatedQuery.refetch,
    isRefetching: paginatedQuery.isRefetching,

    // Pagination
    page,
    setPage,

    // Filter & Search
    searchQuery,
    setSearchQuery,
    handleSearchQueryChange,
    statusFilter,
    setStatusFilter,
    handleStatusFilterChange,
    licenseFilter,
    setLicenseFilter,
    handleLicenseFilterChange,
    teamFilter,
    setTeamFilter,
    handleTeamFilterChange,
    sortOrder,
    setSortOrder,

    // Shell & Modal
    menuOpen,
    setMenuOpen,
    modal,
    setModal,

    // Pending states
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending,
    isAssigningVehicle: assignVehicleMutation.isPending,
    isUnassigningVehicle: unassignVehicleMutation.isPending,
    isAssigningTeam: assignTeamMutation.isPending,
    isRemovingTeam: removeTeamMutation.isPending,

    // Action Handlers
    handleCreate,
    handleToggleStatus,
    handleDelete,
    handleAssignVehicle,
    handleUnassignVehicle,
    handleAssignTeam,
    handleUnassignTeam,
    handleExportCSV,
  };
}
