'use client';

import React from 'react';
import { AlertCircle, FileDown, Loader2, Plus, RefreshCw, UsersRound } from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  DriverMetrics,
  DriversTable,
  DriverModal,
  DriverDeleteModal,
  AssignVehicleModal,
  AssignDriverToTeamModal,
  useDriversPage,
} from '@/features/drivers';
import { useTeams } from '@/features/teams';

export default function DriversPage() {
  const {
    // Data
    drivers,
    metrics,
    // Query state
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    // Mutations state
    isCreating,
    isDeleting,
    isAssigningVehicle,
    // UI state
    searchQuery,
    setSearchQuery,
    menuOpen,
    setMenuOpen,
    modal,
    setModal,
    // Handlers
    handleCreate,
    handleToggleStatus,
    handleDelete,
    handleAssignVehicle,
    handleUnassignVehicle,
    handleAssignTeam,
    handleUnassignTeam,
    handleExportCSV,
    // Auth
    userName,
    logout,
  } = useDriversPage();

  const { data: teamsList = [] } = useTeams();

  return (
    <main className="zamam-drivers zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        {/* ── Sidebar ── */}
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={userName}
          onLogout={logout}
        />

        {/* ── Mobile overlay ── */}
        {menuOpen && (
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ── Content ── */}
        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10 space-y-6">
            {/* ── Page Hero ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)] mb-1">
                  <UsersRound className="w-4 h-4" />
                  <span>مساحة التشغيل والكوادر</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  سجل السائقين والكوادر{' '}
                  {!isLoading && (
                    <span className="mr-1 font-manrope text-lg font-semibold text-[var(--primary)]">
                      {drivers.length}
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  متابعة أداء السائقين، فئات رخص القيادة والاعتماد، تعيين المركبات والفرق الميدانية
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching || isLoading}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  title="تحديث البيانات"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                  <span>تحديث</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={isLoading || drivers.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <FileDown className="w-4 h-4" />
                  <span>تصدير (CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ type: 'create' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سائق</span>
                </button>
              </div>
            </div>

            {/* ── Error State ── */}
            {isError && !isLoading && (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[var(--text)]">
                    تعذّر تحميل بيانات السائقين
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {error instanceof Error ? error.message : 'خطأ أثناء الاتصال بالخادم'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
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

                {/* Unified Full-Width Drivers Table */}
                <DriversTable
                  driversData={drivers}
                  teamsList={teamsList}
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
          </div>
        </div>
      </div>

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
    </main>
  );
}
