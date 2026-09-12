'use client';

import React from 'react';
import { AlertCircle, Plus, RefreshCw, Wrench } from 'lucide-react';
import { Sidebar, Header } from '@/features/dashboard';
import {
  useMaintenancePage,
  useCreateMaintenance,
  useVerifyMaintenance,
  MaintenanceStatsCards,
  MaintenanceTable,
  MaintenanceFormModal,
  MaintenanceDetailModal,
  VerifyMaintenanceModal,
  type CreateMaintenanceInput,
  type VerifyMaintenanceInput,
} from '@/features/maintenance';

export default function MaintenancePage() {
  const {
    records,
    allRecordsCount,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    stats,
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedRecordForDetails,
    setSelectedRecordForDetails,
    selectedRecordForVerify,
    setSelectedRecordForVerify,
    vehicles,
    userName,
    menuOpen,
    setMenuOpen,
    logout,
  } = useMaintenancePage();

  const createMaintenanceMutation = useCreateMaintenance();
  const verifyMaintenanceMutation = useVerifyMaintenance();

  const handleCreateSubmit = async (data: CreateMaintenanceInput) => {
    await createMaintenanceMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleVerifyConfirm = async (data: VerifyMaintenanceInput) => {
    await verifyMaintenanceMutation.mutateAsync(data);
    setSelectedRecordForVerify(null);
  };

  return (
    <main className="zamam-dashboard zd-grid min-h-[100dvh] text-[var(--zd-text)]" dir="rtl">
      <div className="flex min-h-[100dvh]">
        {/* ── القائمة الجانبية ── */}
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

        {/* ── مساحة المحتوى الرئيسي ── */}
        <div className="min-w-0 flex-1">
          <Header
            onMenu={() => setMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            userName={userName}
          />

          <div className="p-4 md:p-6 lg:p-8 space-y-6 flex-1">
            {/* ── شريط رأس الصفحة وأزرار الإجراءات ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--zd-text)] flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-[var(--zd-blue)]" />
                  <span>إدارة ومتابعة الصيانة ({allRecordsCount})</span>
                </h1>
                <p className="mt-1 text-xs text-[var(--zd-muted)]">
                  متابعة بلاغات الأعطال، توثيق أعمال الصيانة الدورية، واعتماد التكاليف المالية للأسطول
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  title="تحديث البيانات"
                  className="flex items-center justify-center h-9 w-9 rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface)] text-[var(--zd-muted)] hover:text-[var(--zd-text)] hover:border-[var(--zd-line-hover)] transition cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--zd-blue)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-600 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>تسجيل طلب صيانة</span>
                </button>
              </div>
            </div>

            {/* ── بطاقات المؤشرات (KPIs) ── */}
            <MaintenanceStatsCards stats={stats} />

            {/* ── رسائل الخطأ ── */}
            {isError && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">تعذر تحميل بيانات الصيانة</p>
                  <p className="mt-0.5 opacity-80">
                    {error instanceof Error ? error.message : 'حدث خطأ في الاتصال بالخادم'}
                  </p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="rounded-lg bg-rose-500/20 px-3 py-1.5 font-semibold hover:bg-rose-500/30 cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* ── جدول الصيانة ── */}
            <MaintenanceTable
              records={records}
              isLoading={isLoading}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onViewDetails={(record) => setSelectedRecordForDetails(record)}
              onVerifyRecord={(record) => setSelectedRecordForVerify(record)}
            />
          </div>
        </div>
      </div>

      {/* ── النوافذ المنبثقة (Modals) ── */}
      <MaintenanceFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMaintenanceMutation.isPending}
        vehicles={vehicles as any}
      />

      <MaintenanceDetailModal
        isOpen={Boolean(selectedRecordForDetails)}
        onClose={() => setSelectedRecordForDetails(null)}
        record={selectedRecordForDetails}
        onOpenVerify={(record) => setSelectedRecordForVerify(record)}
      />

      <VerifyMaintenanceModal
        isOpen={Boolean(selectedRecordForVerify)}
        onClose={() => setSelectedRecordForVerify(null)}
        record={selectedRecordForVerify}
        onConfirm={handleVerifyConfirm}
        isLoading={verifyMaintenanceMutation.isPending}
      />
    </main>
  );
}
