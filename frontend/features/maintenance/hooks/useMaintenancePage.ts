'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useVehicles } from '@/features/vehicles';
import { useDebounce } from '@/shared/hooks';
import { usePaginatedMaintenance, useMaintenanceStats } from './useMaintenance';
import type {
  MaintenanceRecordWithRelations,
  MaintenanceStatus,
  MaintenanceCategory,
  MaintenanceFilters,
} from '../types/maintenance.types';

/**
 * Hook لإدارة حالة وتفاعلات صفحة سجلات الصيانة مع ترقيم خادمي وبحث سريع
 */
export function useMaintenancePage() {
  const { user, logout } = useAuth();
  const vehiclesQuery = useVehicles();

  const [activeTab, setActiveTab] = useState<'all' | MaintenanceStatus>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | MaintenanceCategory>('all');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] =
    useState<MaintenanceRecordWithRelations | null>(null);
  const [selectedRecordForVerify, setSelectedRecordForVerify] =
    useState<MaintenanceRecordWithRelations | null>(null);

  // Debounced search term for server query
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Event handlers with automatic page reset to prevent cascading render warnings
  const handleTabChange = (tab: 'all' | MaintenanceStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleCategoryChange = (cat: 'all' | MaintenanceCategory) => {
    setActiveCategory(cat);
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

  const filters: MaintenanceFilters = useMemo(
    () => ({
      status: activeTab,
      category: activeCategory,
      vehicleId: selectedVehicleId !== 'all' ? selectedVehicleId : undefined,
      search: debouncedSearch.trim() || undefined,
      page,
      limit,
    }),
    [activeTab, activeCategory, selectedVehicleId, debouncedSearch, page, limit]
  );

  const maintenanceQuery = usePaginatedMaintenance(filters);
  const statsQuery = useMaintenanceStats();

  return {
    records: maintenanceQuery.data?.records ?? [],
    pagination: maintenanceQuery.data?.pagination,
    isLoading: maintenanceQuery.isLoading,
    isError: maintenanceQuery.isError || statsQuery.isError,
    error: maintenanceQuery.error || statsQuery.error,
    refetch: () => {
      maintenanceQuery.refetch();
      statsQuery.refetch();
    },
    isRefetching: maintenanceQuery.isRefetching || statsQuery.isRefetching,

    stats: statsQuery.data ?? {
      totalRecords: 0,
      totalCost: 0,
      pending: 0,
      approved: 0,
      declined: 0,
    },

    activeTab,
    handleTabChange,
    activeCategory,
    handleCategoryChange,
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
