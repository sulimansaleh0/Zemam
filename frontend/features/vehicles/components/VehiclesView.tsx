'use client';

import React from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import { useVehiclesPage } from '../hooks/useVehiclesPage';
import { VehiclesTable } from './VehiclesTable';
import { VehicleStatsCards } from './VehicleStatsCards';
import { VehicleFormModal } from './VehicleFormModal';
import { AssignDriverModal } from './AssignDriverModal';
import { AssignVehicleToTeamModal } from './AssignVehicleToTeamModal';
import { ToggleVehicleStatusModal } from './ToggleVehicleStatusModal';
import { ConfirmDeleteVehicleModal } from './ConfirmDeleteVehicleModal';
import { EditVehicleModal } from './EditVehicleModal';

export function VehiclesView() {
  const {
    vehiclesList,
    pagination,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
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
    isUpdatingVehicle,
  } = useVehiclesPage();

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── ترويسة الصفحة ── */}
      <PageHeader
        title="سجل المركبات والأسطول"
        count={pagination?.total ?? vehiclesList.length}
        description="عرض وتتبع كامل لمركبات الأسطول، حالتها التشغيلية، وتعيينات السائقين"
        icon={Truck}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel="إضافة مركبة"
        onAction={() => setIsAddVehicleModalOpen(true)}
      />

      {/* ── حالة الخطأ ── */}
      {isError && !isLoading && (
        <ErrorAlert
          title="تعذّر تحميل بيانات المركبات"
          error={error}
          onRetry={() => refetch()}
        />
      )}

            {/* ── Loading Skeleton ── */}
            {isLoading && (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-[var(--muted)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                <p className="text-xs">جارٍ تحميل بيانات أسطول المركبات...</p>
              </div>
            )}

            {/* ── Main Content ── */}
            {!isLoading && !isError && (
              <>
                {/* Stats Cards */}
                <VehicleStatsCards vehicles={vehiclesList} />

                {/* Vehicles Table */}
                <VehiclesTable
                  vehiclesData={vehiclesList}
                  pagination={pagination}
                  currentPage={page}
                  onPageChange={setPage}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  isLoadingVehicles={isLoading}
                  onAddVehicleClick={() => setIsAddVehicleModalOpen(true)}
                  onAssignDriverClick={(vehicle) => setSelectedVehicleForAssign(vehicle)}
                  onChangeStatusClick={(vehicle) => setSelectedVehicleForStatusChange(vehicle)}
                  onAssignTeamClick={(vehicle) => setSelectedVehicleForTeam(vehicle)}
                  onRemoveTeamClick={handleRemoveTeam}
                  onUnassignDriverClick={handleUnassignDriver}
                  onDeleteVehicleClick={(vehicle) => setSelectedVehicleForDelete(vehicle)}
                  onEditVehicleClick={(vehicle) => setSelectedVehicleForEdit(vehicle)}
                />
              </>
            )}

            {/* ── Page Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-[10px] text-[var(--muted)] transition-colors">
              <span>زمام لإدارة الأساطيل والعمليات اللوجستية</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                البيانات متصلة مباشرة بالخادم
              </span>
            </footer>

      {/* ── Add Vehicle Modal ── */}
      <VehicleFormModal
        isOpen={isAddVehicleModalOpen}
        onClose={() => setIsAddVehicleModalOpen(false)}
      />

      {/* ── Assign Driver Modal ── */}
      <AssignDriverModal
        isOpen={Boolean(selectedVehicleForAssign)}
        onClose={() => setSelectedVehicleForAssign(null)}
        targetVehicle={selectedVehicleForAssign}
      />

      {/* ── Assign Vehicle to Team Modal ── */}
      <AssignVehicleToTeamModal
        isOpen={Boolean(selectedVehicleForTeam)}
        onClose={() => setSelectedVehicleForTeam(null)}
        vehicle={selectedVehicleForTeam}
      />

      {/* ── Toggle Vehicle Status Modal ── */}
      <ToggleVehicleStatusModal
        isOpen={Boolean(selectedVehicleForStatusChange)}
        onClose={() => setSelectedVehicleForStatusChange(null)}
        targetVehicle={selectedVehicleForStatusChange}
      />

      {/* ── Confirm Delete Vehicle Modal ── */}
      <ConfirmDeleteVehicleModal
        isOpen={Boolean(selectedVehicleForDelete)}
        onClose={() => setSelectedVehicleForDelete(null)}
        targetVehicle={selectedVehicleForDelete}
      />

      {/* ── Edit Vehicle Specs & License Modal ── */}
      <EditVehicleModal
        isOpen={Boolean(selectedVehicleForEdit)}
        onClose={() => setSelectedVehicleForEdit(null)}
        vehicle={selectedVehicleForEdit}
        onUpdate={handleUpdateVehicle}
        isLoading={isUpdatingVehicle}
      />
    </div>
  );
}
