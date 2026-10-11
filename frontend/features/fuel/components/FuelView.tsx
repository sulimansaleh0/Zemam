'use client';

import React from 'react';
import { Fuel } from 'lucide-react';
import { PageHeader, ErrorAlert } from '@/shared/ui';
import {
  useFuelPage,
  useCreateFuel,
  useVerifyFuel,
  useVoidFuel,
  FuelStatsCards,
  FuelTable,
  FuelFormModal,
  FuelDetailModal,
  VerifyFuelModal,
  type CreateFuelInput,
  type VerifyFuelInput,
  type FuelRecordWithRelations,
} from '@/features/fuel';

export function FuelView() {
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
  } = useFuelPage();

  const createFuelMutation = useCreateFuel();
  const verifyFuelMutation = useVerifyFuel();
  const voidFuelMutation = useVoidFuel();

  const handleCreateSubmit = async (data: CreateFuelInput) => {
    await createFuelMutation.mutateAsync(data);
    setIsCreateModalOpen(false);
  };

  const handleVerifyConfirm = async (data: VerifyFuelInput) => {
    await verifyFuelMutation.mutateAsync(data);
    setSelectedRecordForVerify(null);
  };

  const handleVoidRecord = async (record: FuelRecordWithRelations, reason?: string) => {
    await voidFuelMutation.mutateAsync({ id: record._id, reason });
    setSelectedRecordForDetails(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* ── شريط رأس الصفحة الموحد ── */}
      <PageHeader
        title="إدارة واستهلاك الوقود"
        count={pagination?.total}
        description="متابعة فواتير الوقود الميدانية، رصد الكفاءة، ورصيد الوقود المتاح للمركبات"
        icon={Fuel}
        onRefresh={() => refetch()}
        isRefreshing={isRefetching}
        actionLabel="تسجيل إيصال وقود"
        onAction={() => setIsCreateModalOpen(true)}
      />

      {/* ── بطاقات المؤشرات (KPIs) من تجميعات الخادم ── */}
      <FuelStatsCards stats={stats} />

      {/* ── تنبيه الأخطاء الموحد ── */}
      {isError && (
        <ErrorAlert
          title="تعذر تحميل بيانات الوقود"
          error={error}
          onRetry={() => refetch()}
        />
      )}

      {/* ── جدول الوقود مع البحث والترقيم ── */}
      <FuelTable
        records={records}
        pagination={pagination}
        isLoading={isLoading}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
      <FuelFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createFuelMutation.isPending}
        vehicles={vehicles}
      />

      <FuelDetailModal
        isOpen={Boolean(selectedRecordForDetails)}
        onClose={() => setSelectedRecordForDetails(null)}
        record={selectedRecordForDetails}
        onOpenVerify={(record) => setSelectedRecordForVerify(record)}
        onVoidRecord={handleVoidRecord}
        isVoiding={voidFuelMutation.isPending}
      />

      <VerifyFuelModal
        isOpen={Boolean(selectedRecordForVerify)}
        onClose={() => setSelectedRecordForVerify(null)}
        record={selectedRecordForVerify}
        onConfirm={handleVerifyConfirm}
        isLoading={verifyFuelMutation.isPending}
      />
    </div>
  );
}
