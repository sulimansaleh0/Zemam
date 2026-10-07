'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDebounce } from '@/shared/hooks';
import { usePaginatedVehicles } from './useVehicles';
import {
  useRemoveVehicleFromTeam,
  useUnassignDriver,
  useUpdateVehicle,
} from './useVehicleMutations';
import { getVehicleTeamId, getVehicleDriverId } from '../utils/vehicleHelpers';
import type { VehicleWithRelations, UpdateVehicleInput, VehicleStatus } from '../types/vehicle.types';

export function useVehiclesPage() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Server-side pagination & filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery.trim(), 350);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string | 'all'>('all');

  // Handle search query change and reset to page 1
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((newStatus: VehicleStatus | 'all') => {
    setStatusFilter(newStatus);
    setPage(1);
  }, []);

  // Handle vehicle type filter change
  const handleVehicleTypeFilterChange = useCallback((newType: string | 'all') => {
    setVehicleTypeFilter(newType);
    setPage(1);
  }, []);

  // Queries (Server-side Paginated)
  const {
    data: queryResult,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePaginatedVehicles({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    vehicleType: vehicleTypeFilter === 'all' ? undefined : vehicleTypeFilter,
  });

  const vehiclesList = queryResult?.vehicles ?? [];
  const pagination = queryResult?.pagination;

  // Mutations
  const removeTeamMutation = useRemoveVehicleFromTeam();
  const unassignDriverMutation = useUnassignDriver();
  const updateVehicleMutation = useUpdateVehicle();

  // Modals state
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
  const [selectedVehicleForAssign, setSelectedVehicleForAssign] = useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForStatusChange, setSelectedVehicleForStatusChange] = useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForTeam, setSelectedVehicleForTeam] = useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete] = useState<VehicleWithRelations | null>(null);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<VehicleWithRelations | null>(null);

  const userName = useMemo(() => {
    return user?.name || user?.email?.split('@')[0] || 'المستخدم';
  }, [user]);

  const handleRemoveTeam = useCallback(
    async (vehicle: VehicleWithRelations) => {
      const teamId = getVehicleTeamId(vehicle);
      if (!teamId) return;
      await removeTeamMutation.mutateAsync(vehicle._id);
    },
    [removeTeamMutation]
  );

  const handleUnassignDriver = useCallback(
    async (vehicle: VehicleWithRelations) => {
      const driverId = getVehicleDriverId(vehicle.driverId);
      if (!driverId) return;
      await unassignDriverMutation.mutateAsync(driverId);
    },
    [unassignDriverMutation]
  );

  const handleUpdateVehicle = useCallback(
    async (vId: string, updatedData: UpdateVehicleInput) => {
      await updateVehicleMutation.mutateAsync({ id: vId, data: updatedData });
      setSelectedVehicleForEdit(null);
    },
    [updateVehicleMutation]
  );

  return {
    vehiclesList,
    pagination,
    page,
    setPage,
    limit,
    setLimit,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    vehicleTypeFilter,
    setVehicleTypeFilter: handleVehicleTypeFilterChange,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
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
    selectedVehicleForEdit,
    setSelectedVehicleForEdit,
    handleRemoveTeam,
    handleUnassignDriver,
    handleUpdateVehicle,
    isUpdatingVehicle: updateVehicleMutation.isPending,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  };
}
