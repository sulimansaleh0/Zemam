'use client';

import React from 'react';
import { FileDown, Loader2, UsersRound } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import { useDriversPage } from '../hooks/useDriversPage';
import { DriverMetrics } from './DriverMetrics';
import { DriversTable } from './DriversTable';
import { DriverModal } from './DriverModal';
import { DriverDeleteModal } from './DriverDeleteModal';
import { AssignVehicleModal } from './AssignVehicleModal';
import { AssignDriverToTeamModal } from './AssignDriverToTeamModal';

export function DriversView() {
  const {
    // Data
    drivers,
    allDrivers,
    teamsList,
    pagination,
    metrics,

    // Query state
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,

    // Pagination
    page,
    setPage,

    // Filters & Search
    searchQuery,
    handleSearchQueryChange,
    statusFilter,
    handleStatusFilterChange,
    licenseFilter,
    handleLicenseFilterChange,
    teamFilter,
    handleTeamFilterChange,

    // Modal
    modal,
    setModal,

    // Mutation states
    isCreating,
    isDeleting,
    isAssigningVehicle,

    // Handlers
    handleCreate,
    handleToggleStatus,
    handleDelete,
    handleAssignVehicle,
    handleUnassignVehicle,
    handleAssignTeam,
    handleUnassignTeam,
    handleExportCSV,
  } = useDriversPage();

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── ترويسة الصفحة ── */}
      <PageHeader
        title="سجل السائقين والكوادر"
        count={pagination?.total ?? (allDrivers.length > 0 ? allDrivers.length : drivers.length)}
        description="متابعة أداء السائقين، فئات رخص القيادة والاعتماد، تعيين المركبات والفرق الميدانية"
        icon={UsersRound}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel="إضافة سائق"
        onAction={() => setModal({ type: 'create' })}
        extraActions={
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isLoading || (allDrivers.length === 0 && drivers.length === 0)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>تصدير (CSV)</span>
          </button>
        }
      />

      {/* ── حالة الخطأ ── */}
      {isError && !isLoading && (
        <ErrorAlert
          title="تعذّر تحميل بيانات السائقين"
          error={error}
          onRetry={() => refetch()}
        />
      )}

            {/* ── Loading Skeleton ── */}
            {isLoading && (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-[var(--muted)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                <p className="text-xs">جارٍ تحميل كادر السائقين...</p>
              </div>
            )}

            {/* ── Main Content ── */}
            {!isLoading && !isError && (
              <>
                {/* Stats Cards */}
                <DriverMetrics metrics={metrics} />

                {/* Unified Full-Width Drivers Table with Server-side Pagination & Filters */}
                <DriversTable
                  driversData={drivers}
                  teamsList={teamsList}
                  pagination={pagination}
                  currentPage={page}
                  onPageChange={setPage}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchQueryChange}
                  statusFilter={statusFilter}
                  onStatusFilterChange={handleStatusFilterChange}
                  licenseFilter={licenseFilter}
                  onLicenseFilterChange={handleLicenseFilterChange}
                  teamFilter={teamFilter}
                  onTeamFilterChange={handleTeamFilterChange}
                  isLoadingDrivers={isLoading}
                  onAddDriverClick={() => setModal({ type: 'create' })}
                  onToggleStatusClick={handleToggleStatus}
                  onDeleteDriverClick={(driver) => setModal({ type: 'delete', driver })}
                  onAssignVehicleClick={(driver) => setModal({ type: 'assign-vehicle', driver })}
                  onUnassignVehicleClick={handleUnassignVehicle}
                  onAssignTeamClick={handleAssignTeam}
                  onUnassignTeamClick={handleUnassignTeam}
                />
              </>
            )}

            {/* ── Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-[10px] text-[var(--muted)] transition-colors">
              <span>زمام لإدارة الأساطيل · إدارة السائقين والعمليات اللوجستية</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                البيانات متصلة مباشرة بالخادم
              </span>
            </footer>

      {/* ── Create Driver Modal ── */}
      {modal.type === 'create' && (
        <DriverModal
          onClose={() => setModal({ type: 'closed' })}
          onSave={handleCreate}
          isLoading={isCreating}
        />
      )}

      {/* ── Delete Driver Modal ── */}
      {modal.type === 'delete' && (
        <DriverDeleteModal
          driver={modal.driver}
          onClose={() => setModal({ type: 'closed' })}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      )}

      {/* ── Assign Vehicle Modal ── */}
      {modal.type === 'assign-vehicle' && (
        <AssignVehicleModal
          driver={modal.driver}
          onClose={() => setModal({ type: 'closed' })}
          onAssign={handleAssignVehicle}
          isLoading={isAssigningVehicle}
        />
      )}

      {/* ── Assign Driver To Team Modal ── */}
      {modal.type === 'assign-team' && (
        <AssignDriverToTeamModal
          isOpen={true}
          driver={modal.driver}
          onClose={() => setModal({ type: 'closed' })}
        />
      )}
    </div>
  );
}
