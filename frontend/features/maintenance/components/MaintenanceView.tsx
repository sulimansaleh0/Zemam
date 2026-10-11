'use client';

import React from 'react';
import { Wrench } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
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

export function MaintenanceView() {
  const {
    records,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    stats,
    activeTab,
    handleTabChange,
    activeCategory,
    handleCategoryChange,
    selectedVehicleId,
    handleVehicleChange,
    searchQuery,
    handleSearchChange,
    handlePageChange,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedRecordForDetails,
    setSelectedRecordForDetails,
    selectedRecordForVerify,
    setSelectedRecordForVerify,
    vehicles,
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
    <div className="space-y-6" dir="rtl">
      {/* ── شريط رأس الصفحة الموحد ── */}
      <PageHeader
        title="إدارة ومتابعة الصيانة"
        count={pagination?.total}
        description="متابعة بلاغات الأعطال، توثيق أعمال الصيانة الدورية، واعتماد التكاليف المالية للأسطول"
        icon={Wrench}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel="تسجيل طلب صيانة"
        onAction={() => setIsCreateModalOpen(true)}
      />

      {/* ── بطاقات المؤشرات (KPIs) من تجميعات الخادم ── */}
      <MaintenanceStatsCards stats={stats} />

      {/* ── تنبيه الأخطاء الموحد ── */}
      {isError && (
        <ErrorAlert
          title="تعذر تحميل بيانات الصيانة"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* ── جدول الصيانة مع البحث والترقيم ── */}
      <MaintenanceTable
        records={records}
        pagination={pagination}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={handleVehicleChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onViewDetails={(record) => setSelectedRecordForDetails(record)}
        onVerifyRecord={(record) => setSelectedRecordForVerify(record)}
        vehicles={vehicles}
      />

      {/* ── النوافذ المنبثقة (Modals) ── */}
      <MaintenanceFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createMaintenanceMutation.isPending}
        vehicles={vehicles}
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
    </div>
  );
}
