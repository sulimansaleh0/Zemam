'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';
import { useDebounce } from '@/shared/hooks';
import { usePaginatedFuel, useFuelStats } from './useFuel';
import type {
  FuelRecordWithRelations,
  FuelStatus,
  FuelFilters,
} from '../types/fuel.types';

/**
 * Hook لإدارة حالة وتفاعلات صفحة سجلات الوقود
 */
export function useFuelPage() {
  const { user, logout } = useAuth();
  const vehiclesQuery = useVehicles();

  const [activeTab, setActiveTab] = useState<'all' | FuelStatus>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] =
    useState<FuelRecordWithRelations | null>(null);
  const [selectedRecordForVerify, setSelectedRecordForVerify] =
    useState<FuelRecordWithRelations | null>(null);

  // Debounced search term for server query
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Event handlers with automatic page reset to prevent cascading render warnings
  const handleTabChange = (tab: 'all' | FuelStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const filters: FuelFilters = useMemo(
    () => ({
      status: activeTab,
      vehicleId: selectedVehicleId !== 'all' ? selectedVehicleId : undefined,
      search: debouncedSearch.trim() || undefined,
      page,
      limit,
    }),
    [activeTab, selectedVehicleId, debouncedSearch, page, limit]
  );

  const fuelQuery = usePaginatedFuel(filters);
  const statsQuery = useFuelStats(
    selectedVehicleId !== 'all' ? selectedVehicleId : undefined
  );

  return {
    records: fuelQuery.data?.records ?? [],
    pagination: fuelQuery.data?.pagination,
    isLoading: fuelQuery.isLoading,
    isError: fuelQuery.isError || statsQuery.isError,
    error: fuelQuery.error || statsQuery.error,
    refetch: () => {
      fuelQuery.refetch();
      statsQuery.refetch();
    },
    isRefetching: fuelQuery.isRefetching || statsQuery.isRefetching,

    stats: statsQuery.data ?? {
      totalRecords: 0,
      totalCost: 0,
      totalQty: 0,
      pending: 0,
      approved: 0,
      declined: 0,
      averageEfficiency: 0,
      fuelBalanceLitres: 0,
    },

    activeTab,
    handleTabChange,
    selectedVehicleId,
    handleVehicleChange,
    searchQuery,
    handleSearchChange,
    page,
    handlePageChange,

    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedRecordForDetails,
    setSelectedRecordForDetails,
    selectedRecordForVerify,
    setSelectedRecordForVerify,

    vehicles: vehiclesQuery.data ?? [],
    isLoadingVehicles: vehiclesQuery.isLoading,

    userName: user?.name || user?.email || 'المستخدم',
    logout,
  };
}
