'use client';

import { AlertCircle, FileDown, Loader2, Plus, RefreshCw, UsersRound } from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  DetailPanel,
  DriverDeleteModal,
  DriverMetrics,
  DriverModal,
  AssignVehicleModal,
  DriversList,
  useDriversPage,
} from '@/features/drivers';

export default function DriversPage() {
  const {
    // Data
    drivers,
    filteredDrivers,
    selectedDriver,
    metrics,
    // Query state
    isLoading,
    isError,
    error,
    // Mutations state
    isCreating,
    isDeleting,
    isChangingStatus,
    isAssigningVehicle,
    isUnassigningVehicle,
    // UI state
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
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
    handleExportCSV,
    // Auth
    userName,
    logout,
  } = useDriversPage();

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

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {/* ── Page Hero ── */}
            <section className="zd-rise mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] text-[var(--zd-muted)]">
                  <UsersRound className="h-3.5 w-3.5" /> مساحة التشغيل
                  <span className="opacity-40">/</span> إدارة السائقين
                </div>
                <h1 className="text-[26px] font-bold tracking-[-.04em] text-[var(--zd-text)] sm:text-[32px]">
                  السائقون{' '}
                  {!isLoading && (
                    <span className="mr-1 font-manrope text-[18px] font-semibold text-[var(--zd-blue)]">
                      {drivers.length}
                    </span>
                  )}
                </h1>
                <p className="mt-1 max-w-[560px] text-[12px] leading-6 text-[var(--zd-muted)]">
                  تابع فريق السائقين، راقب حالة كل حساب، وأضف أعضاء جدد بسرعة.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={isLoading || drivers.length === 0}
                  className="zd-focus flex items-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-4 py-2.5 text-[11px] font-semibold text-[var(--zd-text)] shadow-xs transition-colors hover:border-[var(--zd-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileDown className="h-4 w-4" /> تصدير (CSV)
                </button>
                <button
                  onClick={() => setModal({ type: 'create' })}
                  className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2.5 text-[11px] font-semibold text-white shadow-[0_9px_22px_rgba(37,99,235,.2)] transition-opacity hover:opacity-95"
                >
                  <Plus className="h-4 w-4" /> إضافة سائق
                </button>
              </div>
            </section>

            {/* ── Loading State ── */}
            {isLoading && (
              <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-[var(--zd-muted)]">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--zd-blue)]" />
                <p className="text-[12px]">جارٍ تحميل بيانات السائقين...</p>
              </div>
            )}

            {/* ── Error State ── */}
            {isError && !isLoading && (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--zd-red)]/25 bg-[var(--zd-red)]/5 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--zd-red)]/10 text-[var(--zd-red)]">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[var(--zd-text)]">
                    تعذّر تحميل السائقين
                  </h2>
                  <p className="mt-1 text-[11px] text-[var(--zd-muted)]">
                    {error instanceof Error ? error.message : 'خطأ في الاتصال بالخادم'}
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="zd-focus flex items-center gap-2 rounded-xl border border-[var(--zd-line)] px-4 py-2 text-[11px] font-semibold text-[var(--zd-text)] transition-colors hover:bg-[var(--zd-surface-2)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> إعادة المحاولة
                </button>
              </div>
            )}

            {/* ── Main Content ── */}
            {!isLoading && !isError && (
              <>
                <DriverMetrics metrics={metrics} />

                <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(400px,.85fr)]">
                  <DriversList
                    filtered={filteredDrivers}
                    totalCount={drivers.length}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    query={searchQuery}
                    setQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    onAdd={() => setModal({ type: 'create' })}
                    onShowAll={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  />

                  <DetailPanel
                    driver={selectedDriver}
                    onToggleStatus={handleToggleStatus}
                    onDelete={(driver) => setModal({ type: 'delete', driver })}
                    onAssignVehicle={(driver) => setModal({ type: 'assign-vehicle', driver })}
                    onUnassignVehicle={handleUnassignVehicle}
                    isChangingStatus={isChangingStatus}
                    isUnassigningVehicle={isUnassigningVehicle}
                  />
                </div>
              </>
            )}

            {/* ── Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--zd-line)] pt-5 text-[10px] text-[var(--zd-muted)] transition-colors">
              <span>زمام لإدارة الأساطيل · إدارة السائقين والعمليات</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--zd-teal)]" />
                البيانات مباشرة من الخادم
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
    </main>
  );
}
