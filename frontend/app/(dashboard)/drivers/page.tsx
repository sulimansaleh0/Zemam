'use client';

import {
  AlertTriangle,
  ChevronLeft,
  FileDown,
  FileSpreadsheet,
  Plus,
  UsersRound,
} from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  DetailPanel,
  DriverDeleteModal,
  DriverMetrics,
  DriverModal,
  DriversList,
  useDrivers,
} from '@/features/drivers';

export default function DriversPage() {
  const {
    drivers,
    filteredDrivers,
    selectedDriver,
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    metrics,
    userName,
    menuOpen,
    setMenuOpen,
    isModalOpen,
    editingDriver,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSaveDriver,
    isDeleteModalOpen,
    driverToDelete,
    setIsDeleteModalOpen,
    promptDelete,
    confirmDelete,
    handleToggleStatus,
    handleExportCSV,
    handleImportClick,
    logout,
  } = useDrivers();

  return (
    <main
      className="zamam-drivers zd-grid min-h-[100dvh] text-[var(--zd-text)]"
      dir="rtl"
    >
      <div className="flex min-h-[100dvh]">
        {/* ── Main Sidebar ── */}
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userName={userName}
          onLogout={logout}
        />

        {/* ── Mobile Overlay ── */}
        {menuOpen && (
          <button
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ── Content Container ── */}
        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName={userName}
          />

          <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
            {/* ── Page Header / Hero ── */}
            <section className="zd-rise mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] text-[var(--zd-muted)]">
                  <UsersRound className="h-3.5 w-3.5" /> مساحة التشغيل{' '}
                  <span className="opacity-40">/</span> إدارة السائقين
                </div>
                <h1 className="text-[26px] font-bold tracking-[-.04em] text-[var(--zd-text)] sm:text-[32px]">
                  السائقون{' '}
                  <span className="mr-1 font-manrope text-[18px] font-semibold text-[var(--zd-blue)]">
                    {drivers.length}
                  </span>
                </h1>
                <p className="mt-1 max-w-[560px] text-[12px] leading-6 text-[var(--zd-muted)]">
                  اعثر على السائق المناسب بسرعة، وتابع جاهزية الرخص والأداء التشغيلي
                  من مكان واحد.
                </p>
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportCSV}
                  className="zd-focus flex items-center gap-2 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] px-4 py-2.5 text-[11px] font-semibold text-[var(--zd-text)] hover:border-[var(--zd-blue)] shadow-xs transition-colors"
                >
                  <FileDown className="h-4 w-4" /> تصدير القائمة (CSV)
                </button>
                <button
                  onClick={handleImportClick}
                  className="zd-focus flex items-center gap-2 rounded-xl border border-[var(--zd-blue)]/35 bg-[var(--zd-blue)]/10 px-4 py-2.5 text-[11px] font-semibold text-[var(--zd-blue)] hover:bg-[var(--zd-blue)]/20 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4" /> استيراد CSV / Excel
                </button>
                <button
                  onClick={openCreateModal}
                  className="zd-focus flex items-center gap-2 rounded-xl bg-[var(--zd-blue)] px-5 py-2.5 text-[11px] font-semibold text-white shadow-[0_9px_22px_rgba(37,99,235,.2)] hover:opacity-95 transition-opacity"
                >
                  <Plus className="h-4 w-4" /> إضافة سائق
                </button>
              </div>
            </section>

            {/* ── Driver Metrics Cards ── */}
            <DriverMetrics metrics={metrics} />

            {/* ── Expiry Alert Banner ── */}
            {metrics.expiringSoon > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--zd-amber)]/25 bg-[var(--zd-amber)]/10 px-4 py-3 text-[11px] text-[var(--zd-amber)] font-medium transition-colors">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--zd-amber)]" />
                  <b>
                    {metrics.expiringSoon} رخص قيادة تنتهي قريباً وتحتاج إلى
                    متابعة وتجديد.
                  </b>
                  <span className="hidden opacity-75 sm:inline">
                    راجع ملفات السائقين قبل موعد التجديد.
                  </span>
                </span>
                <button
                  onClick={() => setStatusFilter('نشط')}
                  className="zd-focus rounded-lg border border-[var(--zd-amber)]/40 px-3 py-1.5 font-semibold text-[var(--zd-amber)] hover:bg-[var(--zd-amber)]/15 transition-colors"
                >
                  مراجعة الآن <ChevronLeft className="mr-1 inline h-3 w-3" />
                </button>
              </div>
            )}

            {/* ── Main Split Grid (List & Details) ── */}
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
                onAdd={openCreateModal}
                onShowAll={() => {
                  setSearchQuery('');
                  setStatusFilter('الكل');
                }}
              />

              <DetailPanel
                driver={selectedDriver}
                onEdit={() => openEditModal(selectedDriver || undefined)}
                onToggleStatus={handleToggleStatus}
                onDelete={() => promptDelete(selectedDriver || undefined)}
              />
            </div>

            {/* ── Page Footer ── */}
            <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--zd-line)] pt-5 text-[10px] text-[var(--zd-muted)] transition-colors">
              <span>زمام لإدارة الأساطيل · إدارة السائقين والعمليات</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--zd-teal)]" />
                بيانات السائقين محمية ومحدثة محلياً
              </span>
            </footer>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Driver Modal ── */}
      {isModalOpen && (
        <DriverModal
          editing={editingDriver}
          onClose={closeModal}
          onSave={handleSaveDriver}
        />
      )}

      {/* ── Delete Driver Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <DriverDeleteModal
          driver={driverToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}
